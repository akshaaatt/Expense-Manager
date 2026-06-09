"use server"

import { db } from "@/lib/db"
import { cards, categories, expenses } from "@/lib/db/schema"
import { getUserId } from "@/lib/get-user"
import { and, desc, eq, gte, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type ExpenseRow = {
  id: number
  description: string
  amount: string
  categoryId: number | null
  cardId: number | null
  paymentMethod: string
  spentAt: Date
  notes: string | null
  categoryName: string | null
  categoryColor: string | null
  cardName: string | null
}

export async function getExpenses(limit?: number): Promise<ExpenseRow[]> {
  const userId = await getUserId()
  const q = db
    .select({
      id: expenses.id,
      description: expenses.description,
      amount: expenses.amount,
      categoryId: expenses.categoryId,
      cardId: expenses.cardId,
      paymentMethod: expenses.paymentMethod,
      spentAt: expenses.spentAt,
      notes: expenses.notes,
      categoryName: categories.name,
      categoryColor: categories.color,
      cardName: cards.name,
    })
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .leftJoin(cards, eq(expenses.cardId, cards.id))
    .where(eq(expenses.userId, userId))
    .orderBy(desc(expenses.spentAt))

  if (limit) return q.limit(limit)
  return q
}

export async function createExpense(input: {
  description: string
  amount: number
  categoryId?: number | null
  cardId?: number | null
  paymentMethod: string
  spentAt?: string
  notes?: string
}) {
  const userId = await getUserId()
  const description = input.description.trim()
  if (!description) throw new Error("Description is required")
  if (!input.amount || input.amount <= 0) throw new Error("Amount must be greater than 0")

  await db.insert(expenses).values({
    userId,
    description,
    amount: input.amount.toFixed(2),
    categoryId: input.categoryId ?? null,
    cardId: input.cardId ?? null,
    paymentMethod: input.paymentMethod || "cash",
    spentAt: input.spentAt ? new Date(input.spentAt) : new Date(),
    notes: input.notes?.trim() || null,
  })

  // If charged to a card, increase its outstanding balance.
  if (input.cardId) {
    await db
      .update(cards)
      .set({ currentBalance: sql`${cards.currentBalance} + ${input.amount}` })
      .where(and(eq(cards.id, input.cardId), eq(cards.userId, userId)))
  }

  revalidatePath("/expenses")
  revalidatePath("/cards")
  revalidatePath("/")
}

export async function deleteExpense(id: number) {
  const userId = await getUserId()
  const [row] = await db
    .select({ cardId: expenses.cardId, amount: expenses.amount })
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))

  await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))

  if (row?.cardId) {
    await db
      .update(cards)
      .set({ currentBalance: sql`greatest(${cards.currentBalance} - ${row.amount}, 0)` })
      .where(and(eq(cards.id, row.cardId), eq(cards.userId, userId)))
  }

  revalidatePath("/expenses")
  revalidatePath("/cards")
  revalidatePath("/")
}

export type MonthlyPoint = { month: string; total: number }

/** Totals for the last 6 months including the current month. */
export async function getMonthlyTotals(): Promise<MonthlyPoint[]> {
  const userId = await getUserId()
  const start = new Date()
  start.setMonth(start.getMonth() - 5)
  start.setDate(1)
  start.setHours(0, 0, 0, 0)

  const rows = await db
    .select({
      month: sql<string>`to_char(${expenses.spentAt}, 'YYYY-MM')`,
      total: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(and(eq(expenses.userId, userId), gte(expenses.spentAt, start)))
    .groupBy(sql`to_char(${expenses.spentAt}, 'YYYY-MM')`)

  const map = new Map(rows.map((r) => [r.month, Number(r.total)]))
  const points: MonthlyPoint[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleString("en-IN", { month: "short" })
    points.push({ month: label, total: map.get(key) ?? 0 })
  }
  return points
}

/** Total spent in the current calendar month. */
export async function getCurrentMonthSpend(): Promise<number> {
  const userId = await getUserId()
  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)
  const [row] = await db
    .select({ total: sql<string>`coalesce(sum(${expenses.amount}), 0)` })
    .from(expenses)
    .where(and(eq(expenses.userId, userId), gte(expenses.spentAt, start)))
  return Number(row?.total ?? 0)
}

"use server"

import { db } from "@/lib/db"
import { debts } from "@/lib/db/schema"
import { getUserId } from "@/lib/get-user"
import { and, asc, desc, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getDebts() {
  const userId = await getUserId()
  return db
    .select()
    .from(debts)
    .where(eq(debts.userId, userId))
    .orderBy(asc(debts.settled), desc(debts.createdAt))
}

export type DebtTotals = { owedToMe: number; iOwe: number }

/** Net outstanding (unsettled) totals in each direction. */
export async function getDebtTotals(): Promise<DebtTotals> {
  const userId = await getUserId()
  const rows = await db
    .select({
      direction: debts.direction,
      total: sql<string>`coalesce(sum(${debts.amount}), 0)`,
    })
    .from(debts)
    .where(and(eq(debts.userId, userId), eq(debts.settled, false)))
    .groupBy(debts.direction)

  const totals: DebtTotals = { owedToMe: 0, iOwe: 0 }
  for (const r of rows) {
    if (r.direction === "owed_to_me") totals.owedToMe = Number(r.total)
    else if (r.direction === "i_owe") totals.iOwe = Number(r.total)
  }
  return totals
}

export async function createDebt(input: {
  person: string
  amount: number
  direction: "owed_to_me" | "i_owe"
  description?: string
  dueDate?: string
}) {
  const userId = await getUserId()
  const person = input.person.trim()
  if (!person) throw new Error("Person name is required")
  if (!input.amount || input.amount <= 0) throw new Error("Amount must be greater than 0")

  await db.insert(debts).values({
    userId,
    person,
    amount: input.amount.toFixed(2),
    direction: input.direction,
    description: input.description?.trim() || null,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
  })
  revalidatePath("/debts")
  revalidatePath("/")
}

export async function toggleDebtSettled(id: number, settled: boolean) {
  const userId = await getUserId()
  await db
    .update(debts)
    .set({ settled })
    .where(and(eq(debts.id, id), eq(debts.userId, userId)))
  revalidatePath("/debts")
  revalidatePath("/")
}

export async function deleteDebt(id: number) {
  const userId = await getUserId()
  await db
    .delete(debts)
    .where(and(eq(debts.id, id), eq(debts.userId, userId)))
  revalidatePath("/debts")
  revalidatePath("/")
}

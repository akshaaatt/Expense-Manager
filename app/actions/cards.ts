"use server"

import { db } from "@/lib/db"
import { cards } from "@/lib/db/schema"
import { getUserId } from "@/lib/get-user"
import { and, asc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getCards() {
  const userId = await getUserId()
  return db
    .select()
    .from(cards)
    .where(eq(cards.userId, userId))
    .orderBy(asc(cards.name))
}

export async function createCard(input: {
  name: string
  issuer?: string
  lastFour?: string
  creditLimit?: number | null
  currentBalance?: number
  statementDay?: number | null
  dueDay?: number | null
  color?: string
}) {
  const userId = await getUserId()
  const name = input.name.trim()
  if (!name) throw new Error("Card name is required")

  await db.insert(cards).values({
    userId,
    name,
    issuer: input.issuer?.trim() || null,
    lastFour: input.lastFour?.trim() || null,
    creditLimit: input.creditLimit != null ? input.creditLimit.toFixed(2) : null,
    currentBalance: (input.currentBalance ?? 0).toFixed(2),
    statementDay: input.statementDay ?? null,
    dueDay: input.dueDay ?? null,
    color: input.color || "#0f172a",
  })
  revalidatePath("/cards")
  revalidatePath("/")
}

export async function updateCard(
  id: number,
  input: {
    name: string
    issuer?: string
    lastFour?: string
    creditLimit?: number | null
    currentBalance?: number
    statementDay?: number | null
    dueDay?: number | null
    color?: string
  },
) {
  const userId = await getUserId()
  await db
    .update(cards)
    .set({
      name: input.name.trim(),
      issuer: input.issuer?.trim() || null,
      lastFour: input.lastFour?.trim() || null,
      creditLimit: input.creditLimit != null ? input.creditLimit.toFixed(2) : null,
      currentBalance: (input.currentBalance ?? 0).toFixed(2),
      statementDay: input.statementDay ?? null,
      dueDay: input.dueDay ?? null,
      ...(input.color ? { color: input.color } : {}),
    })
    .where(and(eq(cards.id, id), eq(cards.userId, userId)))
  revalidatePath("/cards")
  revalidatePath("/")
}

export async function deleteCard(id: number) {
  const userId = await getUserId()
  await db.delete(cards).where(and(eq(cards.id, id), eq(cards.userId, userId)))
  revalidatePath("/cards")
  revalidatePath("/")
}

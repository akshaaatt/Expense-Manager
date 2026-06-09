"use server"

import { db } from "@/lib/db"
import { categories, expenses } from "@/lib/db/schema"
import { getUserId } from "@/lib/get-user"
import { and, asc, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getCategories() {
  const userId = await getUserId()
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.name))
}

export type CategoryWithSpend = {
  id: number
  name: string
  color: string
  icon: string
  total: number
  count: number
}

export async function getCategoriesWithSpend(): Promise<CategoryWithSpend[]> {
  const userId = await getUserId()
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
      icon: categories.icon,
      total: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
      count: sql<number>`count(${expenses.id})`,
    })
    .from(categories)
    .leftJoin(
      expenses,
      and(eq(expenses.categoryId, categories.id), eq(expenses.userId, userId)),
    )
    .where(eq(categories.userId, userId))
    .groupBy(categories.id)
    .orderBy(asc(categories.name))

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    color: r.color,
    icon: r.icon,
    total: Number(r.total),
    count: Number(r.count),
  }))
}

export async function createCategory(input: {
  name: string
  color: string
  icon?: string
}) {
  const userId = await getUserId()
  const name = input.name.trim()
  if (!name) throw new Error("Category name is required")
  await db.insert(categories).values({
    userId,
    name,
    color: input.color || "#16a34a",
    icon: input.icon || "tag",
  })
  revalidatePath("/categories")
  revalidatePath("/")
}

export async function updateCategory(
  id: number,
  input: { name: string; color: string; icon?: string },
) {
  const userId = await getUserId()
  await db
    .update(categories)
    .set({
      name: input.name.trim(),
      color: input.color,
      ...(input.icon ? { icon: input.icon } : {}),
    })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
  revalidatePath("/categories")
  revalidatePath("/")
}

export async function deleteCategory(id: number) {
  const userId = await getUserId()
  // Detach expenses from this category so they aren't lost.
  await db
    .update(expenses)
    .set({ categoryId: null })
    .where(and(eq(expenses.categoryId, id), eq(expenses.userId, userId)))
  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
  revalidatePath("/categories")
  revalidatePath("/")
}

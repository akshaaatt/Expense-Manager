"use server"

import { db } from "@/lib/db"
import { userPreferences } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getUserId } from "@/lib/get-user"
import { CURRENCIES, LOCALES } from "@/lib/format"

export type PreferencesInput = {
  currency: string
  locale: string
  numberFormat: "standard" | "compact"
  theme: "light" | "dark" | "system"
}

export async function updatePreferences(input: PreferencesInput) {
  const userId = await getUserId()

  // Validate inputs to avoid persisting garbage.
  if (!CURRENCIES.some((c) => c.code === input.currency)) {
    throw new Error("Invalid currency")
  }
  if (!LOCALES.some((l) => l.code === input.locale)) {
    throw new Error("Invalid locale")
  }
  if (!["standard", "compact"].includes(input.numberFormat)) {
    throw new Error("Invalid number format")
  }
  if (!["light", "dark", "system"].includes(input.theme)) {
    throw new Error("Invalid theme")
  }

  await db
    .insert(userPreferences)
    .values({
      userId,
      currency: input.currency,
      locale: input.locale,
      numberFormat: input.numberFormat,
      theme: input.theme,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: {
        currency: input.currency,
        locale: input.locale,
        numberFormat: input.numberFormat,
        theme: input.theme,
        updatedAt: new Date(),
      },
    })

  revalidatePath("/", "layout")
}

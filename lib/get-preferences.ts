import "server-only"

import { db } from "@/lib/db"
import { userPreferences } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getUserId } from "@/lib/get-user"
import { DEFAULT_PREFERENCES } from "@/lib/format"

export type UserPreferences = typeof DEFAULT_PREFERENCES

/**
 * Resolve the current user's preferences. If the user has no row yet,
 * insert a default one and return that. Cached per-request via React's
 * `cache()`.
 */
export async function getPreferences(): Promise<UserPreferences> {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1)

  if (rows.length > 0) {
    const r = rows[0]
    return {
      currency: r.currency || DEFAULT_PREFERENCES.currency,
      locale: r.locale || DEFAULT_PREFERENCES.locale,
      numberFormat:
        (r.numberFormat as "standard" | "compact") ||
        DEFAULT_PREFERENCES.numberFormat,
      theme: (r.theme as "light" | "dark" | "system") || DEFAULT_PREFERENCES.theme,
    }
  }

  // First-time user — create defaults and return them.
  await db
    .insert(userPreferences)
    .values({
      userId,
      currency: DEFAULT_PREFERENCES.currency,
      locale: DEFAULT_PREFERENCES.locale,
      numberFormat: DEFAULT_PREFERENCES.numberFormat,
      theme: DEFAULT_PREFERENCES.theme,
      updatedAt: new Date(),
    })
    .onConflictDoNothing()

  return { ...DEFAULT_PREFERENCES }
}

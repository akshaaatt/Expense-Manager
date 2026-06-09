import "server-only"

import { db } from "@/lib/db"
import { userPreferences } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getUserId } from "@/lib/get-user"
import { DEFAULT_PREFERENCES } from "@/lib/format"

export type UserPreferences = typeof DEFAULT_PREFERENCES

/**
 * Resolve the current user's preferences. If the user has no row yet,
 * or the `user_preferences` table doesn't exist yet, return the
 * default preferences without writing to the DB. The row is created
 * lazily the first time the user saves their settings.
 *
 * This intentionally avoids a write on the request path so the app
 * still boots even before the migration is applied to the production
 * database.
 */
export async function getPreferences(): Promise<UserPreferences> {
  const userId = await getUserId()
  try {
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
        theme:
          (r.theme as "light" | "dark" | "system") ||
          DEFAULT_PREFERENCES.theme,
      }
    }
  } catch {
    // Likely the user_preferences table doesn't exist yet (migration not
    // applied). Fall through to defaults — the page will still render.
  }

  return { ...DEFAULT_PREFERENCES }
}

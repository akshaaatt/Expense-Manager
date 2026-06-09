import type { ReactNode } from "react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { getPreferences } from "@/lib/get-preferences"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  // Prefs can fail (e.g. user_preferences table not migrated yet). Fall back
  // to defaults so the page still renders.
  let userName = session.user.name || session.user.email
  const userEmail = session.user.email
  let prefs
  try {
    prefs = await getPreferences()
  } catch {
    prefs = {
      currency: "USD",
      locale: "en-US",
      numberFormat: "standard" as const,
      theme: "system" as const,
    }
  }

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar userName={userName} userEmail={userEmail} />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  )
}

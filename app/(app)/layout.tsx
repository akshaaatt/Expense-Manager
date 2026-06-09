import type { ReactNode } from "react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { getPreferences } from "@/lib/get-preferences"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const prefs = await getPreferences()

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar
        userName={session.user.name || session.user.email}
        userEmail={session.user.email}
      />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  )
}

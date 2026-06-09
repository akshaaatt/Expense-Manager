import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { Wallet } from "lucide-react"

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/")
  return (
    <main className="bg-mesh relative flex min-h-svh items-center justify-center px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,transparent_0%,var(--background)_70%)]"
      />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Wallet className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Paisa</h1>
          <p className="text-sm text-muted-foreground">
            Personal expense manager
          </p>
        </div>
        <AuthForm mode="sign-in" />
      </div>
    </main>
  )
}

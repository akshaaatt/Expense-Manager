import { PageHeader } from "@/components/page-header"
import { getDebts } from "@/app/actions/debts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DebtManager } from "@/components/debt-manager"
import { DebtList } from "@/components/debt-list"
import { formatCurrency } from "@/lib/format"
import { getPreferences } from "@/lib/get-preferences"
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react"

type DebtListRow = {
  id: number
  person: string
  amount: string
  direction: "owed_to_me" | "i_owe"
  description: string | null
  dueDate: Date | null
  settled: boolean
}

export default async function DebtsPage() {
  const [debts, prefs] = await Promise.all([getDebts(), getPreferences()])
  const moneyOpts = {
    currency: prefs.currency,
    locale: prefs.locale,
    numberFormat: prefs.numberFormat,
  } as const

  // The DB returns `direction` as a generic string; narrow to the literal
  // union the list component expects.
  const listDebts: DebtListRow[] = debts.map((d) => ({
    ...d,
    direction: d.direction as "owed_to_me" | "i_owe",
  }))

  const owedToMe = listDebts.filter((d) => d.direction === "owed_to_me" && !d.settled)
  const iOwe = listDebts.filter((d) => d.direction === "i_owe" && !d.settled)
  const settled = listDebts.filter((d) => d.settled)

  const totalOwedToMe = owedToMe.reduce((sum, d) => sum + Number(d.amount), 0)
  const totalIOwe = iOwe.reduce((sum, d) => sum + Number(d.amount), 0)
  const net = totalOwedToMe - totalIOwe

  return (
    <div className="space-y-8">
      <PageHeader
        title="Owed & Credit"
        description="Track money you owe and money owed to you."
        action={<DebtManager />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowDownToLine className="size-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Owed to you</p>
              <p className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalOwedToMe, moneyOpts)}
              </p>
              <p className="text-xs text-muted-foreground">
                {owedToMe.length} pending
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <ArrowUpFromLine className="size-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">You owe</p>
              <p className="text-lg font-semibold tabular-nums text-destructive">
                {formatCurrency(totalIOwe, moneyOpts)}
              </p>
              <p className="text-xs text-muted-foreground">
                {iOwe.length} pending
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <span className="text-xs font-semibold">Σ</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net position</p>
              <p
                className={
                  "text-lg font-semibold tabular-nums " +
                  (net >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive")
                }
              >
                {formatCurrency(Math.abs(net), { ...moneyOpts, showSign: net < 0 })}
              </p>
              <p className="text-xs text-muted-foreground">
                {net >= 0 ? "In your favor" : "You owe more"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <DebtList debts={listDebts} moneyOpts={moneyOpts} />

      {settled.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {settled.length} settled debt{settled.length === 1 ? "" : "s"} shown
          above.
        </p>
      )}
    </div>
  )
}

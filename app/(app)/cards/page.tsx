import { PageHeader } from "@/components/page-header"
import { getCards } from "@/app/actions/cards"
import { CardManager } from "@/components/card-manager"
import { getPreferences } from "@/lib/get-preferences"
import { formatCurrency } from "@/lib/format"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, TrendingUp } from "lucide-react"
import { CreditCardVisual } from "@/components/credit-card-visual"

export default async function CardsPage() {
  const [cards, prefs] = await Promise.all([getCards(), getPreferences()])
  const moneyOpts = {
    currency: prefs.currency,
    locale: prefs.locale,
    numberFormat: prefs.numberFormat,
  } as const

  const totalOutstanding = cards.reduce((s, c) => s + Number(c.currentBalance), 0)
  const totalLimit = cards.reduce((s, c) => s + Number(c.creditLimit ?? 0), 0)
  const overallUtilization =
    totalLimit > 0 ? Math.min((totalOutstanding / totalLimit) * 100, 100) : null

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cards"
        description="Your credit cards and their outstanding balances."
      />

      {cards.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CreditCard className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total outstanding</p>
                <p className="text-lg font-semibold tabular-nums">
                  {formatCurrency(totalOutstanding, moneyOpts)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <TrendingUp className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total limit</p>
                <p className="text-lg font-semibold tabular-nums">
                  {formatCurrency(totalLimit, moneyOpts)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <span className="text-xs font-semibold">%</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Utilization</p>
                <p className="text-lg font-semibold tabular-nums">
                  {overallUtilization !== null
                    ? `${overallUtilization.toFixed(0)}%`
                    : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {cards.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <CreditCardVisual
              key={c.id}
              name={c.name}
              issuer={c.issuer}
              lastFour={c.lastFour}
              balance={Number(c.currentBalance)}
              limit={c.creditLimit ? Number(c.creditLimit) : null}
              dueDay={c.dueDay}
              color={c.color}
              moneyOpts={moneyOpts}
            />
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Manage</CardTitle>
          <CardDescription>Add, edit, or remove cards.</CardDescription>
        </CardHeader>
        <CardContent>
          <CardManager cards={cards} moneyOpts={moneyOpts} />
        </CardContent>
      </Card>
    </div>
  )
}

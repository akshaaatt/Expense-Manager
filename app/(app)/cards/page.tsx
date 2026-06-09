import { PageHeader } from "@/components/page-header"
import { getCards } from "@/app/actions/cards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard } from "lucide-react"
import { formatINR } from "@/lib/format"

export default async function CardsPage() {
  const cards = await getCards()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cards"
        description="Your credit cards and their outstanding balances."
      />

      {cards.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No cards added yet. Cards can be added when recording an expense.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((c) => {
            const limit = c.creditLimit ? Number(c.creditLimit) : null
            const balance = Number(c.currentBalance)
            const utilization = limit && limit > 0 ? (balance / limit) * 100 : null
            return (
              <Card key={c.id} style={{ borderLeft: `4px solid ${c.color}` }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="size-4" />
                    {c.name}
                  </CardTitle>
                  <CardDescription>
                    {c.issuer || "Issuer unknown"}
                    {c.lastFour ? ` •••• ${c.lastFour}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Outstanding</p>
                    <p className="text-2xl font-bold">{formatINR(balance)}</p>
                  </div>
                  {limit !== null && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Credit limit {formatINR(limit)}
                        {utilization !== null && ` (${utilization.toFixed(0)}% used)`}
                      </p>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${Math.min(utilization ?? 0, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {c.dueDay && (
                    <p className="text-xs text-muted-foreground">
                      Payment due on day {c.dueDay} of each month
                    </p>
                  )}
                  {c.statementDay && (
                    <p className="text-xs text-muted-foreground">
                      Statement generated on day {c.statementDay}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

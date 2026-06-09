import { PageHeader } from "@/components/page-header"
import { getDebts } from "@/app/actions/debts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatINR, formatDate, daysUntil } from "@/lib/format"
import { ArrowLeftRight, CheckCircle2, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleDebtSettled, deleteDebt } from "@/app/actions/debts"
import { Badge } from "@/components/ui/badge"

export default async function DebtsPage() {
  const debts = await getDebts()
  const owedToMe = debts.filter((d) => d.direction === "owed_to_me" && !d.settled)
  const iOwe = debts.filter((d) => d.direction === "i_owe" && !d.settled)
  const settled = debts.filter((d) => d.settled)

  const totalOwedToMe = owedToMe.reduce((sum, d) => sum + Number(d.amount), 0)
  const totalIOwe = iOwe.reduce((sum, d) => sum + Number(d.amount), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owed & Credit"
        description="Track money you owe and money owed to you."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Owed to You</CardTitle>
            <CardDescription>{owedToMe.length} pending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatINR(totalOwedToMe)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>You Owe</CardTitle>
            <CardDescription>{iOwe.length} pending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {formatINR(totalIOwe)}
            </div>
          </CardContent>
        </Card>
      </div>

      {debts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No debts recorded yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="size-4" />
              All Debts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {debts.map((d) => {
                const dueDays = d.dueDate ? daysUntil(d.dueDate) : null
                return (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {d.settled ? (
                          <CheckCircle2 className="size-4 text-primary" />
                        ) : (
                          <Circle className="size-4 text-muted-foreground" />
                        )}
                        <p
                          className={
                            d.settled
                              ? "truncate text-sm text-muted-foreground line-through"
                              : "truncate text-sm font-medium"
                          }
                        >
                          {d.person}
                        </p>
                        <Badge variant={d.direction === "owed_to_me" ? "default" : "destructive"}>
                          {d.direction === "owed_to_me" ? "Owed to you" : "You owe"}
                        </Badge>
                      </div>
                      {d.description && (
                        <p className="ml-6 mt-0.5 truncate text-xs text-muted-foreground">
                          {d.description}
                        </p>
                      )}
                      {d.dueDate && (
                        <p className="ml-6 mt-0.5 text-xs text-muted-foreground">
                          Due {formatDate(d.dueDate)}
                          {dueDays !== null && !d.settled && (
                            <>
                              {" "}
                              {dueDays === 0
                                ? "(today)"
                                : dueDays > 0
                                  ? `(in ${dueDays}d)`
                                  : `(${Math.abs(dueDays)}d overdue)`}
                            </>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{formatINR(Number(d.amount))}</span>
                      <form
                        action={async () => {
                          "use server"
                          await toggleDebtSettled(d.id, !d.settled)
                        }}
                      >
                        <Button variant="ghost" size="sm" type="submit">
                          {d.settled ? "Reopen" : "Settle"}
                        </Button>
                      </form>
                      <form
                        action={async () => {
                          "use server"
                          await deleteDebt(d.id)
                        }}
                      >
                        <Button variant="ghost" size="sm" type="submit" className="text-destructive">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {settled.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {settled.length} settled debt{settled.length === 1 ? "" : "s"} hidden above.
        </p>
      )}
    </div>
  )
}

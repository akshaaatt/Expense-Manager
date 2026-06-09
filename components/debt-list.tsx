"use client"

import { useState, useTransition } from "react"
import { ArrowLeftRight, CheckCircle2, Circle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, daysUntil } from "@/lib/format"
import { toggleDebtSettled, deleteDebt } from "@/app/actions/debts"

type DebtRow = {
  id: number
  person: string
  amount: string
  direction: "owed_to_me" | "i_owe"
  description: string | null
  dueDate: Date | null
  settled: boolean
}

type MoneyOpts = {
  currency: string
  locale: string
  numberFormat: "standard" | "compact"
}

export function DebtList({
  debts,
  moneyOpts,
}: {
  debts: DebtRow[]
  moneyOpts: MoneyOpts
}) {
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [, startTransition] = useTransition()

  function handleToggle(d: DebtRow) {
    setPendingId(d.id)
    startTransition(async () => {
      try {
        await toggleDebtSettled(d.id, !d.settled)
        toast.success(d.settled ? "Reopened" : "Marked as settled")
      } catch {
        toast.error("Failed to update debt")
      } finally {
        setPendingId(null)
      }
    })
  }

  function handleDelete(d: DebtRow) {
    setPendingId(d.id)
    startTransition(async () => {
      try {
        await deleteDebt(d.id)
        toast.success("Debt deleted")
      } catch {
        toast.error("Failed to delete debt")
      } finally {
        setPendingId(null)
      }
    })
  }

  if (debts.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No debts recorded yet. Use "Add Debt" above to create one.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="size-4" />
          All debts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {debts.map((d) => {
            const dueDays = d.dueDate ? daysUntil(d.dueDate) : null
            const isPending = pendingId === d.id
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
                    <Badge
                      variant={
                        d.direction === "owed_to_me" ? "default" : "destructive"
                      }
                    >
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
                      Due {formatDate(d.dueDate, moneyOpts.locale)}
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
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(Number(d.amount), moneyOpts)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggle(d)}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : d.settled ? (
                      "Reopen"
                    ) : (
                      "Settle"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(d)}
                    disabled={isPending}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

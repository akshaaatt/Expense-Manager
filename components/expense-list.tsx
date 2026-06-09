"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { deleteExpense, type ExpenseRow } from "@/app/actions/expenses"
import { formatCurrency, formatDate, PAYMENT_METHODS } from "@/lib/format"

function methodLabel(value: string) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value
}

type MoneyOpts = {
  currency: string
  locale: string
  numberFormat: "standard" | "compact"
}

export function ExpenseList({
  expenses,
  moneyOpts,
}: {
  expenses: ExpenseRow[]
  moneyOpts: MoneyOpts
}) {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await deleteExpense(id)
      toast.success("Expense deleted")
    } catch {
      toast.error("Failed to delete expense")
    } finally {
      setDeletingId(null)
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No expenses yet. Add your first spend to get started.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium text-foreground">
                  {e.description}
                  {e.notes && (
                    <span className="block text-xs text-muted-foreground">{e.notes}</span>
                  )}
                </TableCell>
                <TableCell>
                  {e.categoryName ? (
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: e.categoryColor ?? "#999" }}
                      />
                      {e.categoryName}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Uncategorized</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {methodLabel(e.paymentMethod)}
                  {e.cardName && (
                    <span className="block text-xs">{e.cardName}</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(e.spentAt, moneyOpts.locale)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatCurrency(e.amount, moneyOpts)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(e.id)}
                    disabled={deletingId === e.id}
                    aria-label="Delete expense"
                  >
                    {deletingId === e.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {expenses.map((e) => (
          <div
            key={e.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{e.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(e.spentAt, moneyOpts.locale)} · {methodLabel(e.paymentMethod)}
                </p>
              </div>
              <p className="shrink-0 font-semibold tabular-nums">
                {formatCurrency(e.amount, moneyOpts)}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              {e.categoryName ? (
                <Badge variant="secondary" className="gap-1.5">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: e.categoryColor ?? "#999" }}
                  />
                  {e.categoryName}
                </Badge>
              ) : (
                <Badge variant="outline">Uncategorized</Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(e.id)}
                disabled={deletingId === e.id}
                aria-label="Delete expense"
              >
                {deletingId === e.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

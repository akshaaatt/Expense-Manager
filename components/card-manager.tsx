"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCard, updateCard, deleteCard } from "@/app/actions/cards"
import { formatCurrency } from "@/lib/format"

const CARD_COLORS = [
  "#1e293b",
  "#0ea5e9",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#6366f1",
]

type CardRow = {
  id: number
  name: string
  issuer: string | null
  lastFour: string | null
  creditLimit: string | null
  currentBalance: string
  statementDay: number | null
  dueDay: number | null
  color: string
}

type MoneyOpts = {
  currency: string
  locale: string
  numberFormat: "standard" | "compact"
}

export function CardManager({
  cards,
  moneyOpts,
}: {
  cards: CardRow[]
  moneyOpts: MoneyOpts
}) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CardRow | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [, startTransition] = useTransition()
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState("")
  const [issuer, setIssuer] = useState("")
  const [lastFour, setLastFour] = useState("")
  const [creditLimit, setCreditLimit] = useState("")
  const [currentBalance, setCurrentBalance] = useState("")
  const [statementDay, setStatementDay] = useState("")
  const [dueDay, setDueDay] = useState("")
  const [color, setColor] = useState(CARD_COLORS[0])

  function resetForm() {
    setName("")
    setIssuer("")
    setLastFour("")
    setCreditLimit("")
    setCurrentBalance("")
    setStatementDay("")
    setDueDay("")
    setColor(CARD_COLORS[0])
  }

  function openCreate() {
    setEditing(null)
    resetForm()
    setOpen(true)
  }

  function openEdit(card: CardRow) {
    setEditing(card)
    setName(card.name)
    setIssuer(card.issuer ?? "")
    setLastFour(card.lastFour ?? "")
    setCreditLimit(card.creditLimit ?? "")
    setCurrentBalance(card.currentBalance)
    setStatementDay(card.statementDay != null ? String(card.statementDay) : "")
    setDueDay(card.dueDay != null ? String(card.dueDay) : "")
    setColor(card.color)
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name,
        issuer: issuer || undefined,
        lastFour: lastFour || undefined,
        creditLimit: creditLimit ? Number.parseFloat(creditLimit) : null,
        currentBalance: currentBalance ? Number.parseFloat(currentBalance) : 0,
        statementDay: statementDay ? Number(statementDay) : null,
        dueDay: dueDay ? Number(dueDay) : null,
        color,
      }
      if (editing) {
        await updateCard(editing.id, payload)
        toast.success("Card updated")
      } else {
        await createCard(payload)
        toast.success("Card added")
      }
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  function handleDelete(card: CardRow) {
    setPendingId(card.id)
    startTransition(async () => {
      try {
        await deleteCard(card.id)
        toast.success("Card deleted")
      } catch {
        toast.error("Failed to delete card")
      } finally {
        setPendingId(null)
      }
    })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="gap-2" />}>
            <Plus className="size-4" />
            New card
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit card" : "New card"}</DialogTitle>
              <DialogDescription>
                Track balance and payment due date for a credit card.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="card-name">Name</Label>
                  <Input
                    id="card-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sapphire Preferred"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="card-issuer">Issuer</Label>
                  <Input
                    id="card-issuer"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    placeholder="Chase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="card-last4">Last 4 digits</Label>
                  <Input
                    id="card-last4"
                    value={lastFour}
                    onChange={(e) =>
                      setLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="1234"
                    maxLength={4}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="card-limit">Credit limit</Label>
                  <Input
                    id="card-limit"
                    type="number"
                    step="0.01"
                    min="0"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    placeholder="10000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="card-balance">Current balance</Label>
                  <Input
                    id="card-balance"
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentBalance}
                    onChange={(e) => setCurrentBalance(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {CARD_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={
                          "size-7 rounded-full border-2 transition-transform " +
                          (color === c
                            ? "scale-110 border-foreground"
                            : "border-transparent")
                        }
                        style={{ backgroundColor: c }}
                        aria-label={`Select color ${c}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="card-statement">Statement day (1-31)</Label>
                  <Input
                    id="card-statement"
                    type="number"
                    min="1"
                    max="31"
                    value={statementDay}
                    onChange={(e) => setStatementDay(e.target.value)}
                    placeholder="5"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="card-due">Payment due day (1-31)</Label>
                  <Input
                    id="card-due"
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    placeholder="25"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full gap-2"
                >
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  {editing ? "Save changes" : "Add card"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No cards yet. Add a credit card to track balances and due dates.
          </p>
        </div>
      ) : (
        <ul className="divide-y rounded-xl border border-border bg-card">
          {cards.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <p className="truncate font-medium">{c.name}</p>
                  {c.lastFour && (
                    <span className="text-xs text-muted-foreground">
                      •••• {c.lastFour}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {c.issuer || "Issuer unknown"}
                  {c.dueDay ? ` · Payment due day ${c.dueDay}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums">
                  {formatCurrency(Number(c.currentBalance), moneyOpts)}
                </p>
                {c.creditLimit && (
                  <p className="text-xs text-muted-foreground tabular-nums">
                    of {formatCurrency(Number(c.creditLimit), moneyOpts)}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  onClick={() => openEdit(c)}
                  aria-label="Edit card"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(c)}
                  disabled={pendingId === c.id}
                  aria-label="Delete card"
                >
                  {pendingId === c.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

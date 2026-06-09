"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createExpense } from "@/app/actions/expenses"
import { PAYMENT_METHODS } from "@/lib/format"

type Option = { id: number; name: string }

export function ExpenseFormDialog({
  categories,
  cards,
}: {
  categories: Option[]
  cards: Option[]
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    description: "",
    amount: "",
    categoryId: "none",
    cardId: "none",
    paymentMethod: "cash",
    spentAt: today,
    notes: "",
  })

  function reset() {
    setForm({
      description: "",
      amount: "",
      categoryId: "none",
      cardId: "none",
      paymentMethod: "cash",
      spentAt: today,
      notes: "",
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await createExpense({
        description: form.description,
        amount: Number.parseFloat(form.amount),
        categoryId: form.categoryId === "none" ? null : Number(form.categoryId),
        cardId: form.cardId === "none" ? null : Number(form.cardId),
        paymentMethod: form.paymentMethod,
        spentAt: form.spentAt,
        notes: form.notes,
      })
      toast.success("Expense added")
      reset()
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add expense")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add an expense</DialogTitle>
          <DialogDescription>Record a new spend and categorize it.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Groceries at the market"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="spentAt">Date</Label>
              <Input
                id="spentAt"
                type="date"
                value={form.spentAt}
                onChange={(e) => setForm({ ...form, spentAt: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Category</Label>
            <Select
              value={form.categoryId}
              onValueChange={(v) => setForm({ ...form, categoryId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Uncategorized</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label>Payment method</Label>
              <Select
                value={form.paymentMethod}
                onValueChange={(v) => setForm({ ...form, paymentMethod: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Card (optional)</Label>
              <Select
                value={form.cardId}
                onValueChange={(v) => setForm({ ...form, cardId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {cards.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any details..."
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Add Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

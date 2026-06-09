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
import { createDebt } from "@/app/actions/debts"

export function DebtManager() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    person: "",
    amount: "",
    direction: "owed_to_me" as "owed_to_me" | "i_owe",
    description: "",
    dueDate: "",
  })

  function reset() {
    setForm({
      person: "",
      amount: "",
      direction: "owed_to_me",
      description: "",
      dueDate: "",
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await createDebt({
        person: form.person,
        amount: Number.parseFloat(form.amount),
        direction: form.direction,
        description: form.description || undefined,
        dueDate: form.dueDate || undefined,
      })
      toast.success("Debt added")
      reset()
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add debt")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="size-4" />
        Add Debt
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a debt</DialogTitle>
          <DialogDescription>
            Track money you owe or money owed to you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Direction</Label>
            <Select
              value={form.direction}
              onValueChange={(v) =>
                setForm({ ...form, direction: v as "owed_to_me" | "i_owe" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owed_to_me">They owe me</SelectItem>
                <SelectItem value="i_owe">I owe them</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="debt-person">Person</Label>
              <Input
                id="debt-person"
                value={form.person}
                onChange={(e) => setForm({ ...form, person: e.target.value })}
                placeholder="Alex"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="debt-amount">Amount (₹)</Label>
              <Input
                id="debt-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="debt-due">Due date (optional)</Label>
            <Input
              id="debt-due"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="debt-desc">Description (optional)</Label>
            <Input
              id="debt-desc"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Dinner split, loan, etc."
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Add Debt
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

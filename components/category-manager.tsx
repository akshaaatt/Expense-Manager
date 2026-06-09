"use client"

import { useState } from "react"
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryWithSpend,
} from "@/app/actions/categories"
import { formatINR, CATEGORY_COLORS } from "@/lib/format"

export function CategoryManager({ categories }: { categories: CategoryWithSpend[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<CategoryWithSpend | null>(null)
  const [name, setName] = useState("")
  const [color, setColor] = useState(CATEGORY_COLORS[0])

  function openCreate() {
    setEditing(null)
    setName("")
    setColor(CATEGORY_COLORS[0])
    setOpen(true)
  }

  function openEdit(cat: CategoryWithSpend) {
    setEditing(cat)
    setName(cat.name)
    setColor(cat.color)
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (editing) {
        await updateCategory(editing.id, { name, color })
        toast.success("Category updated")
      } else {
        await createCategory({ name, color })
        toast.success("Category created")
      }
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteCategory(id)
      toast.success("Category deleted")
    } catch {
      toast.error("Failed to delete category")
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="size-4" />
          New Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No categories yet. Create one to start organizing your spends.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <span
                      className="size-4 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat.count} {cat.count === 1 ? "expense" : "expenses"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground"
                    onClick={() => openEdit(cat)}
                    aria-label="Edit category"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(cat.id)}
                    aria-label="Delete category"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-4 text-lg font-semibold tabular-nums text-foreground">
                {formatINR(cat.total)}
              </p>
              <p className="text-xs text-muted-foreground">total spent</p>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
            <DialogDescription>
              Categories help you organize and analyze your spending.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Food & Dining"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`size-8 rounded-full border-2 transition-transform ${
                      color === c ? "scale-110 border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full gap-2">
                {loading && <Loader2 className="size-4 animate-spin" />}
                {editing ? "Save changes" : "Create category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

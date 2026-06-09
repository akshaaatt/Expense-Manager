"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CURRENCIES, LOCALES } from "@/lib/format"
import { updatePreferences, type PreferencesInput } from "@/app/actions/preferences"

export function SettingsForm({
  initial,
}: {
  initial: PreferencesInput
}) {
  const [form, setForm] = useState<PreferencesInput>(initial)
  const [pending, startTransition] = useTransition()

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        await updatePreferences(form)
        toast.success("Settings saved")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save settings")
      }
    })
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Regional</CardTitle>
          <CardDescription>
            How amounts, dates, and numbers are formatted for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={form.currency}
              onValueChange={(v) => setForm({ ...form, currency: v })}
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.code} — {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="locale">Locale</Label>
            <Select
              value={form.locale}
              onValueChange={(v) => setForm({ ...form, locale: v })}
            >
              <SelectTrigger id="locale">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label>Number format</Label>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { v: "standard", label: "Standard", example: "12,345.67" },
                  { v: "compact", label: "Compact", example: "12.3K" },
                ] as const
              ).map((opt) => {
                const selected = form.numberFormat === opt.v
                return (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setForm({ ...form, numberFormat: opt.v })}
                    className={
                      "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors " +
                      (selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-foreground/30")
                    }
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {opt.example}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Theme preference for this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { v: "light", label: "Light" },
                { v: "dark", label: "Dark" },
                { v: "system", label: "System" },
              ] as const
            ).map((opt) => {
              const selected = form.theme === opt.v
              return (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setForm({ ...form, theme: opt.v })}
                  className={
                    "rounded-lg border p-3 text-sm font-medium transition-colors " +
                    (selected
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground")
                  }
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="gap-2">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save changes
        </Button>
      </div>
    </form>
  )
}

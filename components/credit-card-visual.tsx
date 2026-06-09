import { formatCurrency } from "@/lib/format"
import { CreditCard } from "lucide-react"

export function CreditCardVisual({
  name,
  issuer,
  lastFour,
  balance,
  limit,
  dueDay,
  color,
  moneyOpts,
}: {
  name: string
  issuer: string | null
  lastFour: string | null
  balance: number
  limit: number | null
  dueDay: number | null
  color: string
  moneyOpts: {
    currency: string
    locale: string
    numberFormat: "standard" | "compact"
  }
}) {
  const utilization = limit && limit > 0 ? Math.min((balance / limit) * 100, 100) : null

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-white shadow-sm"
      style={{
        background: `linear-gradient(135deg, ${color} 0%, oklch(from ${color} calc(l - 0.1) c h) 100%)`,
      }}
    >
      <div
        aria-hidden
        className="absolute -top-12 -right-12 size-44 rounded-full bg-white/10 blur-2xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-16 -left-10 size-44 rounded-full bg-white/5 blur-2xl"
      />
      <div className="relative flex flex-col gap-8">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-white/70">
              {issuer || "Card"}
            </p>
            <p className="mt-1 truncate text-lg font-semibold">{name}</p>
          </div>
          <CreditCard className="size-6 text-white/80" />
        </div>

        <div className="flex items-center justify-between">
          <p className="font-mono text-base tracking-widest text-white/90">
            •••• •••• •••• {lastFour ?? "0000"}
          </p>
          {dueDay && (
            <p className="text-xs text-white/70">
              Due day {dueDay}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/60">
                Outstanding
              </p>
              <p className="text-2xl font-semibold tabular-nums">
                {formatCurrency(balance, moneyOpts)}
              </p>
            </div>
            {limit !== null && (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-white/60">
                  of {formatCurrency(limit, moneyOpts)}
                </p>
                {utilization !== null && (
                  <p className="text-sm font-medium tabular-nums">
                    {utilization.toFixed(0)}% used
                  </p>
                )}
              </div>
            )}
          </div>
          {utilization !== null && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white/90"
                style={{ width: `${utilization}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

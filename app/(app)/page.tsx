import { PageHeader } from "@/components/page-header"
import { getExpenses, getMonthlyTotals } from "@/app/actions/expenses"
import { getCategoriesWithSpend } from "@/app/actions/categories"
import { getDebtTotals } from "@/app/actions/debts"
import { getCards } from "@/app/actions/cards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  CreditCard,
  Sparkles,
} from "lucide-react"
import { formatCurrency, formatMonth } from "@/lib/format"
import { getPreferences } from "@/lib/get-preferences"
import { Sparkline } from "@/components/sparkline"

export default async function DashboardPage() {
  const [expenses, categories, debtTotals, cards, monthly, prefs] =
    await Promise.all([
      getExpenses(),
      getCategoriesWithSpend(),
      getDebtTotals(),
      getCards(),
      getMonthlyTotals(),
      getPreferences(),
    ])

  const moneyOpts = {
    currency: prefs.currency,
    locale: prefs.locale,
    numberFormat: prefs.numberFormat,
  } as const

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const now = new Date()
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.spentAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const thisMonthTotal = thisMonth.reduce((sum, e) => sum + Number(e.amount), 0)

  // Last month delta for the hero stat.
  const lastIdx = monthly.length - 2
  const lastMonth = lastIdx >= 0 ? monthly[lastIdx]?.total ?? 0 : 0
  const delta = thisMonthTotal - lastMonth
  const deltaPct = lastMonth > 0 ? (delta / lastMonth) * 100 : null

  const stats = [
    {
      title: "This month",
      value: formatCurrency(thisMonthTotal, moneyOpts),
      sub: `${thisMonth.length} expense${thisMonth.length === 1 ? "" : "s"}`,
      icon: Sparkles,
      tone: "primary" as const,
    },
    {
      title: "Total tracked",
      value: formatCurrency(totalSpent, moneyOpts),
      sub: `${expenses.length} expense${expenses.length === 1 ? "" : "s"}`,
      icon: TrendingDown,
      tone: "default" as const,
    },
    {
      title: "Owed to you",
      value: formatCurrency(debtTotals.owedToMe, moneyOpts),
      sub: "Pending incoming",
      icon: TrendingUp,
      tone: "success" as const,
    },
    {
      title: "You owe",
      value: formatCurrency(debtTotals.iOwe, moneyOpts),
      sub: "Pending outgoing",
      icon: ArrowLeftRight,
      tone: "destructive" as const,
    },
  ]

  const topCategories = categories
    .slice()
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back`}
        description="A quick overview of where your money is going."
      />

      {/* Hero stat */}
      <Card className="overflow-hidden">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Spending in {new Intl.DateTimeFormat(prefs.locale, { month: "long", year: "numeric" }).format(now)}
            </p>
            <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums md:text-5xl">
              {formatCurrency(thisMonthTotal, moneyOpts)}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-sm">
              {delta === 0 ? (
                <span className="text-muted-foreground">No change vs last month</span>
              ) : (
                <span
                  className={
                    delta < 0
                      ? "inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400"
                      : "inline-flex items-center gap-1 text-destructive"
                  }
                >
                  {delta < 0 ? <TrendingDown className="size-3.5" /> : <TrendingUp className="size-3.5" />}
                  {formatCurrency(Math.abs(delta), { ...moneyOpts, showSign: delta > 0 })}
                  {deltaPct !== null && (
                    <span className="text-muted-foreground">
                      ({deltaPct > 0 ? "+" : ""}
                      {deltaPct.toFixed(0)}%)
                    </span>
                  )}
                </span>
              )}
              <span className="text-muted-foreground">· vs last month</span>
            </p>
          </div>
          {monthly.length > 1 && (
            <div className="md:min-w-[280px]">
              <Sparkline
                points={monthly.map((m) => ({ label: m.month, value: m.total }))}
                currency={prefs.currency}
                locale={prefs.locale}
                numberFormat={prefs.numberFormat}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Secondary stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.title}>
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={
                    "flex size-10 items-center justify-center rounded-lg " +
                    (s.tone === "primary"
                      ? "bg-primary/10 text-primary"
                      : s.tone === "success"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : s.tone === "destructive"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground")
                  }
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {s.title}
                  </p>
                  <p className="truncate text-lg font-semibold tabular-nums">
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Top categories</CardTitle>
            <CardDescription>Where your money is going this period.</CardDescription>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No categories yet. Create some to see your spending breakdown.
              </p>
            ) : (
              <div className="space-y-3">
                {topCategories.map((c) => {
                  const max = topCategories[0]?.total ?? 0
                  const width = max > 0 ? (c.total / max) * 100 : 0
                  return (
                    <div key={c.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: c.color }}
                          />
                          <span className="font-medium">{c.name}</span>
                          <span className="text-xs text-muted-foreground">
                            · {c.count} {c.count === 1 ? "expense" : "expenses"}
                          </span>
                        </div>
                        <span className="font-medium tabular-nums">
                          {formatCurrency(c.total, moneyOpts)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${width}%`,
                            backgroundColor: c.color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-4" />
              Cards
            </CardTitle>
            <CardDescription>Linked credit cards</CardDescription>
          </CardHeader>
          <CardContent>
            {cards.length === 0 ? (
              <p className="text-sm text-muted-foreground">No cards yet.</p>
            ) : (
              <ul className="space-y-3">
                {cards.slice(0, 5).map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="truncate font-medium">{c.name}</span>
                    </div>
                    <span className="text-muted-foreground tabular-nums">
                      {c.issuer || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

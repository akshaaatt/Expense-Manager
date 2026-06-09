import { PageHeader } from "@/components/page-header"
import { getExpenses } from "@/app/actions/expenses"
import { getCategoriesWithSpend } from "@/app/actions/categories"
import { getDebtTotals } from "@/app/actions/debts"
import { getCards } from "@/app/actions/cards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Receipt, Tags, ArrowLeftRight, CreditCard } from "lucide-react"
import { formatINR } from "@/lib/format"

export default async function DashboardPage() {
  const [expenses, categories, debtTotals, cards] = await Promise.all([
    getExpenses(),
    getCategoriesWithSpend(),
    getDebtTotals(),
    getCards(),
  ])

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const now = new Date()
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.spentAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const thisMonthTotal = thisMonth.reduce((sum, e) => sum + Number(e.amount), 0)

  const stats = [
    {
      title: "Total Spent",
      value: formatINR(totalSpent),
      description: `${expenses.length} expenses recorded`,
      icon: Receipt,
    },
    {
      title: "This Month",
      value: formatINR(thisMonthTotal),
      description: `${thisMonth.length} expenses this month`,
      icon: Wallet,
    },
    {
      title: "Owed to You",
      value: formatINR(debtTotals.owedToMe),
      description: "Pending incoming",
      icon: ArrowLeftRight,
    },
    {
      title: "You Owe",
      value: formatINR(debtTotals.iOwe),
      description: "Pending outgoing",
      icon: ArrowLeftRight,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A quick overview of your finances."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="size-4" />
              Top Categories
            </CardTitle>
            <CardDescription>Where your money is going</CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No categories yet. Add some to see your spending breakdown.
              </p>
            ) : (
              <div className="space-y-3">
                {categories
                  .slice()
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 5)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate">{c.name}</span>
                      <span className="font-medium">
                        {formatINR(c.total)}
                      </span>
                    </div>
                  ))}
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
            <CardDescription>Your linked credit cards</CardDescription>
          </CardHeader>
          <CardContent>
            {cards.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No cards added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {cards.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate">{c.name}</span>
                    <span className="text-muted-foreground">
                      {c.issuer || "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

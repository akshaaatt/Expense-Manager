import { PageHeader } from "@/components/page-header"
import { ExpenseFormDialog } from "@/components/expense-form-dialog"
import { ExpenseList } from "@/components/expense-list"
import { getExpenses } from "@/app/actions/expenses"
import { getCategories } from "@/app/actions/categories"
import { getCards } from "@/app/actions/cards"
import { getPreferences } from "@/lib/get-preferences"

export default async function ExpensesPage() {
  const [expenses, categories, cards, prefs] = await Promise.all([
    getExpenses(),
    getCategories(),
    getCards(),
    getPreferences(),
  ])

  const moneyOpts = {
    currency: prefs.currency,
    locale: prefs.locale,
    numberFormat: prefs.numberFormat,
  } as const

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Every spend you've recorded, newest first."
        action={
          <ExpenseFormDialog
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            cards={cards.map((c) => ({ id: c.id, name: c.name }))}
            moneyOpts={moneyOpts}
          />
        }
      />
      <ExpenseList expenses={expenses} moneyOpts={moneyOpts} />
    </div>
  )
}

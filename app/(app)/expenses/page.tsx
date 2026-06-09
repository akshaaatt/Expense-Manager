import { PageHeader } from "@/components/page-header"
import { ExpenseFormDialog } from "@/components/expense-form-dialog"
import { ExpenseList } from "@/components/expense-list"
import { getExpenses } from "@/app/actions/expenses"
import { getCategories } from "@/app/actions/categories"
import { getCards } from "@/app/actions/cards"

export default async function ExpensesPage() {
  const [expenses, categories, cards] = await Promise.all([
    getExpenses(),
    getCategories(),
    getCards(),
  ])

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Every spend you've recorded, newest first."
        action={
          <ExpenseFormDialog
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            cards={cards.map((c) => ({ id: c.id, name: c.name }))}
          />
        }
      />
      <ExpenseList expenses={expenses} />
    </div>
  )
}

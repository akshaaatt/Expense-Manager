import { PageHeader } from "@/components/page-header"
import { CategoryManager } from "@/components/category-manager"
import { getCategoriesWithSpend } from "@/app/actions/categories"
import { getPreferences } from "@/lib/get-preferences"

export default async function CategoriesPage() {
  const [categories, prefs] = await Promise.all([
    getCategoriesWithSpend(),
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
        title="Categories"
        description="Organize your spending into categories and see totals at a glance."
      />
      <CategoryManager categories={categories} moneyOpts={moneyOpts} />
    </div>
  )
}

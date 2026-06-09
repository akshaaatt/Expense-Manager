import { PageHeader } from "@/components/page-header"
import { CategoryManager } from "@/components/category-manager"
import { getCategoriesWithSpend } from "@/app/actions/categories"

export default async function CategoriesPage() {
  const categories = await getCategoriesWithSpend()

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organize your spending into categories and see totals at a glance."
      />
      <CategoryManager categories={categories} />
    </div>
  )
}

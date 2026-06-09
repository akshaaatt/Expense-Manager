import { PageHeader } from "@/components/page-header"
import { SettingsForm } from "@/components/settings-form"
import { getPreferences } from "@/lib/get-preferences"

export default async function SettingsPage() {
  const prefs = await getPreferences()
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Customize how the app looks and how amounts are displayed."
      />
      <SettingsForm
        initial={{
          currency: prefs.currency,
          locale: prefs.locale,
          numberFormat: prefs.numberFormat,
          theme: prefs.theme,
        }}
      />
    </div>
  )
}

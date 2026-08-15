import { BudgetForm } from '@/components/budget-form'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/login/actions'
import { query } from '@/lib/db'
import type { Settings } from '@/types/db'

export default async function Reglages() {
  const [settings] = await query<Pick<Settings, 'monthly_budget_cents'>>(
    'select monthly_budget_cents from settings where id = 1'
  )

  return (
    <main className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold">Réglages</h1>
      <section className="flex flex-col gap-4">
        <h2 className="text-sm text-muted">Budget mensuel</h2>
        <BudgetForm budgetCents={settings.monthly_budget_cents} />
      </section>
      <form action={signOut}>
        <Button type="submit" variant="danger">
          Se déconnecter
        </Button>
      </form>
    </main>
  )
}

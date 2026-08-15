import { BudgetForm } from '@/components/budget-form'
import { InstallHint } from '@/components/install-hint'
import { PushToggle } from '@/components/push-toggle'
import { SubscriptionList } from '@/components/subscription-list'
import { BackLink } from '@/components/ui/back-link'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/login/actions'
import { query } from '@/lib/db'
import { getProfiles } from '@/lib/profiles'
import type { Settings, Subscription } from '@/types/db'

export default async function Reglages() {
  const [profiles, [settings], subscriptions] = await Promise.all([
    getProfiles(),
    query<Pick<Settings, 'monthly_budget_cents'>>(
      'select monthly_budget_cents from settings where id = 1'
    ),
    query<Subscription>(
      'select id, profile_id, amount_cents, description, split from subscriptions order by created_at'
    ),
  ])

  return (
    <main className="flex flex-col gap-6 p-4">
      <div className="flex items-center gap-1">
        <BackLink href="/" />
        <h1 className="text-2xl font-semibold">Réglages</h1>
      </div>
      <section className="flex flex-col gap-4">
        <h2 className="text-sm text-muted">Budget mensuel par personne</h2>
        <BudgetForm budgetCents={settings.monthly_budget_cents} />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-sm text-muted">
          Abonnements — ajoutés aux dépenses le 1er de chaque mois
        </h2>
        <SubscriptionList profiles={profiles} subscriptions={subscriptions} />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-sm text-muted">Notifications</h2>
        <PushToggle />
      </section>
      <form action={signOut}>
        <Button type="submit" variant="danger">
          Se déconnecter
        </Button>
      </form>
      <InstallHint />
    </main>
  )
}

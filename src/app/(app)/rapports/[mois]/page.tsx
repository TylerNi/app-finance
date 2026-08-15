import { notFound } from 'next/navigation'
import { BalanceCard } from '@/components/balance-card'
import { ExpenseList } from '@/components/expense-list'
import { SettlementActions } from '@/components/settlement-actions'
import { BackLink } from '@/components/ui/back-link'
import { monthLabel, monthRange } from '@/lib/dates'
import { query } from '@/lib/db'
import { computeMonthSummary, formatCents } from '@/lib/finance'
import { getCurrentProfile, getProfiles } from '@/lib/profiles'
import type { Expense } from '@/types/db'

export default async function RapportMensuel({ params }: PageProps<'/rapports/[mois]'>) {
  const { mois } = await params
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mois)) notFound()

  const { start, end } = monthRange(mois)

  const [profiles, profile, expenses, settlements] = await Promise.all([
    getProfiles(),
    getCurrentProfile(),
    query<Expense>(
      `select * from expenses
       where date >= $1 and date < $2
       order by date desc, created_at desc`,
      [start, end]
    ),
    query<{ month: string }>('select month from monthly_settlements where month = $1', [start]),
  ])

  const summary = computeMonthSummary(
    expenses,
    profiles.map((profile) => profile.id)
  )

  const label = monthLabel(mois)

  return (
    <main className="flex flex-col gap-6 p-4">
      <header className="relative flex flex-col items-center gap-1 pt-6">
        <BackLink href="/rapports" className="absolute left-0 top-6" />
        <p className="text-muted">{label.charAt(0).toUpperCase() + label.slice(1)}</p>
        <p className="text-5xl font-semibold">{formatCents(summary.totalCents)}</p>
        <p className="text-sm text-muted">dépensé au total</p>
      </header>
      <BalanceCard profiles={profiles} summary={summary} />
      <section className="flex flex-col gap-4">
        <h2 className="px-1 text-sm text-muted">Détail des dépenses</h2>
        <ExpenseList expenses={expenses} profiles={profiles} currentProfileId={profile.id} />
      </section>
      <SettlementActions
        month={mois}
        settled={settlements.length > 0}
        canRemind={summary.debtorId !== null && summary.debtorId !== profile.id}
      />
    </main>
  )
}

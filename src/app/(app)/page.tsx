import { BudgetBar } from '@/components/budget-bar'
import { ExpenseList } from '@/components/expense-list'
import { MonthHeader } from '@/components/month-header'
import { SplitSummary } from '@/components/split-summary'
import { currentMonthMontreal, monthRange } from '@/lib/dates'
import { query } from '@/lib/db'
import { computeMonthSummary } from '@/lib/finance'
import { getCurrentProfile, getProfiles } from '@/lib/profiles'
import type { Expense, Settings } from '@/types/db'

export default async function Home({ searchParams }: PageProps<'/'>) {
  const { mois } = await searchParams
  const month =
    typeof mois === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(mois)
      ? mois
      : currentMonthMontreal()
  const { start, end } = monthRange(month)

  const [profiles, profile, expenses, settings] = await Promise.all([
    getProfiles(),
    getCurrentProfile(),
    query<Expense>(
      `select * from expenses
       where date >= $1 and date < $2
       order by date desc, created_at desc`,
      [start, end]
    ),
    query<Pick<Settings, 'monthly_budget_cents'>>(
      'select monthly_budget_cents from settings where id = 1'
    ),
  ])

  const summary = computeMonthSummary(
    expenses,
    profiles.map((profile) => profile.id)
  )

  const budgetCents = settings[0].monthly_budget_cents

  return (
    <main className="flex flex-col gap-6 p-4">
      <MonthHeader month={month} totalCents={summary.totalCents} />
      {budgetCents !== null && (
        <BudgetBar profiles={profiles} totals={summary.totals} budgetCents={budgetCents} />
      )}
      <SplitSummary profiles={profiles} totals={summary.totals} />
      <ExpenseList expenses={expenses} profiles={profiles} currentProfileId={profile.id} />
    </main>
  )
}

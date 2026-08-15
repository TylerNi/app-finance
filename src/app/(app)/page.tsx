import { ExpenseList } from '@/components/expense-list'
import { MonthHeader } from '@/components/month-header'
import { SplitSummary } from '@/components/split-summary'
import { currentMonthMontreal, monthRange } from '@/lib/dates'
import { query } from '@/lib/db'
import { computeMonthSummary } from '@/lib/finance'
import { getProfiles } from '@/lib/profiles'
import type { Expense } from '@/types/db'

export default async function Home() {
  const month = currentMonthMontreal()
  const { start, end } = monthRange(month)

  const [profiles, expenses] = await Promise.all([
    getProfiles(),
    query<Expense>(
      `select * from expenses
       where date >= $1 and date < $2
       order by date desc, created_at desc`,
      [start, end]
    ),
  ])

  const summary = computeMonthSummary(
    expenses,
    profiles.map((profile) => profile.id)
  )

  return (
    <main className="flex flex-col gap-6 p-4">
      <MonthHeader month={month} totalCents={summary.totalCents} />
      <SplitSummary profiles={profiles} totals={summary.totals} />
      <ExpenseList expenses={expenses} profiles={profiles} />
    </main>
  )
}

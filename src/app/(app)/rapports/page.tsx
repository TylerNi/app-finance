import Link from 'next/link'
import { BackLink } from '@/components/ui/back-link'
import { currentMonthMontreal, monthLabel, shiftMonth } from '@/lib/dates'
import { query } from '@/lib/db'
import { formatCents } from '@/lib/finance'

export default async function Rapports() {
  const [months, settlements] = await Promise.all([
    query<{ month: string; total_cents: number }>(
      `select to_char(date, 'YYYY-MM') as month, sum(amount_cents)::int as total_cents
       from expenses
       group by 1
       order by 1 desc`
    ),
    query<{ month: string }>("select to_char(month, 'YYYY-MM') as month from monthly_settlements"),
  ])

  const settled = new Set(settlements.map((entry) => entry.month))
  const current = currentMonthMontreal()
  const overdue = shiftMonth(current, -2)
  const entries = [
    months.find((entry) => entry.month === current) ?? { month: current, total_cents: 0 },
    ...months.filter((entry) => entry.month !== current),
  ]

  return (
    <main className="flex flex-col gap-6 p-4">
      <div className="flex items-center gap-1">
        <BackLink href="/" />
        <h1 className="text-2xl font-semibold">Rapports</h1>
      </div>
      <div className="overflow-hidden rounded-card bg-surface">
        {entries.map((entry, index) => {
          const label = monthLabel(entry.month)
          const tone = settled.has(entry.month)
            ? 'bg-success/15'
            : entry.month === current
              ? ''
              : entry.month <= overdue
                ? 'bg-danger/15'
                : 'bg-warning/15'
          return (
            <Link
              key={entry.month}
              href={`/rapports/${entry.month}`}
              className={`flex items-baseline justify-between p-4 ${tone} ${
                index > 0 ? 'border-t border-border' : ''
              }`}
            >
              <span className="flex items-baseline gap-2">
                {label.charAt(0).toUpperCase() + label.slice(1)}
                {entry.month === current && <span className="text-sm text-muted">en cours</span>}
              </span>
              <span className="flex items-baseline gap-2">
                <span className="font-medium">{formatCents(entry.total_cents)}</span>
                <span className="text-muted">›</span>
              </span>
            </Link>
          )
        })}
      </div>
    </main>
  )
}

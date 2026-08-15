import Link from 'next/link'
import { BackLink } from '@/components/ui/back-link'
import { currentMonthMontreal, monthLabel } from '@/lib/dates'
import { query } from '@/lib/db'
import { formatCents } from '@/lib/finance'

export default async function Rapports() {
  const months = await query<{ month: string; total_cents: number }>(
    `select to_char(date, 'YYYY-MM') as month, sum(amount_cents)::int as total_cents
     from expenses
     group by 1
     order by 1 desc`
  )

  const current = currentMonthMontreal()
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
          return (
            <Link
              key={entry.month}
              href={`/rapports/${entry.month}`}
              className={`flex items-baseline justify-between p-4 ${
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

import Link from 'next/link'
import { currentMonthMontreal, monthLabel, shiftMonth } from '@/lib/dates'
import { formatCents } from '@/lib/finance'

type MonthHeaderProps = {
  month: string
  totalCents: number
}

export function MonthHeader({ month, totalCents }: MonthHeaderProps) {
  const label = monthLabel(month)

  return (
    <header className="relative flex flex-col items-center gap-1 pt-6">
      <Link
        href="/reglages"
        aria-label="Réglages"
        className="absolute right-0 top-6 text-xl text-muted"
      >
        ⚙
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href={`/?mois=${shiftMonth(month, -1)}`}
          aria-label="Mois précédent"
          className="px-2 text-muted"
        >
          ‹
        </Link>
        <p className="text-muted">{label.charAt(0).toUpperCase() + label.slice(1)}</p>
        <Link
          href={`/?mois=${shiftMonth(month, 1)}`}
          aria-label="Mois suivant"
          className="px-2 text-muted"
        >
          ›
        </Link>
      </div>
      <p className="text-5xl font-semibold">{formatCents(totalCents)}</p>
      <p className="text-sm text-muted">
        {month === currentMonthMontreal() ? 'dépensé ce mois-ci' : 'dépensé'}
      </p>
    </header>
  )
}

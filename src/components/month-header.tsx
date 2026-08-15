import Link from 'next/link'
import { monthLabel } from '@/lib/dates'
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
      <p className="text-muted">{label.charAt(0).toUpperCase() + label.slice(1)}</p>
      <p className="text-5xl font-semibold">{formatCents(totalCents)}</p>
      <p className="text-sm text-muted">dépensé ce mois-ci</p>
    </header>
  )
}

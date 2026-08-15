import { Card } from '@/components/ui/card'
import { formatCents, type MonthSummary } from '@/lib/finance'
import type { Profile } from '@/types/db'

type SplitSummaryProps = {
  profiles: Profile[]
  totals: MonthSummary['totals']
}

export function SplitSummary({ profiles, totals }: SplitSummaryProps) {
  return (
    <Card className="flex flex-col gap-3">
      {profiles.map((profile) => (
        <div key={profile.id} className="flex items-baseline justify-between">
          <span className="font-medium">{profile.name}</span>
          <span className="text-sm text-muted">
            payé {formatCents(totals[profile.id].paidCents)} · sa part{' '}
            {formatCents(totals[profile.id].shareCents)}
          </span>
        </div>
      ))}
    </Card>
  )
}

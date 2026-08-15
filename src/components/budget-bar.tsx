import { Card } from '@/components/ui/card'
import { formatCents, type MonthSummary } from '@/lib/finance'
import type { Profile } from '@/types/db'

type BudgetBarProps = {
  profiles: Profile[]
  totals: MonthSummary['totals']
  budgetCents: number
}

export function BudgetBar({ profiles, totals, budgetCents }: BudgetBarProps) {
  return (
    <Card className="flex flex-col gap-4">
      {profiles.map((profile) => {
        const shareCents = totals[profile.id].shareCents
        const percent = Math.round((shareCents / budgetCents) * 100)
        const reached = shareCents >= budgetCents
        const overCents = shareCents - budgetCents

        return (
          <div key={profile.id} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between text-sm">
              <span>
                {profile.name} · {formatCents(shareCents)} / {formatCents(budgetCents)}
              </span>
              <span className="text-muted">{percent} %</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border">
              <div
                className={`h-full ${reached ? 'bg-danger' : 'bg-accent'}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            <p className="text-sm text-muted">
              {overCents > 0
                ? `dépassement de ${formatCents(overCents)}`
                : `il reste ${formatCents(-overCents)}`}
            </p>
          </div>
        )
      })}
    </Card>
  )
}

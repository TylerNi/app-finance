import { Card } from '@/components/ui/card'
import { formatCents } from '@/lib/finance'

type BudgetBarProps = {
  totalCents: number
  budgetCents: number
}

export function BudgetBar({ totalCents, budgetCents }: BudgetBarProps) {
  const percent = Math.round((totalCents / budgetCents) * 100)
  const reached = totalCents >= budgetCents
  const overCents = totalCents - budgetCents

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between text-sm">
        <span>
          {formatCents(totalCents)} / {formatCents(budgetCents)}
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
    </Card>
  )
}

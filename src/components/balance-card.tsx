import { Card } from '@/components/ui/card'
import { formatCents, type MonthSummary } from '@/lib/finance'
import type { Profile } from '@/types/db'

type BalanceCardProps = {
  profiles: Profile[]
  summary: MonthSummary
}

export function BalanceCard({ profiles, summary }: BalanceCardProps) {
  const debtor = profiles.find((profile) => profile.id === summary.debtorId)
  const creditor = profiles.find((profile) => profile.id === summary.creditorId)

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4">
        {profiles.map((profile, index) => {
          const totals = summary.totals[profile.id]
          return (
            <div
              key={profile.id}
              className={`flex flex-col gap-1 ${index > 0 ? 'border-t border-border pt-4' : ''}`}
            >
              <p className="font-medium">{profile.name}</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted">a payé</span>
                <span>{formatCents(totals.paidCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">sa part</span>
                <span>{formatCents(totals.shareCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">solde</span>
                <span className={totals.netCents < 0 ? 'text-danger' : 'text-success'}>
                  {totals.netCents > 0 ? '+' : ''}
                  {formatCents(totals.netCents)}
                </span>
              </div>
            </div>
          )
        })}
      </Card>
      <p className="text-center text-lg font-medium">
        {debtor && creditor
          ? `${debtor.name} doit ${formatCents(summary.owedCents)} à ${creditor.name}`
          : 'Comptes équilibrés'}
      </p>
    </div>
  )
}

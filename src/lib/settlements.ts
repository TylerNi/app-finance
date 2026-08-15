import { monthRange } from '@/lib/dates'
import { query } from '@/lib/db'
import { computeMonthSummary } from '@/lib/finance'
import { getProfiles } from '@/lib/profiles'
import type { Expense, Profile } from '@/types/db'

export type MonthBalance = {
  debtor: Profile | undefined
  creditor: Profile | undefined
  owedCents: number
}

export async function monthBalance(month: string): Promise<MonthBalance> {
  const { start, end } = monthRange(month)

  const [profiles, expenses] = await Promise.all([
    getProfiles(),
    query<Expense>('select * from expenses where date >= $1 and date < $2', [start, end]),
  ])

  const summary = computeMonthSummary(
    expenses,
    profiles.map((profile) => profile.id)
  )

  return {
    debtor: profiles.find((profile) => profile.id === summary.debtorId),
    creditor: profiles.find((profile) => profile.id === summary.creditorId),
    owedCents: summary.owedCents,
  }
}

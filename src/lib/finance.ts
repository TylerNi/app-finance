import type { Expense } from '@/types/db'

export type ProfileTotals = {
  paidCents: number
  shareCents: number
  netCents: number
}

export type MonthSummary = {
  totalCents: number
  totals: Record<string, ProfileTotals>
  debtorId: string | null
  creditorId: string | null
  owedCents: number
}

export function expenseShares(expense: Expense, profileIds: string[]): Record<string, number> {
  const payer = expense.paid_by
  const other = profileIds.find((id) => id !== payer)!
  const amount = expense.amount_cents

  if (expense.split === 'payer') return { [payer]: amount, [other]: 0 }
  if (expense.split === 'other') return { [payer]: 0, [other]: amount }

  const otherShare = Math.floor(amount / 2)
  return { [payer]: amount - otherShare, [other]: otherShare }
}

export function computeMonthSummary(expenses: Expense[], profileIds: string[]): MonthSummary {
  const totals: Record<string, ProfileTotals> = {}
  for (const id of profileIds) totals[id] = { paidCents: 0, shareCents: 0, netCents: 0 }

  let totalCents = 0

  for (const expense of expenses) {
    totalCents += expense.amount_cents
    totals[expense.paid_by].paidCents += expense.amount_cents
    const shares = expenseShares(expense, profileIds)
    for (const id of profileIds) totals[id].shareCents += shares[id]
  }

  for (const id of profileIds) {
    totals[id].netCents = totals[id].paidCents - totals[id].shareCents
  }

  const [a, b] = profileIds
  const netA = totals[a].netCents

  return {
    totalCents,
    totals,
    debtorId: netA === 0 ? null : netA > 0 ? b : a,
    creditorId: netA === 0 ? null : netA > 0 ? a : b,
    owedCents: Math.abs(netA),
  }
}

export function crossesBudget(
  beforeCents: number,
  afterCents: number,
  budgetCents: number | null
): boolean {
  if (budgetCents === null) return false
  return beforeCents < budgetCents && afterCents >= budgetCents
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(cents / 100)
}

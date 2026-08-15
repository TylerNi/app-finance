'use server'

import { revalidatePath } from 'next/cache'
import { monthRange } from '@/lib/dates'
import { query } from '@/lib/db'
import { crossesBudget } from '@/lib/finance'
import { getCurrentProfile } from '@/lib/profiles'
import type { Settings, Split } from '@/types/db'

export async function addExpense(input: {
  amountCents: number
  paidBy: string
  split: Split
  description: string
  date: string
}) {
  if (input.amountCents <= 0) return { error: 'Montant invalide' }

  const profile = await getCurrentProfile()

  await query(
    `insert into expenses (amount_cents, paid_by, split, description, date, created_by)
     values ($1, $2, $3, $4, $5, $6)`,
    [input.amountCents, input.paidBy, input.split, input.description, input.date, profile.id]
  )

  const { start, end } = monthRange(input.date.slice(0, 7))

  const [[total], [settings]] = await Promise.all([
    query<{ total_cents: number }>(
      `select coalesce(sum(amount_cents), 0)::int as total_cents from expenses
       where date >= $1 and date < $2`,
      [start, end]
    ),
    query<Pick<Settings, 'monthly_budget_cents'>>(
      'select monthly_budget_cents from settings where id = 1'
    ),
  ])

  const totalAfter = total.total_cents
  const totalBefore = totalAfter - input.amountCents

  revalidatePath('/')
  return {
    budgetCrossed: crossesBudget(totalBefore, totalAfter, settings.monthly_budget_cents),
  }
}

export async function deleteExpense(id: string) {
  await query('delete from expenses where id = $1', [id])
  revalidatePath('/')
}

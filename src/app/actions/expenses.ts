'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { monthRange } from '@/lib/dates'
import { query } from '@/lib/db'
import { queueExpenseNotice } from '@/lib/expense-notice'
import { computeMonthSummary, crossesBudget, formatCents } from '@/lib/finance'
import { getCurrentProfile, getOtherProfile } from '@/lib/profiles'
import { sendToAll } from '@/lib/push'
import type { Expense, Settings, Split } from '@/types/db'

export async function addExpense(input: {
  amountCents: number
  paidBy: string
  split: Split
  description: string
  date: string
}) {
  if (input.amountCents <= 0) return { error: 'Montant invalide' }

  const profile = await getCurrentProfile()

  const [inserted] = await query<{ id: string }>(
    `insert into expenses (amount_cents, paid_by, split, description, date, created_by)
     values ($1, $2, $3, $4, $5, $6)
     returning id`,
    [input.amountCents, input.paidBy, input.split, input.description, input.date, profile.id]
  )

  const { start, end } = monthRange(input.date.slice(0, 7))

  const [expenses, [settings]] = await Promise.all([
    query<Expense>(
      `select * from expenses
       where date >= $1 and date < $2`,
      [start, end]
    ),
    query<Pick<Settings, 'monthly_budget_cents'>>(
      'select monthly_budget_cents from settings where id = 1'
    ),
  ])

  const other = await getOtherProfile(profile.id)
  const profileIds = [profile.id, other.id]

  const summaryAfter = computeMonthSummary(expenses, profileIds)
  const summaryBefore = computeMonthSummary(
    expenses.filter((expense) => expense.id !== inserted.id),
    profileIds
  )
  const crossed = [profile, other].filter((entry) =>
    crossesBudget(
      summaryBefore.totals[entry.id].shareCents,
      summaryAfter.totals[entry.id].shareCents,
      settings.monthly_budget_cents
    )
  )

  queueExpenseNotice({
    senderId: profile.id,
    senderName: profile.name,
    recipientId: other.id,
    amountCents: input.amountCents,
    description: input.description,
  })

  after(async () => {
    for (const entry of crossed) {
      const month = `${input.date.slice(0, 7)}-01`
      const claimed = await query(
        `insert into budget_alerts (month, profile_id) values ($1, $2)
         on conflict do nothing returning month`,
        [month, entry.id]
      )
      if (claimed.length > 0) {
        await sendToAll({
          title: `${entry.name} a dépassé son budget mensuel`,
          body: `${formatCents(
            summaryAfter.totals[entry.id].shareCents
          )} sur un budget de ${formatCents(settings.monthly_budget_cents!)}`,
          url: '/',
        })
      }
    }
  })

  revalidatePath('/', 'layout')
  return {}
}

export async function updateExpense(input: {
  id: string
  amountCents: number
  paidBy: string
  split: Split
  description: string
  date: string
}) {
  if (input.amountCents <= 0) return { error: 'Montant invalide' }

  await query(
    `update expenses
     set amount_cents = $1, paid_by = $2, split = $3, description = $4, date = $5
     where id = $6`,
    [input.amountCents, input.paidBy, input.split, input.description, input.date, input.id]
  )

  revalidatePath('/', 'layout')
  return {}
}

export async function deleteExpense(id: string) {
  await query('delete from expenses where id = $1', [id])
  revalidatePath('/', 'layout')
}

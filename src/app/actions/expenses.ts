'use server'

import { revalidatePath } from 'next/cache'
import { query } from '@/lib/db'
import { getCurrentProfile } from '@/lib/profiles'
import type { Split } from '@/types/db'

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

  revalidatePath('/')
  return {}
}

export async function deleteExpense(id: string) {
  await query('delete from expenses where id = $1', [id])
  revalidatePath('/')
}

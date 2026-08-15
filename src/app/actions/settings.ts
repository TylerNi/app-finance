'use server'

import { revalidatePath } from 'next/cache'
import { query } from '@/lib/db'

export async function setMonthlyBudget(cents: number | null) {
  if (cents !== null && cents <= 0) return { error: 'Montant invalide' }

  await query('update settings set monthly_budget_cents = $1, updated_at = now() where id = 1', [
    cents,
  ])

  revalidatePath('/')
  revalidatePath('/reglages')
  return {}
}

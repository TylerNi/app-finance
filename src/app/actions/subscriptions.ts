'use server'

import { revalidatePath } from 'next/cache'
import { currentMonthMontreal } from '@/lib/dates'
import { query } from '@/lib/db'
import { chargeSubscription } from '@/lib/subscriptions'
import type { Split, Subscription } from '@/types/db'

export async function addSubscription(input: {
  profileId: string
  amountCents: number
  split: Split
  description: string
}) {
  if (input.amountCents <= 0) return { error: 'Montant invalide' }

  const [subscription] = await query<Subscription>(
    `insert into subscriptions (profile_id, amount_cents, split, description)
     values ($1, $2, $3, $4)
     returning id, profile_id, amount_cents, description, split`,
    [input.profileId, input.amountCents, input.split, input.description]
  )

  await chargeSubscription(subscription, currentMonthMontreal())

  revalidatePath('/', 'layout')
  return {}
}

export async function updateSubscription(input: {
  id: string
  amountCents: number
  split: Split
  description: string
}) {
  if (input.amountCents <= 0) return { error: 'Montant invalide' }

  await query(
    `update subscriptions
     set amount_cents = $1, split = $2, description = $3
     where id = $4`,
    [input.amountCents, input.split, input.description, input.id]
  )

  revalidatePath('/reglages')
  return {}
}

export async function deleteSubscription(id: string) {
  await query('delete from subscriptions where id = $1', [id])
  revalidatePath('/reglages')
}

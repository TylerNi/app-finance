import { query } from '@/lib/db'
import type { Subscription } from '@/types/db'

export async function chargeSubscription(
  subscription: Subscription,
  month: string
): Promise<boolean> {
  const date = `${month}-01`

  const claimed = await query(
    `insert into subscription_charges (subscription_id, month) values ($1, $2)
     on conflict do nothing returning month`,
    [subscription.id, date]
  )
  if (claimed.length === 0) return false

  const [expense] = await query<{ id: string }>(
    `insert into expenses (amount_cents, paid_by, split, description, date, created_by)
     values ($1, $2, $3, $4, $5, $2)
     returning id`,
    [
      subscription.amount_cents,
      subscription.profile_id,
      subscription.split,
      subscription.description,
      date,
    ]
  )

  await query(
    'update subscription_charges set expense_id = $1 where subscription_id = $2 and month = $3',
    [expense.id, subscription.id, date]
  )

  return true
}

export async function chargeSubscriptions(month: string): Promise<number> {
  const subscriptions = await query<Subscription>(
    'select id, profile_id, amount_cents, description, split from subscriptions'
  )

  let charged = 0
  for (const subscription of subscriptions) {
    if (await chargeSubscription(subscription, month)) charged += 1
  }

  return charged
}

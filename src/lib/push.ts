import { WebPushError, sendNotification } from 'web-push'
import { query } from '@/lib/db'

type Payload = {
  title: string
  body: string
  url?: string
}

type Subscription = {
  id: string
  endpoint: string
  p256dh: string
  auth_secret: string
}

const vapidDetails = {
  subject: process.env.VAPID_SUBJECT ?? '',
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
  privateKey: process.env.VAPID_PRIVATE_KEY ?? '',
}

async function send(subscriptions: Subscription[], payload: Payload): Promise<void> {
  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth_secret },
          },
          JSON.stringify(payload),
          { vapidDetails }
        )
        await query('update push_subscriptions set last_success_at = now() where id = $1', [
          subscription.id,
        ])
      } catch (error) {
        if (error instanceof WebPushError && (error.statusCode === 404 || error.statusCode === 410)) {
          await query('delete from push_subscriptions where id = $1', [subscription.id])
        }
      }
    })
  )
}

export async function sendToUser(userId: string, payload: Payload): Promise<void> {
  const subscriptions = await query<Subscription>(
    'select id, endpoint, p256dh, auth_secret from push_subscriptions where user_id = $1',
    [userId]
  )
  await send(subscriptions, payload)
}

export async function sendToAll(payload: Payload): Promise<void> {
  const subscriptions = await query<Subscription>(
    'select id, endpoint, p256dh, auth_secret from push_subscriptions'
  )
  await send(subscriptions, payload)
}

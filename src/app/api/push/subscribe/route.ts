import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentProfile } from '@/lib/profiles'
import { SESSION_COOKIE, readSessionValue } from '@/lib/session'

async function requireSession(): Promise<boolean> {
  const store = await cookies()
  return readSessionValue(store.get(SESSION_COOKIE)?.value) !== null
}

export async function POST(request: Request) {
  if (!(await requireSession())) return new NextResponse(null, { status: 401 })

  const subscription = await request.json()
  const profile = await getCurrentProfile()

  await query(
    `insert into push_subscriptions (user_id, endpoint, p256dh, auth_secret)
     values ($1, $2, $3, $4)
     on conflict (endpoint) do update
       set user_id = excluded.user_id,
           p256dh = excluded.p256dh,
           auth_secret = excluded.auth_secret`,
    [profile.id, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
  )

  return new NextResponse(null, { status: 204 })
}

export async function DELETE(request: Request) {
  if (!(await requireSession())) return new NextResponse(null, { status: 401 })

  const { endpoint } = await request.json()
  await query('delete from push_subscriptions where endpoint = $1', [endpoint])

  return new NextResponse(null, { status: 204 })
}

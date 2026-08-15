import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE = 'session'
const MAX_AGE = 60 * 60 * 24 * 365

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: MAX_AGE,
} as const

function sign(payload: string): string {
  return createHmac('sha256', process.env.SESSION_SECRET!).update(payload).digest('base64url')
}

export function createSessionValue(profileId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ id: profileId, exp: Math.floor(Date.now() / 1000) + MAX_AGE })
  ).toString('base64url')

  return `${payload}.${sign(payload)}`
}

export function readSessionValue(value: string | undefined): string | null {
  if (!value) return null

  const [payload, signature] = value.split('.')
  if (!payload || !signature) return null

  const expected = Buffer.from(sign(payload))
  const received = Buffer.from(signature)
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null

  const { id, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
  return exp > Math.floor(Date.now() / 1000) ? id : null
}

export function checkPassword(password: string): boolean {
  const expected = createHash('sha256').update(process.env.APP_PASSWORD!).digest()
  const received = createHash('sha256').update(password).digest()
  return timingSafeEqual(expected, received)
}

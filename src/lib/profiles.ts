import { cookies } from 'next/headers'
import { query } from '@/lib/db'
import { SESSION_COOKIE, readSessionValue } from '@/lib/session'
import type { Profile } from '@/types/db'

export async function getProfiles(): Promise<[Profile, Profile]> {
  const rows = await query<Profile>('select id, name from profiles order by name')
  return rows as [Profile, Profile]
}

export async function getCurrentProfile(): Promise<Profile> {
  const store = await cookies()
  const id = readSessionValue(store.get(SESSION_COOKIE)?.value)
  const [profile] = await query<Profile>('select id, name from profiles where id = $1', [id])
  return profile
}

export async function getOtherProfile(currentId: string): Promise<Profile> {
  const [profile] = await query<Profile>('select id, name from profiles where id <> $1', [
    currentId,
  ])
  return profile
}

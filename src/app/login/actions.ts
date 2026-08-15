'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { query } from '@/lib/db'
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  checkPassword,
  createSessionValue,
} from '@/lib/session'
import type { Profile } from '@/types/db'

export async function signIn(name: string, password: string) {
  if (!checkPassword(password)) return { error: 'Mot de passe incorrect' }

  const [profile] = await query<Profile>('select id from profiles where name = $1', [name])
  if (!profile) return { error: 'Profil inconnu' }

  const store = await cookies()
  store.set(SESSION_COOKIE, createSessionValue(profile.id), SESSION_COOKIE_OPTIONS)

  redirect('/')
}

export async function signOut() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)

  redirect('/login')
}

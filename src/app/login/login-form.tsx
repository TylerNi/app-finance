'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Profile } from '@/types/db'
import { signIn } from './actions'

export function LoginForm({ profiles }: { profiles: Profile[] }) {
  const [name, setName] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!name) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {profiles.map((profile) => (
          <button key={profile.id} type="button" onClick={() => setName(profile.name)}>
            <Card className="flex h-[120px] items-center justify-center text-xl font-medium">
              {profile.name}
            </Card>
          </button>
        ))}
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (event) => {
        event.preventDefault()
        const result = await signIn(name, password)
        if (result?.error) setError(result.error)
      }}
    >
      <Card className="flex h-[120px] items-center justify-center text-xl font-medium">
        {name}
      </Card>
      <input
        type="password"
        autoComplete="current-password"
        autoFocus
        placeholder="Mot de passe"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value)
          setError(null)
        }}
        className="h-12 rounded-control border border-border bg-surface px-4"
      />
      {error && <p className="text-center text-sm text-danger">{error}</p>}
      <Button type="submit">Se connecter</Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setName(null)
          setPassword('')
          setError(null)
        }}
      >
        Changer de profil
      </Button>
    </form>
  )
}

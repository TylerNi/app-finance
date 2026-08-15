'use client'

import { useState } from 'react'
import { addSubscription } from '@/app/actions/subscriptions'
import { AmountField } from '@/components/ui/amount-field'
import { Button } from '@/components/ui/button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Sheet } from '@/components/ui/sheet'
import type { Profile, Split } from '@/types/db'

type SubscriptionSheetProps = {
  onClose: () => void
  profile: Profile
  other: Profile
}

export function SubscriptionSheet({ onClose, profile, other }: SubscriptionSheetProps) {
  const [amountCents, setAmountCents] = useState(0)
  const [split, setSplit] = useState<Split>('equal')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <Sheet open onClose={onClose}>
      <form
        className="flex flex-col gap-4"
        onSubmit={async (event) => {
          event.preventDefault()
          setSaving(true)
          const result = await addSubscription({
            profileId: profile.id,
            amountCents,
            split,
            description,
          })
          setSaving(false)
          if (result.error) setError(result.error)
          else onClose()
        }}
      >
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-muted">Abonnement de {profile.name}</p>
          <button type="button" onClick={onClose} className="text-accent active:opacity-70">
            Annuler
          </button>
        </div>

        <AmountField
          value={amountCents}
          onChange={(cents) => {
            setAmountCents(cents)
            setError(null)
          }}
        />

        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">Partage</p>
          <SegmentedControl
            options={[
              { value: 'equal', label: '50/50' },
              { value: 'payer', label: `100 % ${profile.name}` },
              { value: 'other', label: `100 % ${other.name}` },
            ]}
            value={split}
            onChange={(value) => setSplit(value as Split)}
          />
        </div>

        <input
          type="text"
          required
          placeholder="Nom de l'abonnement"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="h-12 rounded-control border border-border bg-surface px-4"
        />

        {error && <p className="text-center text-sm text-danger">{error}</p>}

        <Button type="submit" disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </form>
    </Sheet>
  )
}

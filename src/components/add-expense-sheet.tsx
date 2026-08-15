'use client'

import { useState } from 'react'
import { addExpense } from '@/app/actions/expenses'
import { AmountField } from '@/components/ui/amount-field'
import { Button } from '@/components/ui/button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Sheet } from '@/components/ui/sheet'
import { todayMontreal } from '@/lib/dates'
import type { Profile, Split } from '@/types/db'

type AddExpenseSheetProps = {
  open: boolean
  onClose: () => void
  profiles: Profile[]
  currentProfileId: string
}

export function AddExpenseSheet({
  open,
  onClose,
  profiles,
  currentProfileId,
}: AddExpenseSheetProps) {
  const [amountCents, setAmountCents] = useState(0)
  const [paidBy, setPaidBy] = useState(currentProfileId)
  const [split, setSplit] = useState<Split>('equal')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayMontreal())
  const [editingDate, setEditingDate] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function close() {
    setAmountCents(0)
    setPaidBy(currentProfileId)
    setSplit('equal')
    setDescription('')
    setDate(todayMontreal())
    setEditingDate(false)
    setError(null)
    onClose()
  }

  const payer = profiles.find((profile) => profile.id === paidBy)!
  const other = profiles.find((profile) => profile.id !== paidBy)!

  return (
    <Sheet open={open} onClose={close}>
      <form
        className="flex flex-col gap-4"
        onSubmit={async (event) => {
          event.preventDefault()
          const result = await addExpense({ amountCents, paidBy, split, description, date })
          if (result.error) setError(result.error)
          else close()
        }}
      >
        <div className="flex justify-end">
          <button type="button" onClick={close} className="text-accent">
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
          <p className="text-sm text-muted">Payé par</p>
          <SegmentedControl
            options={profiles.map((profile) => ({ value: profile.id, label: profile.name }))}
            value={paidBy}
            onChange={setPaidBy}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">Partage</p>
          <SegmentedControl
            options={[
              { value: 'equal', label: '50/50' },
              { value: 'payer', label: `100 % ${payer.name}` },
              { value: 'other', label: `100 % ${other.name}` },
            ]}
            value={split}
            onChange={(value) => setSplit(value as Split)}
          />
        </div>

        <input
          type="text"
          placeholder="Description (optionnel)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="h-12 rounded-control border border-border bg-surface px-4"
        />

        {editingDate ? (
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-12 rounded-control border border-border bg-surface px-4"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingDate(true)}
            className="flex h-12 items-center justify-between px-1"
          >
            <span>{date === todayMontreal() ? "Aujourd'hui" : date}</span>
            <span className="text-muted">›</span>
          </button>
        )}

        {error && <p className="text-center text-sm text-danger">{error}</p>}

        <Button type="submit">Enregistrer</Button>
      </form>
    </Sheet>
  )
}

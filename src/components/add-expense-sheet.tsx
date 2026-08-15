'use client'

import { useState } from 'react'
import { addExpense, updateExpense } from '@/app/actions/expenses'
import { AmountField } from '@/components/ui/amount-field'
import { Button } from '@/components/ui/button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Sheet } from '@/components/ui/sheet'
import { todayMontreal } from '@/lib/dates'
import type { Expense, Profile, Split } from '@/types/db'

type AddExpenseSheetProps = {
  onClose: () => void
  profiles: Profile[]
  currentProfileId: string
  expense?: Expense
  defaultDate?: string
}

export function AddExpenseSheet({
  onClose,
  profiles,
  currentProfileId,
  expense,
  defaultDate,
}: AddExpenseSheetProps) {
  const [amountCents, setAmountCents] = useState(expense?.amount_cents ?? 0)
  const [paidBy, setPaidBy] = useState(expense?.paid_by ?? currentProfileId)
  const [split, setSplit] = useState<Split>(expense?.split ?? 'equal')
  const [description, setDescription] = useState(expense?.description ?? '')
  const [date, setDate] = useState(expense?.date ?? defaultDate ?? todayMontreal())
  const [editingDate, setEditingDate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const payer = profiles.find((profile) => profile.id === paidBy)!
  const other = profiles.find((profile) => profile.id !== paidBy)!

  return (
    <Sheet open onClose={onClose}>
      <form
        className="flex flex-col gap-4"
        onSubmit={async (event) => {
          event.preventDefault()
          setSaving(true)
          const result = expense
            ? await updateExpense({ id: expense.id, amountCents, paidBy, split, description, date })
            : await addExpense({ amountCents, paidBy, split, description, date })
          setSaving(false)
          if (result.error) setError(result.error)
          else onClose()
        }}
      >
        <div className="flex justify-end">
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

        <Button type="submit" disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </form>
    </Sheet>
  )
}

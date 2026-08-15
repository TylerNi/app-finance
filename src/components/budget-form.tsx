'use client'

import { useState } from 'react'
import { setMonthlyBudget } from '@/app/actions/settings'
import { AmountField } from '@/components/ui/amount-field'
import { Button } from '@/components/ui/button'

export function BudgetForm({ budgetCents }: { budgetCents: number | null }) {
  const [amountCents, setAmountCents] = useState(budgetCents ?? 0)
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (event) => {
        event.preventDefault()
        const result = await setMonthlyBudget(amountCents)
        if (result.error) setError(result.error)
      }}
    >
      <AmountField
        value={amountCents}
        onChange={(cents) => {
          setAmountCents(cents)
          setError(null)
        }}
      />
      {error && <p className="text-center text-sm text-danger">{error}</p>}
      <Button type="submit">Enregistrer</Button>
      <Button
        type="button"
        variant="ghost"
        onClick={async () => {
          await setMonthlyBudget(null)
          setAmountCents(0)
          setError(null)
        }}
      >
        Désactiver le budget
      </Button>
    </form>
  )
}

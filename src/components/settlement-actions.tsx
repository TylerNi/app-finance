'use client'

import { useState } from 'react'
import { markPaid, markUnpaid, sendPaymentReminder } from '@/app/actions/settlements'
import { Button } from '@/components/ui/button'

type SettlementActionsProps = {
  month: string
  settled: boolean
  canRemind: boolean
}

export function SettlementActions({ month, settled, canRemind }: SettlementActionsProps) {
  const [pending, setPending] = useState(false)
  const [reminded, setReminded] = useState(false)

  if (settled) {
    return (
      <Button
        variant="ghost"
        disabled={pending}
        onClick={async () => {
          setPending(true)
          await markUnpaid(month)
          setPending(false)
        }}
      >
        {pending ? 'Enregistrement…' : 'Marquer comme non payé'}
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        disabled={pending}
        onClick={async () => {
          setPending(true)
          await markPaid(month)
          setPending(false)
        }}
      >
        {pending ? 'Enregistrement…' : 'Marquer comme payé'}
      </Button>
      {canRemind && (
        <Button
          variant="ghost"
          disabled={pending || reminded}
          onClick={async () => {
            setPending(true)
            await sendPaymentReminder(month)
            setPending(false)
            setReminded(true)
          }}
        >
          {reminded ? 'Rappel envoyé' : 'Envoyer un rappel'}
        </Button>
      )}
    </div>
  )
}

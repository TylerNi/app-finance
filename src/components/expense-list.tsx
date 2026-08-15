'use client'

import { useRef, useState } from 'react'
import { AddExpenseSheet } from '@/components/add-expense-sheet'
import { deleteExpense } from '@/app/actions/expenses'
import { dayLabel } from '@/lib/dates'
import { formatCents } from '@/lib/finance'
import type { Expense, Profile } from '@/types/db'

type ExpenseListProps = {
  expenses: Expense[]
  profiles: Profile[]
  currentProfileId: string
}

export function ExpenseList({ expenses, profiles, currentProfileId }: ExpenseListProps) {
  if (expenses.length === 0) {
    return <p className="py-12 text-center text-muted">Aucune dépense ce mois-ci</p>
  }

  const days: { date: string; expenses: Expense[] }[] = []
  for (const expense of expenses) {
    const last = days[days.length - 1]
    if (last && last.date === expense.date) last.expenses.push(expense)
    else days.push({ date: expense.date, expenses: [expense] })
  }

  return (
    <div className="flex flex-col gap-4">
      {days.map((day) => (
        <div key={day.date} className="flex flex-col gap-2">
          <p className="px-1 text-sm text-muted">{dayLabel(day.date)}</p>
          <div className="overflow-hidden rounded-card bg-surface">
            {day.expenses.map((expense, index) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                profiles={profiles}
                currentProfileId={currentProfileId}
                separated={index > 0}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

type ExpenseRowProps = {
  expense: Expense
  profiles: Profile[]
  currentProfileId: string
  separated: boolean
}

function ExpenseRow({ expense, profiles, currentProfileId, separated }: ExpenseRowProps) {
  const [startX, setStartX] = useState<number | null>(null)
  const [startY, setStartY] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [editing, setEditing] = useState(false)
  const swiped = useRef(false)

  const payer = profiles.find((profile) => profile.id === expense.paid_by)!
  const other = profiles.find((profile) => profile.id !== expense.paid_by)!
  const splitLabel =
    expense.split === 'equal'
      ? '50/50'
      : expense.split === 'payer'
        ? `100 % ${payer.name}`
        : `100 % ${other.name}`

  const offset = Math.min(0, Math.max(-88, (revealed ? -88 : 0) + dragX))

  return (
    <div className="relative">
      {offset !== 0 && (
        <button
          type="button"
          onClick={() => deleteExpense(expense.id)}
          className="absolute inset-y-0 right-0 w-[88px] bg-danger text-sm text-white"
        >
          Supprimer
        </button>
      )}
      <div
        className={`relative flex items-baseline justify-between bg-surface p-4 ${
          separated ? 'border-t border-border' : ''
        }`}
        style={offset === 0 ? undefined : { transform: `translateX(${offset}px)` }}
        onTouchStart={(event) => {
          swiped.current = false
          setStartX(event.touches[0].clientX)
          setStartY(event.touches[0].clientY)
        }}
        onTouchMove={(event) => {
          if (startX === null) return
          const dx = event.touches[0].clientX - startX
          if (Math.abs(event.touches[0].clientY - startY) > Math.abs(dx)) return
          if (Math.abs(dx) > 8) swiped.current = true
          setDragX(dx)
        }}
        onTouchEnd={() => {
          if (startX === null) return
          setRevealed(offset < -44)
          setStartX(null)
          setDragX(0)
        }}
        onClick={() => {
          if (swiped.current) return
          if (revealed) setRevealed(false)
          else setEditing(true)
        }}
      >
        <div className="flex flex-col gap-1">
          <span>{expense.description || 'Dépense'}</span>
          <span className="text-sm text-muted">
            payé par {payer.name} · {splitLabel}
          </span>
        </div>
        <span className="font-medium">{formatCents(expense.amount_cents)}</span>
      </div>
      {editing && (
        <AddExpenseSheet
          onClose={() => setEditing(false)}
          profiles={profiles}
          currentProfileId={currentProfileId}
          expense={expense}
        />
      )}
    </div>
  )
}

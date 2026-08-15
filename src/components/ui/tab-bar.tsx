'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { AddExpenseSheet } from '@/components/add-expense-sheet'
import { currentMonthMontreal } from '@/lib/dates'
import type { Profile } from '@/types/db'

const tabs = [
  { href: '/', label: 'Mois' },
  { href: '/rapports', label: 'Rapports' },
]

type TabBarProps = {
  profiles: Profile[]
  currentProfileId: string
}

export function TabBar({ profiles, currentProfileId }: TabBarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const viewed =
    pathname === '/' ? searchParams.get('mois') : pathname.match(/^\/rapports\/(.+)$/)?.[1]
  const month = viewed && /^\d{4}-(0[1-9]|1[0-2])$/.test(viewed) ? viewed : undefined
  const defaultDate = month && month !== currentMonthMontreal() ? `${month}-01` : undefined

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 h-[calc(60px+env(safe-area-inset-bottom))] border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="relative flex h-[60px] items-center gap-20 px-4">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex h-10 flex-1 items-center justify-center rounded-control text-sm transition-opacity active:opacity-70 ${
                pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
                  ? 'bg-accent text-white'
                  : 'bg-border text-text'
              }`}
            >
              {tab.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ajouter une dépense"
            className="absolute -top-4 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full bg-accent text-3xl text-white transition-opacity active:opacity-70"
          >
            +
          </button>
        </div>
      </nav>
      {open && (
        <AddExpenseSheet
          onClose={() => setOpen(false)}
          profiles={profiles}
          currentProfileId={currentProfileId}
          defaultDate={defaultDate}
        />
      )}
    </>
  )
}

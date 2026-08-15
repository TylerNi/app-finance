'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Sheet } from './sheet'

const tabs = [
  { href: '/', label: 'Mois' },
  { href: '/rapports', label: 'Rapports' },
]

export function TabBar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 h-[calc(60px+env(safe-area-inset-bottom))] border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="relative flex h-[60px] items-center">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex h-full flex-1 items-center justify-center text-xs ${
                pathname === tab.href ? 'text-accent' : 'text-muted'
              }`}
            >
              {tab.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ajouter une dépense"
            className="absolute -top-4 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full bg-accent text-3xl text-white"
          >
            +
          </button>
        </div>
      </nav>
      <Sheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}

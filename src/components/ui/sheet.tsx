'use client'

import { useEffect, useState, type ReactNode } from 'react'

type SheetProps = {
  open: boolean
  onClose: () => void
  children?: ReactNode
}

export function Sheet({ open, onClose, children }: SheetProps) {
  const [startY, setStartY] = useState<number | null>(null)
  const [dragY, setDragY] = useState(0)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex touch-none items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full animate-sheet-in rounded-t-card bg-surface p-4 pb-[calc(16px+env(safe-area-inset-bottom))]"
        style={{ transform: `translateY(${dragY}px)` }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="-mx-4 -mt-4 px-4 pb-4 pt-4"
          onTouchStart={(event) => setStartY(event.touches[0].clientY)}
          onTouchMove={(event) => {
            if (startY !== null) setDragY(Math.max(0, event.touches[0].clientY - startY))
          }}
          onTouchEnd={() => {
            if (dragY > 80) onClose()
            setStartY(null)
            setDragY(0)
          }}
        >
          <div className="mx-auto h-1 w-9 rounded-full bg-border" />
        </div>
        {children}
      </div>
    </div>
  )
}

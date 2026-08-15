'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'

export function InstallHint() {
  const [installed, setInstalled] = useState<boolean | null>(null)

  useEffect(() => {
    setInstalled(
      window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as { standalone?: boolean }).standalone === true
    )
  }, [])

  if (installed !== false) return null

  return (
    <Card className="flex flex-col gap-2">
      <h2 className="font-semibold">Installer sur l&apos;écran d&apos;accueil</h2>
      <p className="text-sm">
        Appuie sur ⎙ Partager, puis « Ajouter à l&apos;écran d&apos;accueil ».
      </p>
      <p className="text-sm text-muted">
        Les notifications ne fonctionnent que depuis l&apos;app installée.
      </p>
    </Card>
  )
}

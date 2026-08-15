'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { urlBase64ToUint8Array } from '@/lib/push-client'

export function PushToggle() {
  const [installed, setInstalled] = useState<boolean | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setInstalled(
      window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as { standalone?: boolean }).standalone === true
    )

    navigator.serviceWorker?.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setEnabled(subscription !== null))
  }, [])

  if (installed === null) return null

  if (!installed) {
    return (
      <p className="text-sm text-muted">
        Installe d&apos;abord l&apos;app sur ton écran d&apos;accueil pour activer les notifications.
      </p>
    )
  }

  async function enable() {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setError("Notifications refusées dans les réglages de l'iPhone")
      return
    }

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ) as BufferSource,
    })

    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    })

    setEnabled(true)
    setError(null)
  }

  async function disable() {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })
      await subscription.unsubscribe()
    }
    setEnabled(false)
  }

  return (
    <div className="flex flex-col gap-2">
      {enabled ? (
        <>
          <p className="text-sm">Notifications activées sur cet appareil</p>
          <Button type="button" variant="ghost" onClick={disable}>
            Désactiver les notifications
          </Button>
        </>
      ) : (
        <Button type="button" onClick={enable}>
          Activer les notifications sur cet iPhone
        </Button>
      )}
      {error && <p className="text-center text-sm text-danger">{error}</p>}
    </div>
  )
}

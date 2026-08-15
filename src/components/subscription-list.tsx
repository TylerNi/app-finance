'use client'

import { useState } from 'react'
import { deleteSubscription } from '@/app/actions/subscriptions'
import { SubscriptionSheet } from '@/components/subscription-sheet'
import { formatCents } from '@/lib/finance'
import type { Profile, Subscription } from '@/types/db'

type SubscriptionListProps = {
  profiles: Profile[]
  subscriptions: Subscription[]
}

export function SubscriptionList({ profiles, subscriptions }: SubscriptionListProps) {
  const [sheet, setSheet] = useState<{ profile: Profile; subscription?: Subscription } | null>(null)

  return (
    <div className="flex flex-col gap-4">
      {profiles.map((profile) => {
        const other = profiles.find((entry) => entry.id !== profile.id)!
        const mine = subscriptions.filter((subscription) => subscription.profile_id === profile.id)

        return (
          <div key={profile.id} className="flex flex-col gap-2">
            <p className="px-1 text-sm text-muted">{profile.name}</p>
            <div className="overflow-hidden rounded-card bg-surface">
              {mine.map((subscription, index) => (
                <div
                  key={subscription.id}
                  className={`flex items-baseline justify-between p-4 ${
                    index > 0 ? 'border-t border-border' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSheet({ profile, subscription })}
                    className="flex flex-1 flex-col items-start gap-1 text-left active:opacity-70"
                  >
                    <span>{subscription.description}</span>
                    <span className="text-sm text-muted">
                      {subscription.split === 'equal'
                        ? '50/50'
                        : subscription.split === 'payer'
                          ? `100 % ${profile.name}`
                          : `100 % ${other.name}`}
                    </span>
                  </button>
                  <span className="flex items-baseline gap-4">
                    <span className="font-medium">{formatCents(subscription.amount_cents)}</span>
                    <button
                      type="button"
                      onClick={() => deleteSubscription(subscription.id)}
                      aria-label={`Supprimer ${subscription.description}`}
                      className="text-xl text-muted active:opacity-70"
                    >
                      ×
                    </button>
                  </span>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSheet({ profile })}
                className={`w-full p-4 text-left text-accent active:opacity-70 ${
                  mine.length > 0 ? 'border-t border-border' : ''
                }`}
              >
                Ajouter un abonnement
              </button>
            </div>
          </div>
        )
      })}
      {sheet && (
        <SubscriptionSheet
          onClose={() => setSheet(null)}
          profile={sheet.profile}
          other={profiles.find((entry) => entry.id !== sheet.profile.id)!}
          subscription={sheet.subscription}
        />
      )}
    </div>
  )
}

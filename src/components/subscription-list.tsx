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
  const [adding, setAdding] = useState<Profile | null>(null)

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
                  <div className="flex flex-col gap-1">
                    <span>{subscription.description}</span>
                    <span className="text-sm text-muted">
                      {subscription.split === 'equal'
                        ? '50/50'
                        : subscription.split === 'payer'
                          ? `100 % ${profile.name}`
                          : `100 % ${other.name}`}
                    </span>
                  </div>
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
                onClick={() => setAdding(profile)}
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
      {adding && (
        <SubscriptionSheet
          onClose={() => setAdding(null)}
          profile={adding}
          other={profiles.find((entry) => entry.id !== adding.id)!}
        />
      )}
    </div>
  )
}

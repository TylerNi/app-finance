'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { monthLabel } from '@/lib/dates'
import { query } from '@/lib/db'
import { formatCents } from '@/lib/finance'
import { getCurrentProfile } from '@/lib/profiles'
import { sendToAll, sendToUser } from '@/lib/push'
import { monthBalance } from '@/lib/settlements'

function title(month: string): string {
  const label = monthLabel(month)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export async function markPaid(month: string) {
  const profile = await getCurrentProfile()

  await query(
    `insert into monthly_settlements (month, marked_by) values ($1, $2)
     on conflict do nothing`,
    [`${month}-01`, profile.id]
  )

  const { debtor, creditor, owedCents } = await monthBalance(month)

  after(async () => {
    if (!debtor || !creditor) return
    await sendToAll({
      title: `${debtor.name} a payé ${creditor.name}`,
      body: `${formatCents(owedCents)} · ${monthLabel(month)}`,
      url: `/rapports/${month}`,
    })
  })

  revalidatePath('/', 'layout')
}

export async function markUnpaid(month: string) {
  const profile = await getCurrentProfile()

  await query('delete from monthly_settlements where month = $1', [`${month}-01`])

  after(async () => {
    await sendToAll({
      title: `${title(month)} n'est plus réglé`,
      body: `Marqué non payé par ${profile.name}`,
      url: `/rapports/${month}`,
    })
  })

  revalidatePath('/', 'layout')
}

export async function sendPaymentReminder(month: string) {
  const { debtor, creditor, owedCents } = await monthBalance(month)
  if (!debtor || !creditor) return

  await sendToUser(debtor.id, {
    title: 'Rappel de paiement',
    body: `Tu dois ${formatCents(owedCents)} à ${creditor.name} pour ${monthLabel(month)}`,
    url: `/rapports/${month}`,
  })
}

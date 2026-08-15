import { formatCents } from '@/lib/finance'
import { sendToUser } from '@/lib/push'

const DELAY_MS = 5 * 60 * 1000

type Pending = {
  timer: NodeJS.Timeout
  count: number
  totalCents: number
  description: string
}

const pending = new Map<string, Pending>()

export function queueExpenseNotice(input: {
  senderId: string
  senderName: string
  recipientId: string
  amountCents: number
  description: string
}): void {
  const current = pending.get(input.senderId)
  if (current) clearTimeout(current.timer)

  const count = (current?.count ?? 0) + 1
  const totalCents = (current?.totalCents ?? 0) + input.amountCents
  const description = current ? current.description : input.description

  const timer = setTimeout(() => {
    pending.delete(input.senderId)
    void sendToUser(input.recipientId, {
      title: `${input.senderName} a ajouté ${count === 1 ? 'une dépense' : `${count} dépenses`}`,
      body:
        count === 1
          ? `${formatCents(totalCents)} · ${description || 'Dépense'}`
          : `${formatCents(totalCents)} au total`,
      url: '/',
    })
  }, DELAY_MS)

  pending.set(input.senderId, { timer, count, totalCents, description })
}

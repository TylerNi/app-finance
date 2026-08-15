import { monthLabel, monthRange, shiftMonth, todayMontreal } from '@/lib/dates'
import { query } from '@/lib/db'
import { computeMonthSummary, formatCents } from '@/lib/finance'
import { getProfiles } from '@/lib/profiles'
import { sendToAll } from '@/lib/push'
import { monthBalance } from '@/lib/settlements'
import { chargeSubscriptions } from '@/lib/subscriptions'
import type { Expense, Profile, Settings } from '@/types/db'

function previousMonth(today: string): string {
  const [year, month] = today.split('-').map(Number)
  return month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, '0')}`
}

async function sendMonthlyReport(profiles: Profile[], today: string): Promise<string> {
  const month = previousMonth(today)

  const claimed = await query(
    `insert into job_runs (job, day) values ('monthly_report', $1)
     on conflict do nothing returning day`,
    [today]
  )
  if (claimed.length === 0) return 'rapport déjà envoyé'

  const { start, end } = monthRange(month)
  const expenses = await query<Expense>(
    `select * from expenses
     where date >= $1 and date < $2
     order by date desc, created_at desc`,
    [start, end]
  )
  if (expenses.length === 0) return 'aucune dépense, rapport non envoyé'

  const summary = computeMonthSummary(
    expenses,
    profiles.map((profile) => profile.id)
  )
  const debtor = profiles.find((profile) => profile.id === summary.debtorId)
  const creditor = profiles.find((profile) => profile.id === summary.creditorId)
  const balance =
    debtor && creditor
      ? `${debtor.name} doit ${formatCents(summary.owedCents)} à ${creditor.name}`
      : 'comptes équilibrés'

  const title = `Rapport de ${monthLabel(month)}`
  const body = `${formatCents(summary.totalCents)} dépensés · ${balance}`

  await sendToAll({ title, body, url: `/rapports/${month}` })
  return `${title} — ${body}`
}

async function sendOverdueReminders(today: string): Promise<string> {
  const limit = `${shiftMonth(today.slice(0, 7), -1)}-01`

  const months = await query<{ month: string }>(
    `select to_char(e.date, 'YYYY-MM') as month
     from expenses e
     left join monthly_settlements s on s.month = date_trunc('month', e.date)::date
     where e.date < $1 and s.month is null
     group by 1
     order by 1`,
    [limit]
  )
  if (months.length === 0) return 'aucun mois en retard'

  const claimed = await query(
    `insert into job_runs (job, day) values ('overdue_reminder', $1)
     on conflict do nothing returning day`,
    [today]
  )
  if (claimed.length === 0) return 'relances déjà envoyées'

  const sent: string[] = []
  for (const entry of months) {
    const { creditor, owedCents } = await monthBalance(entry.month)
    if (!creditor) continue

    const label = monthLabel(entry.month)
    await sendToAll({
      title: `${label.charAt(0).toUpperCase() + label.slice(1)} toujours impayé`,
      body: `${formatCents(owedCents)} dus à ${creditor.name} depuis plus d'un mois`,
      url: `/rapports/${entry.month}`,
    })
    sent.push(entry.month)
  }

  return sent.length > 0 ? `relance envoyée pour ${sent.join(', ')}` : 'aucun solde à relancer'
}

async function sendInactivityReminder(today: string): Promise<string> {
  const [[settings], [last]] = await Promise.all([
    query<Pick<Settings, 'inactivity_reminder_days'>>(
      'select inactivity_reminder_days from settings where id = 1'
    ),
    query<{ last: Date | null }>('select max(created_at) as last from expenses'),
  ])

  if (last.last === null) return 'aucune dépense, rappel non envoyé'

  const days = settings.inactivity_reminder_days
  const elapsed = Math.floor((Date.now() - last.last.getTime()) / 86400000)
  if (elapsed < days) return 'saisie récente, rappel non envoyé'

  const recent = await query(
    `select 1 from job_runs
     where job = 'inactivity_reminder' and day > $1::date - $2::int`,
    [today, days]
  )
  if (recent.length > 0) return 'rappel déjà envoyé récemment'

  await query("insert into job_runs (job, day) values ('inactivity_reminder', $1)", [today])

  const title = `Aucune dépense depuis ${elapsed} jours`
  const body = "Ouvre l'app pour mettre les comptes à jour."

  await sendToAll({ title, body, url: '/' })
  return `${title} — ${body}`
}

export async function POST(request: Request) {
  if (request.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return new Response(null, { status: 401 })
  }

  const today = todayMontreal()
  const profiles = await getProfiles()
  const results: string[] = []

  if (today.endsWith('-01')) {
    const charged = await chargeSubscriptions(today.slice(0, 7))
    results.push(`${charged} abonnement(s) facturé(s)`)
    results.push(await sendMonthlyReport(profiles, today))
    results.push(await sendOverdueReminders(today))
  }
  results.push(await sendInactivityReminder(today))

  return Response.json({ today, profiles: profiles.map((profile) => profile.name), results })
}

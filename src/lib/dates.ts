export function todayMontreal(): string {
  return new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Montreal' }).format(new Date())
}

export function currentMonthMontreal(): string {
  return todayMontreal().slice(0, 7)
}

export function monthRange(month: string): { start: string; end: string } {
  const [y, m] = month.split('-').map(Number)
  const start = `${month}-01`
  const nextY = m === 12 ? y + 1 : y
  const nextM = m === 12 ? 1 : m + 1
  const end = `${nextY}-${String(nextM).padStart(2, '0')}-01`
  return { start, end }
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const total = y * 12 + (m - 1) + delta
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
}

export function dayLabel(date: string): string {
  const today = todayMontreal()
  if (date === today) return "Aujourd'hui"

  const [ty, tm, td] = today.split('-').map(Number)
  const yesterday = new Date(Date.UTC(ty, tm - 1, td - 1)).toISOString().slice(0, 10)
  if (date === yesterday) return 'Hier'

  const [y, m, d] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('fr-CA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)))
}

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return new Intl.DateTimeFormat('fr-CA', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(y, m - 1, 1)))
}

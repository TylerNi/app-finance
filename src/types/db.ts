export type Split = 'equal' | 'payer' | 'other'

export type Profile = {
  id: string
  name: string
}

export type Expense = {
  id: string
  amount_cents: number
  description: string
  date: string
  paid_by: string
  split: Split
  created_by: string
  created_at: Date
}

export type Settings = {
  id: number
  monthly_budget_cents: number | null
  inactivity_reminder_days: number
}

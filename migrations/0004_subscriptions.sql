drop table budget_alerts;

create table budget_alerts (
  month date not null,
  profile_id uuid not null references profiles(id) on delete cascade,
  sent_at timestamptz not null default now(),
  primary key (month, profile_id)
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  description text not null,
  split text not null check (split in ('equal', 'payer', 'other')),
  created_at timestamptz not null default now()
);

create table subscription_charges (
  subscription_id uuid not null references subscriptions(id) on delete cascade,
  month date not null,
  charged_at timestamptz not null default now(),
  primary key (subscription_id, month)
);

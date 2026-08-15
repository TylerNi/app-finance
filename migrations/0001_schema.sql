create table profiles (
  id uuid primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  amount_cents integer not null check (amount_cents > 0),
  description text not null default '',
  date date not null,
  paid_by uuid not null references profiles(id),
  split text not null check (split in ('equal', 'payer', 'other')),
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create index expenses_date_idx on expenses (date desc, created_at desc);

create table settings (
  id integer primary key default 1 check (id = 1),
  monthly_budget_cents integer check (monthly_budget_cents > 0),
  inactivity_reminder_days integer not null default 7,
  updated_at timestamptz not null default now()
);

insert into settings (id) values (1);

create table budget_alerts (
  month date primary key,
  sent_at timestamptz not null default now()
);

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_secret text not null,
  created_at timestamptz not null default now(),
  last_success_at timestamptz
);

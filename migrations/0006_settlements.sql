create table monthly_settlements (
  month date primary key,
  marked_by uuid not null references profiles(id) on delete cascade,
  settled_at timestamptz not null default now()
);

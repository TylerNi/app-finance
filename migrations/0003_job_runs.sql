create table job_runs (
  job text not null,
  day date not null,
  ran_at timestamptz not null default now(),
  primary key (job, day)
);

alter table subscription_charges
  add column expense_id uuid references expenses(id) on delete set null;

update subscription_charges c
set expense_id = (
  select e.id from expenses e
  join subscriptions s on s.id = c.subscription_id
  where e.date = c.month
    and e.paid_by = s.profile_id
    and e.description = s.description
  order by e.created_at
  limit 1
)
where c.expense_id is null;

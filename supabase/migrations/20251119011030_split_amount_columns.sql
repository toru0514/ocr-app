alter table public.entries
  add column if not exists amount_in integer not null default 0 check (amount_in >= 0),
  add column if not exists amount_out integer not null default 0 check (amount_out >= 0);

update public.entries
  set amount_out = case when amount is null then 0 when amount >= 0 then amount else 0 end,
      amount_in = case when amount < 0 then abs(amount) else 0 end
  where amount_out = 0 and amount_in = 0 and amount is not null;

alter table public.entries
  drop column if exists amount;

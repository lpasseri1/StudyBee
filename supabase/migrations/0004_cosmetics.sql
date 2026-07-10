-- StudyBee: tracks which cosmetics each user has purchased, so the shop
-- knows what's already owned (vs. needing credits spent again) and the
-- Profile page can only let you equip things you actually bought.

create table if not exists public.cosmetic_purchases (
  user_id uuid not null references auth.users (id) on delete cascade,
  cosmetic_id text not null,
  purchased_at timestamptz not null default now(),
  primary key (user_id, cosmetic_id)
);

alter table public.cosmetic_purchases enable row level security;

drop policy if exists "Users can view their own cosmetic purchases" on public.cosmetic_purchases;
create policy "Users can view their own cosmetic purchases"
  on public.cosmetic_purchases for select
  using (auth.uid() = user_id);

-- No direct insert policy — purchases only happen through purchase_cosmetic
-- below, so a purchase always deducts credits in the same transaction.

create or replace function public.purchase_cosmetic(cosmetic_id text, cost integer)
returns public.cosmetic_purchases
language plpgsql
security definer set search_path = public
as $$
declare
  result public.cosmetic_purchases;
begin
  if cost <= 0 then
    raise exception 'cost must be positive';
  end if;

  if exists (
    select 1 from public.cosmetic_purchases c
    where c.user_id = auth.uid() and c.cosmetic_id = purchase_cosmetic.cosmetic_id
  ) then
    raise exception 'already owned';
  end if;

  -- Deduct credits first — this itself raises if the balance is insufficient,
  -- which aborts the whole function (and thus the purchase record) too.
  update public.credits
    set balance = balance - cost,
        updated_at = now()
    where user_id = auth.uid() and balance >= cost;

  if not found then
    raise exception 'insufficient credits';
  end if;

  insert into public.cosmetic_purchases (user_id, cosmetic_id)
  values (auth.uid(), purchase_cosmetic.cosmetic_id)
  returning * into result;

  return result;
end;
$$;

grant execute on function public.purchase_cosmetic(text, integer) to authenticated;

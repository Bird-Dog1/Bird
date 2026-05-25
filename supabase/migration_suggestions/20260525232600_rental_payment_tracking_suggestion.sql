-- SUGGESTION ONLY - do not apply until Stripe/dealer payout operations are approved.
-- Preferred business model: rental payments should route to the participating dealership
-- or a dealership-connected Stripe account. Bird Dog should not hold rental funds unless
-- the platform is legally and operationally set up to do so.

create type public.rental_payment_status as enum ('unpaid', 'paid', 'late', 'void');

create table public.dealership_payment_settings (
  dealership_id uuid primary key references public.dealerships(id) on delete cascade,
  stripe_account_id text,
  stripe_payment_link_url text,
  checkout_enabled boolean not null default false,
  purchase_credit_enabled boolean not null default false,
  purchase_credit_rate numeric(5, 4) not null default 0 check (purchase_credit_rate >= 0 and purchase_credit_rate <= 1),
  terms_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rental_payments (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid not null references public.rentals(id) on delete cascade,
  dealership_id uuid not null references public.dealerships(id) on delete restrict,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  amount numeric(10, 2) not null check (amount >= 0),
  due_date date not null,
  status public.rental_payment_status not null default 'unpaid',
  payment_date timestamptz,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  eligible_purchase_credit numeric(10, 2) not null default 0 check (eligible_purchase_credit >= 0),
  credit_subject_to_dealer_terms boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (rental_id, due_date)
);

create index rental_payments_customer_due_idx on public.rental_payments (customer_id, due_date);
create index rental_payments_dealership_status_due_idx on public.rental_payments (dealership_id, status, due_date);
create index rental_payments_rental_due_idx on public.rental_payments (rental_id, due_date);

create trigger set_dealership_payment_settings_updated_at
before update on public.dealership_payment_settings
for each row execute function public.set_updated_at();

create trigger set_rental_payments_updated_at
before update on public.rental_payments
for each row execute function public.set_updated_at();

alter table public.dealership_payment_settings enable row level security;
alter table public.rental_payments enable row level security;

create policy "dealership_payment_settings_select_dealer_or_admin"
on public.dealership_payment_settings for select
using (public.can_access_dealership(dealership_id));

create policy "dealership_payment_settings_update_dealer_or_admin"
on public.dealership_payment_settings for update
using (public.can_access_dealership(dealership_id))
with check (public.can_access_dealership(dealership_id));

create policy "rental_payments_select_customer"
on public.rental_payments for select
using (customer_id = auth.uid());

create policy "rental_payments_select_dealer_or_admin"
on public.rental_payments for select
using (public.can_access_dealership(dealership_id));

-- Inserts/updates should be performed by a trusted Stripe webhook or service-role job
-- after verifying the Checkout Session/PaymentIntent and dealership destination.

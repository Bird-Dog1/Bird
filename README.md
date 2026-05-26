# Bird Dog

Bird Dog is a Next.js marketplace and dealership SaaS foundation for monthly
dealership vehicle rentals instead of traditional auto financing.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible components
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Row Level Security

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add your Supabase project URL and anon key to `.env.local`.

## Supabase setup

Apply the SQL in `supabase/migrations/20260520073700_create_bird_dog_schema.sql`
and `supabase/migrations/20260520073800_create_bird_dog_storage.sql` to create:

- `profiles` with `customer`, `dealer`, and `admin` roles
- `dealerships` and `dealer_users`
- `vehicles` and `vehicle_photos`
- `rental_applications` and `application_documents`
- `rentals`
- private `vehicle-photos` and `application-documents` storage buckets
- auth profile creation, triggers, indexes, and RLS policies

Payment tracking requires a separate operational review before activation. Start
from `supabase/migration_suggestions/20260525232600_rental_payment_tracking_suggestion.sql`
only after Stripe Checkout is wired to route rental funds to participating
dealerships or dealership-connected accounts. Bird Dog should not hold rental
funds unless legally set up to do so.

Admin roles should be assigned from the Supabase dashboard or a service-role
script, not from public signup.

## Routes

- `/` landing page shell
- `/login` Supabase email/password sign in
- `/signup` customer/dealer signup
- `/dashboard` authenticated dashboard shell
- `/dashboard/customer` customer application workspace
- `/dashboard/dealer` dealer inventory workspace
- `/dashboard/admin` admin-only console

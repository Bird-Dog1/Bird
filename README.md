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

Apply the SQL files in order:

1. `supabase/migrations/20260520073700_create_bird_dog_schema.sql`
2. `supabase/migrations/20260520073800_create_bird_dog_storage.sql`

They create:

- `profiles` with `customer`, `dealer`, and `admin` roles
- `dealerships` and `dealer_users`
- `vehicles` and `vehicle_photos`
- `rental_applications` and `application_documents`
- `rentals`
- private `vehicle-photos` and `application-documents` storage buckets
- auth profile creation, triggers, indexes, and RLS policies

Admin roles should be assigned from the Supabase dashboard or a service-role
script, not from public signup.

After applying the SQL, run:

```bash
npm run supabase:preflight
```

The preflight checks that Supabase Auth is reachable, all required tables are in
the PostgREST schema cache, and the private storage buckets exist. If it reports
`PGRST205`, refresh the Supabase API schema cache or wait a minute after running
the migrations, then run it again.

For production deployments:

- Set `NEXT_PUBLIC_SUPABASE_URL` to the Supabase project URL.
- Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the Supabase anon key.
- Set `NEXT_PUBLIC_SITE_URL` to the deployed app URL, not `localhost`.
- Add `${NEXT_PUBLIC_SITE_URL}/auth/callback` to Supabase Auth redirect URLs.

## Routes

- `/` landing page shell
- `/login` Supabase email/password sign in
- `/signup` customer/dealer signup
- `/dashboard` authenticated dashboard shell
- `/dashboard/customer` customer application workspace
- `/dashboard/dealer` dealer inventory workspace
- `/dashboard/admin` admin-only console

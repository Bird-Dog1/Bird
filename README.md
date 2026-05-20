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

Apply the SQL in `supabase/migrations/0001_initial_schema.sql` to create:

- `profiles` with `customer`, `dealer`, and `admin` roles
- `customer_applications`
- `dealer_vehicles`
- private `vehicle-documents` storage bucket
- triggers and RLS policies

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

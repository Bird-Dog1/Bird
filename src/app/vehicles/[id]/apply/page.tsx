import Link from "next/link";

import { submitRentalApplication } from "@/app/actions/marketplace";
import { MessageBanner } from "@/components/app/message-banner";
import { SelectField, TextareaField, TextField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { requireRole } from "@/lib/auth/guards";
import { formatCurrency, vehicleTitle } from "@/lib/bird-dog/format";
import type { PublicVehicle } from "@/lib/bird-dog/types";
import { PUBLIC_VEHICLE_SELECT } from "@/lib/supabase/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "Apply" };
export default async function ApplyPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const { profile } = await requireRole(["customer"], `/vehicles/${id}/apply`);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("vehicles").select(PUBLIC_VEHICLE_SELECT).eq("id", id).eq("status", "available").eq("dealerships.approved", true).eq("dealerships.suspended", false).maybeSingle();
  if (error || !data) return <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8"><Card><CardHeader><CardTitle>Vehicle unavailable</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-muted-foreground">{error?.message ?? "This vehicle is no longer available."}</p><Button asChild><Link href="/vehicles">Browse vehicles</Link></Button></CardContent></Card></main>;
  const vehicle = data as PublicVehicle;
  return (
    <main className="mx-auto max-w-3xl space-y-7 px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Rental application</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">{vehicleTitle(vehicle)}</h1>
        <p className="mt-2 text-muted-foreground">{formatCurrency(vehicle.monthly_price)}/mo · {vehicle.dealerships.name}</p>
      </div>
      <MessageBanner error={query.error} />
      <Card className="border-white/15">
        <CardContent className="p-6 sm:p-7">
          <form action={submitRentalApplication} className="space-y-7">
            <input name="vehicle_id" type="hidden" value={vehicle.id} />
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Contact details</h2>
                <p className="text-sm text-muted-foreground">The dealership uses this information to review and follow up on your application.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField autoComplete="name" defaultValue={profile.full_name ?? ""} label="Full name" name="full_name" required />
                <TextField autoComplete="email" defaultValue={profile.email ?? ""} label="Email" name="email" required type="email" />
                <TextField autoComplete="tel" className="sm:col-span-2" defaultValue={profile.phone ?? ""} label="Phone" name="phone" required type="tel" />
              </div>
            </section>
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Eligibility basics</h2>
                <p className="text-sm text-muted-foreground">Document images are optional here, but license and insurance status are required.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label="Driver's license status" name="license_status" required>
                  <option value="">Select status</option>
                  <option value="Valid license">Valid license</option>
                  <option value="Permit only">Permit only</option>
                  <option value="Expired license">Expired license</option>
                  <option value="Suspended or revoked">Suspended or revoked</option>
                  <option value="No license">No license</option>
                </SelectField>
                <SelectField label="Insurance status" name="insurance_status" required>
                  <option value="">Select status</option>
                  <option value="Active policy">Active policy</option>
                  <option value="Can add vehicle before pickup">Can add vehicle before pickup</option>
                  <option value="Needs insurance">Needs insurance</option>
                  <option value="No active policy">No active policy</option>
                </SelectField>
                <FileField hint="Optional: upload a clear photo or PDF of your driver's license." label="Driver's license image" name="license" />
                <FileField hint="Optional: upload proof of active insurance." label="Insurance image" name="insurance" />
              </div>
            </section>
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Employment and timing</h2>
                <p className="text-sm text-muted-foreground">Share enough income context for the dealership to review fit.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label="Employment status" name="employment_status" required>
                  <option value="">Select status</option>
                  <option value="Employed full-time">Employed full-time</option>
                  <option value="Employed part-time">Employed part-time</option>
                  <option value="Self-employed">Self-employed</option>
                  <option value="Gig / rideshare income">Gig / rideshare income</option>
                  <option value="Other income">Other income</option>
                </SelectField>
                <TextField label="Employer or income source" name="income_source" placeholder="Company, platform, or source" required />
                <TextField inputMode="decimal" label="Estimated monthly income" min="0" name="monthly_income" placeholder="3500" required step="0.01" type="number" />
                <TextField label="Preferred start date" name="preferred_start_date" required type="date" />
              </div>
            </section>
            <TextareaField hint="Share timing, rideshare plans, or anything else the dealership should know." label="Notes for the dealership" name="customer_notes" rows={4} />
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-muted-foreground">Approval is not guaranteed. Valid license and active insurance may be required before pickup. Final approval, contract, and payments are handled by the dealership.</div>
            <SubmitButton className="w-full" pendingLabel="Submitting application...">Submit application</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
function FileField({ label, name, hint }: { label: string; name: string; hint: string }) { return <div className="space-y-2.5"><Label htmlFor={name}>{label}</Label><input accept="image/jpeg,image/png,image/webp,application/pdf" className="flex min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-foreground shadow-inner shadow-black/20 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" id={name} name={name} type="file" /><p className="text-xs leading-5 text-muted-foreground">{hint}</p></div>; }

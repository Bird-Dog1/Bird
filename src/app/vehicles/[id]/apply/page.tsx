import Link from "next/link";

import { submitRentalApplication } from "@/app/actions/marketplace";
import { MessageBanner } from "@/components/app/message-banner";
import { TextareaField } from "@/components/forms/form-field";
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
  await requireRole(["customer", "admin"]);
  const { id } = await params; const query = await searchParams; const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("vehicles").select(PUBLIC_VEHICLE_SELECT).eq("id", id).eq("status", "available").eq("dealerships.approved", true).eq("dealerships.suspended", false).maybeSingle();
  if (error || !data) return <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8"><Card><CardHeader><CardTitle>Vehicle unavailable</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-muted-foreground">{error?.message ?? "This vehicle is no longer available."}</p><Button asChild><Link href="/vehicles">Browse vehicles</Link></Button></CardContent></Card></main>;
  const vehicle = data as PublicVehicle;
  return <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6 lg:px-8"><div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Rental application</p><h1 className="mt-3 text-3xl font-bold">{vehicleTitle(vehicle)}</h1><p className="text-muted-foreground">{formatCurrency(vehicle.monthly_price)}/mo · {vehicle.dealerships.name}</p></div><MessageBanner error={query.error} /><Card><CardContent className="p-6"><form action={submitRentalApplication} className="space-y-5"><input name="vehicle_id" type="hidden" value={vehicle.id} /><FileField hint="Upload a clear photo or PDF of your valid driver's license." label="Driver's license" name="license" /><FileField hint="Upload proof of active insurance." label="Proof of insurance" name="insurance" /><TextareaField hint="Share timing, rideshare plans, or anything the dealership should know." label="Notes for the dealership" name="customer_notes" rows={4} /><div className="rounded-2xl border border-border bg-background/40 p-4 text-sm text-muted-foreground">Approval is not guaranteed. Valid license and active insurance required. Final approval, contract, and payment are handled by the dealership.</div><SubmitButton className="w-full" pendingLabel="Submitting application...">Submit application</SubmitButton></form></CardContent></Card></main>;
}
function FileField({ label, name, hint }: { label: string; name: string; hint: string }) { return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><input accept="image/jpeg,image/png,image/webp,application/pdf" className="flex min-h-11 w-full rounded-xl border border-input bg-background/60 px-3 py-2 text-sm text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground" id={name} name={name} required type="file" /><p className="text-xs text-muted-foreground">{hint}</p></div>; }

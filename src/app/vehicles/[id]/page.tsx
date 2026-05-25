import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, vehicleTitle } from "@/lib/bird-dog/format";
import type { PublicVehicle } from "@/lib/bird-dog/types";
import { PUBLIC_VEHICLE_SELECT } from "@/lib/supabase/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signVehiclePhotos } from "@/lib/supabase/storage";

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("vehicles").select(PUBLIC_VEHICLE_SELECT).eq("id", id).eq("status", "available").eq("dealerships.approved", true).eq("dealerships.suspended", false).maybeSingle();
  if (error || !data) return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><EmptyState action={<Button asChild><Link href="/vehicles">Browse available vehicles</Link></Button>} description={error?.message ?? "This vehicle is no longer available."} title="Vehicle unavailable" /></main>;
  const rawVehicle = data as PublicVehicle;
  const vehicle = { ...rawVehicle, vehicle_photos: await signVehiclePhotos(supabase, rawVehicle.vehicle_photos) };
  const title = vehicleTitle(vehicle);
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8"><div className="grid gap-8 lg:grid-cols-[1.1fr_0.7fr]"><section>{vehicle.vehicle_photos.length > 0 ? <div className="grid gap-4 sm:grid-cols-2">{vehicle.vehicle_photos.map((photo, index) => <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-white/10 bg-secondary shadow-2xl shadow-black/25" key={photo.id}>{photo.signed_url ? <Image alt={`${title} photo ${index + 1}`} className="object-cover" fill sizes="(min-width: 1024px) 50vw, 100vw" src={photo.signed_url} /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Photo unavailable</div>}</div>)}</div> : <div className="flex aspect-[16/8] items-center justify-center rounded-[2rem] border border-white/10 bg-secondary text-muted-foreground shadow-2xl shadow-black/25">Photos coming soon</div>}</section><aside className="space-y-6"><Card className="border-white/15"><CardHeader><p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">Available vehicle</p><CardTitle className="text-3xl">{title}</CardTitle><p className="text-sm text-muted-foreground">{vehicle.city}, {vehicle.state} · {vehicle.dealerships.name}</p></CardHeader><CardContent className="space-y-6"><div className="grid grid-cols-2 gap-4"><Detail label="Monthly price" value={formatCurrency(vehicle.monthly_price)} /><Detail label="Deposit" value={formatCurrency(vehicle.deposit)} /><Detail label="Mileage limit" value={vehicle.mileage_limit ? `${vehicle.mileage_limit}/mo` : "Ask dealer"} /><Detail label="Minimum age" value={`${vehicle.minimum_age}+`} /><Detail label="Insurance" value={vehicle.insurance_required ? "Required" : "Ask dealer"} /><Detail label="Rideshare" value={vehicle.rideshare_allowed ? "Allowed" : "Not listed"} /></div>{vehicle.description ? <p className="text-sm leading-6 text-muted-foreground">{vehicle.description}</p> : null}<div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-muted-foreground">Approval is not guaranteed. Valid license and active insurance required. Final approval, contract, and payment are handled by the dealership.</div><Button asChild className="w-full" size="lg"><Link href={`/vehicles/${vehicle.id}/apply` as Route}>Apply for this vehicle</Link></Button></CardContent></Card><Card><CardHeader><CardTitle>Dealership</CardTitle></CardHeader><CardContent className="space-y-2 text-sm leading-6 text-muted-foreground"><p className="font-semibold text-foreground">{vehicle.dealerships.name}</p><p>{[vehicle.dealerships.address, vehicle.dealerships.city, vehicle.dealerships.state, vehicle.dealerships.zip].filter(Boolean).join(", ")}</p>{vehicle.dealerships.phone ? <p>{vehicle.dealerships.phone}</p> : null}{vehicle.dealerships.website ? <a className="text-primary hover:text-white hover:underline" href={vehicle.dealerships.website}>{vehicle.dealerships.website}</a> : null}</CardContent></Card></aside></div></main>
  );
}
function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-lg shadow-black/15"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }

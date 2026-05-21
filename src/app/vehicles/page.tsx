import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { VehicleCard } from "@/components/marketplace/vehicle-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PublicVehicle } from "@/lib/bird-dog/types";
import { PUBLIC_VEHICLE_SELECT } from "@/lib/supabase/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signPublicVehicles } from "@/lib/supabase/storage";

type VehiclesPageProps = { searchParams: Promise<Record<string, string | undefined>> };
export const metadata = { title: "Browse vehicles" };

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  let query = supabase.from("vehicles").select(PUBLIC_VEHICLE_SELECT).eq("status", "available").eq("dealerships.approved", true).eq("dealerships.suspended", false).order("created_at", { ascending: false });
  if (params.city) query = query.ilike("city", `%${params.city}%`);
  if (params.state) query = query.ilike("state", `%${params.state}%`);
  if (params.make) query = query.ilike("make", `%${params.make}%`);
  if (params.model) query = query.ilike("model", `%${params.model}%`);
  if (params.vehicle_type) query = query.ilike("vehicle_type", `%${params.vehicle_type}%`);
  if (params.rideshare_allowed === "true") query = query.eq("rideshare_allowed", true);
  if (params.max_price && Number.isFinite(Number(params.max_price))) query = query.lte("monthly_price", Number(params.max_price));
  const { data, error } = await query;
  const vehicles = error ? [] : await signPublicVehicles(supabase, (data ?? []) as PublicVehicle[]);
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-4"><p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Bird Dog marketplace</p><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Monthly dealership rentals without traditional financing.</h1><p className="max-w-3xl text-muted-foreground">Approval is not guaranteed. Valid license and active insurance required. Final approval, contract, and payment are handled by the dealership.</p></section>
      <form className="grid gap-4 rounded-3xl border border-border bg-card/70 p-4 md:grid-cols-4 lg:grid-cols-8">
        <FilterField label="City" name="city" value={params.city} /><FilterField label="State" name="state" value={params.state} /><FilterField label="Max monthly" name="max_price" type="number" value={params.max_price} /><FilterField label="Make" name="make" value={params.make} /><FilterField label="Model" name="model" value={params.model} /><FilterField label="Type" name="vehicle_type" value={params.vehicle_type} />
        <div className="space-y-2"><Label htmlFor="rideshare_allowed">Rideshare</Label><select className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3 py-2 text-sm text-foreground" defaultValue={params.rideshare_allowed ?? ""} id="rideshare_allowed" name="rideshare_allowed"><option value="">Any</option><option value="true">Allowed</option></select></div>
        <div className="flex items-end gap-2"><Button className="flex-1" type="submit">Search</Button><Button asChild variant="outline"><Link href="/vehicles">Clear</Link></Button></div>
      </form>
      {error ? <EmptyState title="Vehicles could not load" description={error.message} /> : vehicles.length === 0 ? <EmptyState title="No vehicles match your search" description="Try widening your filters or check back when dealerships add more available inventory." /> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>}
    </main>
  );
}
function FilterField({ label, name, type = "text", value }: { label: string; name: string; type?: string; value?: string }) { return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input defaultValue={value ?? ""} id={name} name={name} type={type} /></div>; }

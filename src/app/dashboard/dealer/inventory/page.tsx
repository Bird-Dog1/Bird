import Link from "next/link";
import type { Route } from "next";

import { EmptyState } from "@/components/app/empty-state";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { listAccessibleDealerships } from "@/lib/bird-dog/dealer-data";
import { formatCurrency, vehicleTitle } from "@/lib/bird-dog/format";
import type { DealerVehicle } from "@/lib/bird-dog/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signVehiclePhotos } from "@/lib/supabase/storage";

export const metadata = { title: "Inventory" };
export default async function DealerInventoryPage() {
  const { user, profile } = await requireRole(["dealer", "admin"]); const supabase = await createServerSupabaseClient(); const { data: dealerships, error: dealershipError } = await listAccessibleDealerships(supabase, user.id, profile.role); const ids = dealerships.map((d) => d.id);
  if (dealershipError) return <EmptyState title="Inventory could not load" description={dealershipError.message} />;
  if (!ids.length) return <EmptyState action={<Button asChild><Link href="/dashboard/dealer/settings">Create dealership profile</Link></Button>} description="Inventory can be added after your dealership profile exists." title="No dealership assigned" />;
  const { data, error } = await supabase.from("vehicles").select("*, vehicle_photos (id, vehicle_id, photo_url, sort_order, created_at, updated_at)").in("dealership_id", ids).order("created_at", { ascending: false });
  const vehicles = await Promise.all(((data ?? []) as DealerVehicle[]).map(async (vehicle) => ({ ...vehicle, vehicle_photos: await signVehiclePhotos(supabase, vehicle.vehicle_photos) })));
  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-3xl font-bold">Inventory</h1><p className="mt-2 text-muted-foreground">Add, edit, price, and publish dealership vehicles.</p></div><Button asChild><Link href="/dashboard/dealer/inventory/new">Add vehicle</Link></Button></div>{error ? <EmptyState title="Vehicles could not load" description={error.message} /> : vehicles.length === 0 ? <EmptyState action={<Button asChild><Link href="/dashboard/dealer/inventory/new">Add your first vehicle</Link></Button>} description="Vehicles you add will be protected by dealership RLS." title="No inventory yet" /> : <div className="grid gap-4">{vehicles.map((vehicle) => <Card key={vehicle.id}><CardContent className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"><div><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-semibold">{vehicleTitle(vehicle)}</h2><StatusBadge value={vehicle.status} /></div><p className="mt-1 text-sm text-muted-foreground">VIN {vehicle.vin} · {vehicle.city}, {vehicle.state} · {vehicle.vehicle_photos.length} photos</p></div><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><p className="font-semibold text-primary">{formatCurrency(vehicle.monthly_price)}/mo</p><Button asChild variant="outline"><Link href={`/dashboard/dealer/inventory/${vehicle.id}/edit` as Route}>Edit</Link></Button></div></CardContent></Card>)}</div>}</div>;
}

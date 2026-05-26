import Link from "next/link";
import type { Route } from "next";

import { DashboardHero, InfoTile } from "@/components/app/dashboard-ui";
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
  const { user, profile } = await requireRole(["dealer", "admin"], "/dashboard/dealer/inventory"); const supabase = await createServerSupabaseClient(); const { data: dealerships, error: dealershipError } = await listAccessibleDealerships(supabase, user.id, profile.role); const ids = dealerships.map((d) => d.id);
  if (dealershipError) return <EmptyState title="Inventory could not load" description={dealershipError.message} />;
  if (!ids.length) return <EmptyState action={<Button asChild><Link href="/dashboard/dealer/settings">Create dealership profile</Link></Button>} description="Inventory can be added after your dealership profile exists." title="No dealership assigned" />;
  const { data, error } = await supabase.from("vehicles").select("*, vehicle_photos (id, vehicle_id, photo_url, sort_order, created_at, updated_at)").in("dealership_id", ids).order("created_at", { ascending: false });
  const vehicles = await Promise.all(((data ?? []) as DealerVehicle[]).map(async (vehicle) => ({ ...vehicle, vehicle_photos: await signVehiclePhotos(supabase, vehicle.vehicle_photos) })));
  return (
    <div className="space-y-7">
      <DashboardHero
        eyebrow="Dealer inventory"
        title="Keep your rental lineup ready."
        description="Add, edit, price, and publish dealership vehicles with clear availability and photo coverage."
        actions={<Button asChild><Link href="/dashboard/dealer/inventory/new">Add vehicle</Link></Button>}
      >
        <div className="grid gap-3 sm:grid-cols-4">
          <InfoTile label="Total vehicles" value={vehicles.length} />
          <InfoTile label="Available" value={vehicles.filter((vehicle) => vehicle.status === "available").length} />
          <InfoTile label="Pending" value={vehicles.filter((vehicle) => vehicle.status === "pending").length} />
          <InfoTile label="Rented" value={vehicles.filter((vehicle) => vehicle.status === "rented").length} />
        </div>
      </DashboardHero>
      {error ? (
        <EmptyState title="Vehicles could not load" description={error.message} />
      ) : vehicles.length === 0 ? (
        <EmptyState action={<Button asChild><Link href="/dashboard/dealer/inventory/new">Add your first vehicle</Link></Button>} description="Create a listing with photos, rental price, deposit, insurance rules, and availability so customers can apply." title="No inventory yet" />
      ) : (
        <div className="grid gap-4">
          {vehicles.map((vehicle) => (
            <Card className="border-white/10 bg-card/80 transition hover:border-white/20" key={vehicle.id}>
              <CardContent className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold tracking-[-0.03em]">{vehicleTitle(vehicle)}</h2>
                    <StatusBadge value={vehicle.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">VIN {vehicle.vin} · {vehicle.city}, {vehicle.state} · {vehicle.vehicle_photos.length} photos</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <InfoTile label="Monthly" value={`${formatCurrency(vehicle.monthly_price)}/mo`} />
                    <InfoTile label="Deposit" value={formatCurrency(vehicle.deposit)} />
                    <InfoTile label="Insurance" value={vehicle.insurance_required ? "Required" : "Ask dealer"} />
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                  <Button asChild variant="outline"><Link href={`/dashboard/dealer/inventory/${vehicle.id}/edit` as Route}>Edit listing</Link></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

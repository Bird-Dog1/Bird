import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import {
  AdminDataTable,
  AdminEmptyState,
  AdminPageHeader,
  AdminStatusBadge,
  AdminTableCell,
} from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/guards";
import { fetchAdminDashboardData, includesSearch } from "@/lib/admin/data";
import { formatCurrency, vehicleTitle } from "@/lib/bird-dog/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "All vehicles" };
export default async function AdminVehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const data = await fetchAdminDashboardData(supabase);
  const query = params.q?.trim() ?? "";
  const vehicles = query
    ? data.vehicles.filter(
        (vehicle) =>
          includesSearch(vehicle.vin, query) ||
          includesSearch(vehicle.make, query) ||
          includesSearch(vehicle.model, query) ||
          includesSearch(vehicle.dealerships?.name, query),
      )
    : data.vehicles;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description="Read-only inventory view across every dealership. Admins can open public vehicle pages without entering dealer edit flows."
        title="Inventory"
      />
      <Search value={query} />
      <AdminDataTable
        columns={["Image", "Vehicle", "VIN", "Dealership", "Monthly", "Mileage", "Status", "Created", "View"]}
        empty={<AdminEmptyState description="No records found yet." />}
        rows={vehicles.map((vehicle) => (
          <>
            <AdminTableCell>
              <div className="relative h-14 w-20 overflow-hidden rounded-xl border border-white/10 bg-white/[0.05]">
                {vehicle.vehicle_photos[0]?.signed_url ? (
                  <Image
                    alt={vehicleTitle(vehicle)}
                    className="object-cover"
                    fill
                    sizes="80px"
                    src={vehicle.vehicle_photos[0].signed_url}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
            </AdminTableCell>
            <AdminTableCell className="font-semibold">{vehicleTitle(vehicle)}</AdminTableCell>
            <AdminTableCell>{vehicle.vin ?? "Not provided"}</AdminTableCell>
            <AdminTableCell>{vehicle.dealerships?.name ?? "Dealership"}</AdminTableCell>
            <AdminTableCell>{formatCurrency(vehicle.monthly_price)}/mo</AdminTableCell>
            <AdminTableCell>{vehicle.mileage_limit ? `${vehicle.mileage_limit.toLocaleString()} mi` : "Not set"}</AdminTableCell>
            <AdminTableCell><AdminStatusBadge value={vehicle.status} /></AdminTableCell>
            <AdminTableCell>{new Date(vehicle.created_at).toLocaleDateString()}</AdminTableCell>
            <AdminTableCell>
              <Button asChild size="sm" variant="outline">
                <Link href={`/vehicles/${vehicle.id}` as Route}>View</Link>
              </Button>
            </AdminTableCell>
          </>
        ))}
      />
    </div>
  );
}

function Search({ value }: { value?: string }) {
  return (
    <form className="flex gap-2 rounded-[2rem] border border-white/10 bg-card/85 p-3 shadow-2xl shadow-black/20">
      <input
        className="flex h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-foreground shadow-inner shadow-black/20 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        defaultValue={value ?? ""}
        name="q"
        placeholder="Search VIN, make, model, or dealership"
      />
      <Button type="submit">Search</Button>
    </form>
  );
}

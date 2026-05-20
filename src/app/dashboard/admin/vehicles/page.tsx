import Link from "next/link";
import { type Route } from "next";

import {
  AdminAlert,
  AdminPageHeader,
  AdminSearch,
  AdminTable,
  StatusBadge,
  TableCell,
  TableHead,
  TableHeaderCell,
} from "@/app/dashboard/admin/_components";
import {
  formatDate,
  formatMoney,
  getQueryIssue,
  matchesSearch,
  normalizeSearch,
  statusTone,
} from "@/app/dashboard/admin/_utils";
import { requireRole } from "@/lib/auth/guards";
import { type Tables } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = {
  title: "All vehicles",
};

type VehiclesPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

type VehicleRow = Tables<"vehicles"> & {
  dealerships: Pick<
    Tables<"dealerships">,
    "id" | "name" | "approved" | "suspended"
  > | null;
  rental_applications: Array<{ id: string; status: string }> | null;
  rentals: Array<{ id: string; active: boolean }> | null;
};

export default async function AllVehiclesPage({ searchParams }: VehiclesPageProps) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const search = normalizeSearch(params.q);
  const supabase = await createServerSupabaseClient();

  const vehicles = await supabase
    .from("vehicles")
    .select(
      `
        *,
        dealerships ( id, name, approved, suspended ),
        rental_applications ( id, status ),
        rentals ( id, active )
      `,
    )
    .order("created_at", { ascending: false });

  const issue = getQueryIssue([vehicles]);
  const rows = ((vehicles.data ?? []) as VehicleRow[]).filter((vehicle) =>
    matchesSearch(search, [
      vehicle.vin,
      vehicle.year,
      vehicle.make,
      vehicle.model,
      vehicle.trim,
      vehicle.vehicle_type,
      vehicle.city,
      vehicle.state,
      vehicle.status,
      vehicle.dealerships?.name,
    ]),
  );

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        description="Inspect every vehicle record across approved, pending, and suspended dealerships."
        title="All vehicles"
      />
      <AdminSearch
        defaultValue={params.q}
        placeholder="Search VIN, make, model, status, city, or dealership..."
      />
      {issue ? <AdminAlert>{issue.message}</AdminAlert> : null}
      <AdminTable empty={!rows.length} emptyMessage="No vehicles match this search.">
        <TableHead>
          <tr>
            <TableHeaderCell>Vehicle</TableHeaderCell>
            <TableHeaderCell>Dealership</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Price</TableHeaderCell>
            <TableHeaderCell>Applications</TableHeaderCell>
            <TableHeaderCell>Created</TableHeaderCell>
          </tr>
        </TableHead>
        <tbody>
          {rows.map((vehicle) => (
            <tr className="border-b border-border/60" key={vehicle.id}>
              <TableCell>
                <p className="font-medium">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
                <p className="text-xs text-muted-foreground">
                  VIN {vehicle.vin} {vehicle.trim ? `- ${vehicle.trim}` : ""}
                </p>
              </TableCell>
              <TableCell>
                {vehicle.dealerships ? (
                  <Link
                    className="hover:underline"
                    href={
                      `/dashboard/admin/dealerships/${vehicle.dealerships.id}` as Route
                    }
                  >
                    {vehicle.dealerships.name}
                  </Link>
                ) : (
                  "Unknown"
                )}
                <p className="text-xs text-muted-foreground">
                  {vehicle.city}, {vehicle.state}
                </p>
              </TableCell>
              <TableCell>
                <StatusBadge tone={statusTone(vehicle.status)}>
                  {vehicle.status}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <p>{formatMoney(vehicle.monthly_price)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatMoney(vehicle.deposit)} deposit
                </p>
              </TableCell>
              <TableCell>
                <p>{vehicle.rental_applications?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">
                  {(vehicle.rentals ?? []).filter((rental) => rental.active).length} active
                  rentals
                </p>
              </TableCell>
              <TableCell>{formatDate(vehicle.created_at)}</TableCell>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}

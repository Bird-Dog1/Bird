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
import { fetchAdminDashboardData, getNextDueDate, includesSearch } from "@/lib/admin/data";
import { formatCurrency, formatDate, vehicleTitle } from "@/lib/bird-dog/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "All rentals" };
export default async function AdminRentalsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const data = await fetchAdminDashboardData(supabase);
  const query = params.q?.trim() ?? "";
  const rentals = query
    ? data.rentals.filter(
        (rental) =>
          includesSearch(rental.profiles?.email, query) ||
          includesSearch(rental.profiles?.full_name, query) ||
          includesSearch(rental.dealerships?.name, query) ||
          includesSearch(rental.vehicles?.vin, query) ||
          includesSearch(rental.start_date, query),
      )
    : data.rentals;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description="Read-only active and historical rental records with customer, vehicle, dealership, and purchase path context."
        title="Rentals"
      />
      <Search value={query} />
      <AdminDataTable
        columns={["Customer", "Vehicle", "Dealership", "Start", "Monthly", "Next due", "Status", "Purchase option", "Details"]}
        empty={<AdminEmptyState description="No records found yet." />}
        rows={rentals.map((rental) => (
          <>
            <AdminTableCell className="font-semibold">{rental.profiles?.full_name ?? rental.profiles?.email ?? "Customer"}</AdminTableCell>
            <AdminTableCell>{rental.vehicles ? vehicleTitle(rental.vehicles) : "Vehicle unavailable"}</AdminTableCell>
            <AdminTableCell>{rental.dealerships?.name ?? "Dealership"}</AdminTableCell>
            <AdminTableCell>{formatDate(rental.start_date)}</AdminTableCell>
            <AdminTableCell>{formatCurrency(rental.monthly_rate)}</AdminTableCell>
            <AdminTableCell>{formatDate(getNextDueDate(rental.start_date))}</AdminTableCell>
            <AdminTableCell><AdminStatusBadge value={rental.active ? "active" : "inactive"} /></AdminTableCell>
            <AdminTableCell>Subject to dealership terms</AdminTableCell>
            <AdminTableCell>
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/admin/rentals/${rental.id}` as Route}>View details</Link>
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
        placeholder="Search customer, vehicle, dealership, or date"
      />
      <Button type="submit">Search</Button>
    </form>
  );
}

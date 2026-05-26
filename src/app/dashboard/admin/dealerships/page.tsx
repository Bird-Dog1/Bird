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
import { countBy, fetchAdminDashboardData, includesSearch } from "@/lib/admin/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "Dealership approvals" };
export default async function AdminDealershipsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const data = await fetchAdminDashboardData(supabase);
  const query = params.q?.trim() ?? "";
  const dealerships = query
    ? data.dealerships.filter(
        (dealership) =>
          includesSearch(dealership.name, query) ||
          includesSearch(dealership.city, query) ||
          includesSearch(dealership.state, query),
      )
    : data.dealerships;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description="Read-only dealership coverage, contact health, inventory depth, applications, rentals, and payment activity when records exist."
        title="Dealerships"
      />
      <Search value={query} />
      <AdminDataTable
        columns={[
          "Dealership",
          "Contact",
          "Location",
          "Vehicles",
          "Applications",
          "Active rentals",
          "Payment activity",
          "Status",
          "Details",
        ]}
        empty={<AdminEmptyState description="No records found yet." />}
        rows={dealerships.map((dealership) => (
          <>
            <AdminTableCell className="font-semibold">{dealership.name}</AdminTableCell>
            <AdminTableCell>{dealership.phone ?? "Not provided"}</AdminTableCell>
            <AdminTableCell>{[dealership.city, dealership.state].filter(Boolean).join(", ")}</AdminTableCell>
            <AdminTableCell>{countBy(data.vehicles, (vehicle) => vehicle.dealership_id === dealership.id)}</AdminTableCell>
            <AdminTableCell>{countBy(data.applications, (application) => application.dealership_id === dealership.id)}</AdminTableCell>
            <AdminTableCell>{countBy(data.rentals, (rental) => rental.dealership_id === dealership.id && rental.active)}</AdminTableCell>
            <AdminTableCell>{data.payments.length ? "Payment records available" : "No payment records"}</AdminTableCell>
            <AdminTableCell>
              <AdminStatusBadge value={dealership.suspended ? "suspended" : dealership.approved ? "approved" : "pending"} />
            </AdminTableCell>
            <AdminTableCell>
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/admin/dealerships/${dealership.id}` as Route}>View details</Link>
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
        placeholder="Search dealership, city, or state"
      />
      <Button type="submit">Search</Button>
    </form>
  );
}

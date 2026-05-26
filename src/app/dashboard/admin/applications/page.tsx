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
import { formatDate, vehicleTitle } from "@/lib/bird-dog/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "All applications" };
export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const data = await fetchAdminDashboardData(supabase);
  const query = params.q?.trim() ?? "";
  const applications = query
    ? data.applications.filter(
        (application) =>
          includesSearch(application.status, query) ||
          includesSearch(application.profiles?.email, query) ||
          includesSearch(application.profiles?.full_name, query) ||
          includesSearch(application.dealerships?.name, query) ||
          includesSearch(application.vehicles?.vin, query),
      )
    : data.applications;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description="Read-only application queue across customers, vehicles, dealerships, approval statuses, and submitted documents."
        title="Applications"
      />
      <Search value={query} />
      <AdminDataTable
        columns={["Applicant", "Email / Phone", "Vehicle", "Dealership", "Status", "Submitted", "Approval", "Details"]}
        empty={<AdminEmptyState description="No records found yet." />}
        rows={applications.map((application) => (
          <>
            <AdminTableCell className="font-semibold">
              {application.profiles?.full_name ?? "Not provided"}
            </AdminTableCell>
            <AdminTableCell>
              <span className="block">{application.profiles?.email ?? "Not provided"}</span>
              <span className="text-muted-foreground">{application.profiles?.phone ?? "No phone"}</span>
            </AdminTableCell>
            <AdminTableCell>{application.vehicles ? vehicleTitle(application.vehicles) : "Vehicle unavailable"}</AdminTableCell>
            <AdminTableCell>{application.dealerships?.name ?? "Dealership"}</AdminTableCell>
            <AdminTableCell><AdminStatusBadge value={application.status} /></AdminTableCell>
            <AdminTableCell>{formatDate(application.created_at)}</AdminTableCell>
            <AdminTableCell>{application.status === "approved" ? "Approved" : application.status === "denied" ? "Denied" : "Pending"}</AdminTableCell>
            <AdminTableCell>
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/admin/applications/${application.id}` as Route}>View details</Link>
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
        placeholder="Search applicant, status, VIN, or dealership"
      />
      <Button type="submit">Search</Button>
    </form>
  );
}

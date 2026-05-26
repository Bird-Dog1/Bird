import Link from "next/link";

import {
  AdminDataTable,
  AdminEmptyState,
  AdminMetricCard,
  AdminPageHeader,
  AdminStatusBadge,
  AdminTableCell,
} from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { fetchAdminDashboardData, getDealershipNamesForUser } from "@/lib/admin/data";
import { formatCurrency, formatDate, vehicleTitle } from "@/lib/bird-dog/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "User detail" };

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const data = await fetchAdminDashboardData(supabase);
  const profile = data.profiles.find((user) => user.id === id);

  if (!profile) {
    return <AdminEmptyState description="No records found yet." title="User not found" />;
  }

  const applications = data.applications.filter((application) => application.customer_id === id);
  const rentals = data.rentals.filter((rental) => rental.customer_id === id);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description="Read-only profile, linked dealership, applications, and rental activity."
        eyebrow="User detail"
        title={profile.full_name ?? profile.email ?? "User"}
      >
        <AdminStatusBadge value={profile.role} />
      </AdminPageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Applications" value={applications.length} />
        <AdminMetricCard label="Rentals" value={rentals.length} />
        <AdminMetricCard label="Linked dealership" value={getDealershipNamesForUser(data.dealerUsers, profile.id)} />
        <AdminMetricCard label="Status" value="Active" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Info label="Email" value={profile.email} />
          <Info label="Phone" value={profile.phone} />
          <Info label="Role" value={profile.role} />
          <Info label="Created" value={formatDate(profile.created_at)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminDataTable
            columns={["Vehicle", "Dealership", "Status", "Submitted"]}
            empty={<AdminEmptyState description="No records found yet." />}
            rows={applications.map((application) => (
              <>
                <AdminTableCell>{application.vehicles ? vehicleTitle(application.vehicles) : "Vehicle unavailable"}</AdminTableCell>
                <AdminTableCell>{application.dealerships?.name ?? "Dealership"}</AdminTableCell>
                <AdminTableCell><AdminStatusBadge value={application.status} /></AdminTableCell>
                <AdminTableCell>{formatDate(application.created_at)}</AdminTableCell>
              </>
            ))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rentals</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminDataTable
            columns={["Vehicle", "Dealership", "Monthly", "Status"]}
            empty={<AdminEmptyState description="No records found yet." />}
            rows={rentals.map((rental) => (
              <>
                <AdminTableCell>{rental.vehicles ? vehicleTitle(rental.vehicles) : "Vehicle unavailable"}</AdminTableCell>
                <AdminTableCell>{rental.dealerships?.name ?? "Dealership"}</AdminTableCell>
                <AdminTableCell>{formatCurrency(rental.monthly_rate)}</AdminTableCell>
                <AdminTableCell><AdminStatusBadge value={rental.active ? "active" : "inactive"} /></AdminTableCell>
              </>
            ))}
          />
        </CardContent>
      </Card>

      <Button asChild variant="outline">
        <Link href="/dashboard/admin/users">Back to users</Link>
      </Button>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value || "Not provided"}</p>
    </div>
  );
}

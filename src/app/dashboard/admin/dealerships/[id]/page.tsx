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
import { countBy, fetchAdminDashboardData } from "@/lib/admin/data";
import { formatDate } from "@/lib/bird-dog/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "Dealership detail" };
export default async function AdminDealershipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const data = await fetchAdminDashboardData(supabase);
  const dealership = data.dealerships.find((item) => item.id === id);

  if (!dealership) {
    return <AdminEmptyState description="No records found yet." title="Dealership not found" />;
  }

  const dealerUsers = data.dealerUsers.filter((dealerUser) => dealerUser.dealership_id === id);
  const vehicles = data.vehicles.filter((vehicle) => vehicle.dealership_id === id);
  const applications = data.applications.filter((application) => application.dealership_id === id);
  const rentals = data.rentals.filter((rental) => rental.dealership_id === id);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description="Read-only dealership detail. Approval and assignment controls are intentionally excluded from this owner dashboard."
        eyebrow="Dealership detail"
        title={dealership.name}
      >
        <AdminStatusBadge value={dealership.suspended ? "suspended" : dealership.approved ? "approved" : "pending"} />
      </AdminPageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Vehicles" value={vehicles.length} />
        <AdminMetricCard label="Applications" value={applications.length} />
        <AdminMetricCard label="Active rentals" value={countBy(rentals, (rental) => rental.active)} />
        <AdminMetricCard label="Payment activity" value={data.payments.length ? "Available" : "No records"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Dealership profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Info label="Name" value={dealership.name} />
            <Info label="Phone" value={dealership.phone} />
            <Info label="Website" value={dealership.website} />
            <Info label="Address" value={dealership.address} />
            <Info label="City" value={dealership.city} />
            <Info label="State" value={dealership.state} />
            <Info label="ZIP" value={dealership.zip} />
            <Info label="Created" value={formatDate(dealership.created_at)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dealer users</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminDataTable
              columns={["User", "Assigned"]}
              empty={<AdminEmptyState description="No records found yet." />}
              rows={dealerUsers.map((dealerUser) => {
                const profile = data.profiles.find((user) => user.id === dealerUser.user_id);

                return (
                  <>
                    <AdminTableCell>{profile?.full_name ?? profile?.email ?? "User"}</AdminTableCell>
                    <AdminTableCell>{formatDate(dealerUser.created_at)}</AdminTableCell>
                  </>
                );
              })}
            />
          </CardContent>
        </Card>
      </div>

      <Button asChild variant="outline">
        <Link href="/dashboard/admin/dealerships">Back to dealerships</Link>
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

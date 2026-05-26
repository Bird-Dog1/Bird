import {
  AdminDataTable,
  AdminEmptyState,
  AdminMetricCard,
  AdminPageHeader,
  AdminStatusBadge,
  AdminTableCell,
} from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/auth/guards";
import {
  countBy,
  fetchAdminDashboardData,
  getPaymentStatus,
  isPaymentOverdue,
} from "@/lib/admin/data";
import { vehicleTitle } from "@/lib/bird-dog/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Flag = {
  area: string;
  detail: string;
  severity: string;
  subject: string;
};

export const metadata = { title: "Issues / Flags" };

export default async function AdminIssuesPage() {
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const data = await fetchAdminDashboardData(supabase);
  const flags: Flag[] = [
    ...data.payments
      .filter((payment) => getPaymentStatus(payment).toLowerCase() === "failed")
      .map((payment) => ({
        area: "Payments",
        detail: "Failed payment",
        severity: "failed",
        subject: String(payment.customer_email ?? payment.customer_id ?? payment.id ?? "Payment"),
      })),
    ...data.payments
      .filter(isPaymentOverdue)
      .map((payment) => ({
        area: "Payments",
        detail: "Overdue payment",
        severity: "overdue",
        subject: String(payment.customer_email ?? payment.customer_id ?? payment.id ?? "Payment"),
      })),
    ...data.applications
      .filter((application) => !application.vehicles)
      .map((application) => ({
        area: "Applications",
        detail: "Application missing vehicle",
        severity: "pending",
        subject: application.profiles?.email ?? application.id,
      })),
    ...data.vehicles
      .filter((vehicle) => Number(vehicle.monthly_price) <= 0 || vehicle.vehicle_photos.length === 0)
      .map((vehicle) => ({
        area: "Inventory",
        detail: Number(vehicle.monthly_price) <= 0 ? "Vehicle missing price" : "Vehicle missing images",
        severity: "pending",
        subject: vehicleTitle(vehicle),
      })),
    ...data.profiles
      .filter((profile) => profile.role === "customer" && (!profile.full_name || !profile.phone))
      .map((profile) => ({
        area: "Customers",
        detail: "Customer missing required info",
        severity: "pending",
        subject: profile.email ?? profile.id,
      })),
    ...data.dealerships
      .filter((dealership) => !dealership.phone || !dealership.address)
      .map((dealership) => ({
        area: "Dealerships",
        detail: "Dealership missing contact info",
        severity: "pending",
        subject: dealership.name,
      })),
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description="Operational attention queue built from real records only. Missing payment infrastructure is not treated as failed payment data."
        title="Issues / Flags"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Total flags" value={flags.length} />
        <AdminMetricCard label="Failed payments" value={countBy(flags, (flag) => flag.detail === "Failed payment")} />
        <AdminMetricCard label="Vehicle data gaps" value={countBy(flags, (flag) => flag.area === "Inventory")} />
        <AdminMetricCard label="Profile gaps" value={countBy(flags, (flag) => flag.area === "Customers" || flag.area === "Dealerships")} />
      </div>

      <AdminDataTable
        columns={["Area", "Subject", "Issue", "Severity"]}
        empty={<AdminEmptyState description="No records found yet." title="No flags found" />}
        rows={flags.map((flag) => (
          <>
            <AdminTableCell>{flag.area}</AdminTableCell>
            <AdminTableCell className="font-semibold">{flag.subject}</AdminTableCell>
            <AdminTableCell>{flag.detail}</AdminTableCell>
            <AdminTableCell><AdminStatusBadge value={flag.severity} /></AdminTableCell>
          </>
        ))}
      />
    </div>
  );
}

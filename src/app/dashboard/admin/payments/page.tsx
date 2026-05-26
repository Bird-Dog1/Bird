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
  getPaymentDisplayAmount,
  getPaymentStatus,
  isPaymentOverdue,
} from "@/lib/admin/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "Payments" };

export default async function AdminPaymentsPage() {
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const data = await fetchAdminDashboardData(supabase);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description="Read-only payment records if a payments table exists. Missing payment infrastructure is shown as an empty state and logged server-side."
        title="Payments"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Payment records" value={data.payments.length} />
        <AdminMetricCard label="Failed payments" value={countBy(data.payments, (payment) => getPaymentStatus(payment).toLowerCase() === "failed")} />
        <AdminMetricCard label="Overdue payments" value={countBy(data.payments, isPaymentOverdue)} />
        <AdminMetricCard label="Payment source" value={data.paymentError ? "Not connected" : "Connected"} />
      </div>

      <AdminDataTable
        columns={["Customer", "Dealership", "Vehicle / Rental", "Amount", "Status", "Due date", "Paid date", "Stripe / Payment ID", "Overdue"]}
        empty={<AdminEmptyState description="No records found yet." />}
        rows={data.payments.map((payment) => (
          <>
            <AdminTableCell>{String(payment.customer_email ?? payment.email ?? payment.customer_id ?? "Customer")}</AdminTableCell>
            <AdminTableCell>{String(payment.dealership_name ?? payment.dealership_id ?? "Dealership")}</AdminTableCell>
            <AdminTableCell>{String(payment.vehicle_id ?? payment.rental_id ?? "Not linked")}</AdminTableCell>
            <AdminTableCell>{getPaymentDisplayAmount(payment)}</AdminTableCell>
            <AdminTableCell><AdminStatusBadge value={getPaymentStatus(payment)} /></AdminTableCell>
            <AdminTableCell>{String(payment.due_date ?? payment.due_at ?? "Not set")}</AdminTableCell>
            <AdminTableCell>{String(payment.paid_date ?? payment.paid_at ?? "Not set")}</AdminTableCell>
            <AdminTableCell>{String(payment.stripe_payment_id ?? payment.payment_intent_id ?? payment.id ?? "Not set")}</AdminTableCell>
            <AdminTableCell><AdminStatusBadge value={isPaymentOverdue(payment) ? "overdue" : "not overdue"} /></AdminTableCell>
          </>
        ))}
      />
    </div>
  );
}

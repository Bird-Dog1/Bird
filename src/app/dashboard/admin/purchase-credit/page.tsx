import {
  AdminDataTable,
  AdminEmptyState,
  AdminMetricCard,
  AdminPageHeader,
  AdminTableCell,
} from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/auth/guards";
import {
  fetchAdminDashboardData,
  getPaymentAmount,
} from "@/lib/admin/data";
import { formatCurrency, vehicleTitle } from "@/lib/bird-dog/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "Purchase Credit" };

export default async function AdminPurchaseCreditPage() {
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const data = await fetchAdminDashboardData(supabase);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description="Read-only ownership path view. Rental credit is only shown when payment records exist; all terms remain subject to dealership terms."
        title="Purchase Credit / Ownership Path"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Active rentals" value={data.rentals.filter((rental) => rental.active).length} />
        <AdminMetricCard label="Payment records" value={data.payments.length} />
        <AdminMetricCard label="Credit policy" value="Dealer terms" />
        <AdminMetricCard label="Fund holding" value="Not supported" />
      </div>

      <AdminDataTable
        columns={["Customer", "Vehicle", "Dealership", "Eligible rental credit", "Total paid", "Credit terms"]}
        empty={<AdminEmptyState description="No records found yet." />}
        rows={data.rentals.map((rental) => {
          const matchingPayments = data.payments.filter(
            (payment) => payment.rental_id === rental.id || payment.customer_id === rental.customer_id,
          );
          const totalPaid = matchingPayments.reduce((total, payment) => total + getPaymentAmount(payment), 0);

          return (
            <>
              <AdminTableCell className="font-semibold">{rental.profiles?.full_name ?? rental.profiles?.email ?? "Customer"}</AdminTableCell>
              <AdminTableCell>{rental.vehicles ? vehicleTitle(rental.vehicles) : "Vehicle unavailable"}</AdminTableCell>
              <AdminTableCell>{rental.dealerships?.name ?? "Dealership"}</AdminTableCell>
              <AdminTableCell>{matchingPayments.length ? "Available in payment records" : "Not tracked"}</AdminTableCell>
              <AdminTableCell>{matchingPayments.length ? formatCurrency(totalPaid) : "No payment records"}</AdminTableCell>
              <AdminTableCell>Subject to dealership terms</AdminTableCell>
            </>
          );
        })}
      />
    </div>
  );
}

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
import {
  fetchAdminDashboardData,
  getNextDueDate,
  getPaymentDisplayAmount,
  getPaymentStatus,
} from "@/lib/admin/data";
import { formatCurrency, formatDate, vehicleTitle } from "@/lib/bird-dog/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "Rental detail" };

export default async function AdminRentalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const data = await fetchAdminDashboardData(supabase);
  const rental = data.rentals.find((item) => item.id === id);

  if (!rental) {
    return <AdminEmptyState description="No records found yet." title="Rental not found" />;
  }

  const matchingPayments = data.payments.filter(
    (payment) => payment.rental_id === rental.id || payment.customer_id === rental.customer_id,
  );

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description="Read-only rental detail with payment records when a payments table is available."
        eyebrow="Rental detail"
        title={rental.vehicles ? vehicleTitle(rental.vehicles) : "Vehicle unavailable"}
      >
        <AdminStatusBadge value={rental.active ? "active" : "inactive"} />
      </AdminPageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Monthly amount" value={formatCurrency(rental.monthly_rate)} />
        <AdminMetricCard label="Deposit" value={formatCurrency(rental.deposit)} />
        <AdminMetricCard label="Next due date" value={formatDate(getNextDueDate(rental.start_date))} />
        <AdminMetricCard label="Purchase option" value="Dealer terms" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Info label="Name" value={rental.profiles?.full_name} />
            <Info label="Email" value={rental.profiles?.email} />
            <Info label="Phone" value={rental.profiles?.phone} />
            <Info label="Start date" value={formatDate(rental.start_date)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle and dealership</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Info label="Vehicle" value={rental.vehicles ? vehicleTitle(rental.vehicles) : null} />
            <Info label="VIN" value={rental.vehicles?.vin} />
            <Info label="Dealership" value={rental.dealerships?.name} />
            <Info label="End date" value={formatDate(rental.end_date)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Related payment records</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminDataTable
            columns={["Amount", "Status", "Due date", "Paid date", "Payment ID"]}
            empty={<AdminEmptyState description="No records found yet." />}
            rows={matchingPayments.map((payment) => (
              <>
                <AdminTableCell>{getPaymentDisplayAmount(payment)}</AdminTableCell>
                <AdminTableCell><AdminStatusBadge value={getPaymentStatus(payment)} /></AdminTableCell>
                <AdminTableCell>{String(payment.due_date ?? payment.due_at ?? "Not set")}</AdminTableCell>
                <AdminTableCell>{String(payment.paid_date ?? payment.paid_at ?? "Not set")}</AdminTableCell>
                <AdminTableCell>{String(payment.stripe_payment_id ?? payment.payment_intent_id ?? payment.id ?? "Not set")}</AdminTableCell>
              </>
            ))}
          />
        </CardContent>
      </Card>

      <Button asChild variant="outline">
        <Link href="/dashboard/admin/rentals">Back to rentals</Link>
      </Button>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value || "Not provided"}</p>
    </div>
  );
}

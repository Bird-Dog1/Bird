import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

import {
  AdminDataTable,
  AdminEmptyState,
  AdminMetricCard,
  AdminPageHeader,
  AdminStatusBadge,
  AdminTableCell,
  adminNavItems,
} from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import {
  countBy,
  fetchAdminDashboardData,
  getMonthlyPaymentVolume,
  getPaymentDisplayAmount,
  getPaymentStatus,
  isPaymentOverdue,
} from "@/lib/admin/data";
import { formatCurrency, formatDate, vehicleTitle } from "@/lib/bird-dog/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin console" };
export default async function AdminDashboardPage() {
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const data = await fetchAdminDashboardData(supabase);
  const activeApplications = countBy(
    data.applications,
    (application) => application.status === "submitted" || application.status === "under_review",
  );
  const monthlyPaymentVolume = data.payments.length
    ? getMonthlyPaymentVolume(data.payments)
    : null;
  const overduePayments = data.payments.length ? countBy(data.payments, isPaymentOverdue) : null;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description="Read-only owner view for users, dealerships, vehicles, applications, rentals, payment records, and operational flags."
        eyebrow="Platform control"
        title="Bird Dog Admin"
      >
        <Button asChild variant="outline">
          <Link href={"/dashboard/admin/issues" as Route}>Review flags</Link>
        </Button>
      </AdminPageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Total users" value={data.profiles.length} />
        <AdminMetricCard
          description={`${countBy(data.profiles, (profile) => profile.role === "customer")} customers`}
          label="Customers"
          value={countBy(data.profiles, (profile) => profile.role === "customer")}
        />
        <AdminMetricCard
          description={`${countBy(data.profiles, (profile) => profile.role === "dealer")} dealer users`}
          label="Dealers"
          value={countBy(data.profiles, (profile) => profile.role === "dealer")}
        />
        <AdminMetricCard
          description={`${countBy(data.vehicles, (vehicle) => vehicle.status === "available")} available`}
          label="Vehicles"
          value={data.vehicles.length}
        />
        <AdminMetricCard
          description={`${countBy(data.applications, (application) => application.status === "approved")} approved`}
          label="Active applications"
          value={activeApplications}
        />
        <AdminMetricCard
          description={`${countBy(data.applications, (application) => application.status === "denied")} denied`}
          label="Approved applications"
          value={countBy(data.applications, (application) => application.status === "approved")}
        />
        <AdminMetricCard
          description="Currently active rental records"
          label="Active rentals"
          value={countBy(data.rentals, (rental) => rental.active)}
        />
        <AdminMetricCard
          description={data.payments.length ? "From payment records this month" : "No payment records found"}
          label="Monthly payment volume"
          value={monthlyPaymentVolume === null ? "Not connected" : formatCurrency(monthlyPaymentVolume)}
        />
        <AdminMetricCard
          description={data.payments.length ? "Payment records past due" : "No payment records found"}
          label="Overdue payments"
          value={overduePayments === null ? "Not connected" : overduePayments}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {adminNavItems.slice(1).map((item) => (
          <Action href={item.href} key={item.href} title={item.label} />
        ))}
      </div>

      <section className="grid gap-5 xl:grid-cols-3">
        <OverviewTable
          columns={["Applicant", "Vehicle", "Status", "Submitted"]}
          empty="Applications will appear after customers apply."
          rows={data.applications.slice(0, 5).map((application) => (
            <>
              <AdminTableCell>{application.profiles?.full_name ?? application.profiles?.email ?? "Customer"}</AdminTableCell>
              <AdminTableCell>{application.vehicles ? vehicleTitle(application.vehicles) : "Vehicle unavailable"}</AdminTableCell>
              <AdminTableCell><AdminStatusBadge value={application.status} /></AdminTableCell>
              <AdminTableCell>{formatDate(application.created_at)}</AdminTableCell>
            </>
          ))}
          title="Recent applications"
        />
        <OverviewTable
          columns={["Customer", "Amount", "Status", "Due/Paid"]}
          empty="No records found yet."
          rows={data.payments.slice(0, 5).map((payment) => (
            <>
              <AdminTableCell>{String(payment.customer_email ?? payment.email ?? payment.customer_id ?? "Customer")}</AdminTableCell>
              <AdminTableCell>{getPaymentDisplayAmount(payment)}</AdminTableCell>
              <AdminTableCell><AdminStatusBadge value={getPaymentStatus(payment)} /></AdminTableCell>
              <AdminTableCell>{String(payment.due_date ?? payment.paid_at ?? payment.created_at ?? "Not set")}</AdminTableCell>
            </>
          ))}
          title="Recent payments"
        />
        <OverviewTable
          columns={["Vehicle", "Dealership", "Status", "Created"]}
          empty="Vehicles will appear after dealers add inventory."
          rows={data.vehicles.slice(0, 5).map((vehicle) => (
            <>
              <AdminTableCell>{vehicleTitle(vehicle)}</AdminTableCell>
              <AdminTableCell>{vehicle.dealerships?.name ?? "Dealership"}</AdminTableCell>
              <AdminTableCell><AdminStatusBadge value={vehicle.status} /></AdminTableCell>
              <AdminTableCell>{formatDate(vehicle.created_at)}</AdminTableCell>
            </>
          ))}
          title="Recent vehicles added"
        />
      </section>
    </div>
  );
}

function Action({ href, title }: { href: Route; title: string }) {
  return (
    <Card className="transition hover:-translate-y-0.5 hover:border-white/20">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link href={href}>Open section</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function OverviewTable({
  columns,
  empty,
  rows,
  title,
}: {
  columns: string[];
  empty: string;
  rows: ReactNode[];
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <AdminDataTable
          columns={columns}
          empty={<AdminEmptyState description={empty} />}
          rows={rows}
        />
      </CardContent>
    </Card>
  );
}

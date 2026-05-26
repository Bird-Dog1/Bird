import Link from "next/link";
import type { Route } from "next";

import { EmptyState } from "@/components/app/empty-state";
import { DashboardHero, InfoTile, MetricCard, QuickAction, SectionHeader } from "@/components/app/dashboard-ui";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { formatCurrency, formatDate, vehicleTitle } from "@/lib/bird-dog/format";
import type { RentalWithRelations } from "@/lib/bird-dog/types";
import { getRentalPaymentTracking } from "@/lib/payments/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "Customer workspace" };

export default async function CustomerDashboardPage() {
  const { user } = await requireRole(["customer"], "/dashboard/customer");
  const supabase = await createServerSupabaseClient();
  const [{ data: applications, error }, { data: rentalRows, error: rentalError }] = await Promise.all([
    supabase.from("rental_applications").select("id, status, created_at").eq("customer_id", user.id).order("created_at", { ascending: false }).limit(3),
    supabase.from("rentals").select("*, vehicles (id, vin, year, make, model, trim, city, state), dealerships (id, name, phone)").eq("customer_id", user.id).eq("active", true).order("created_at", { ascending: false }).limit(1),
  ]);
  const rentals = (rentalRows ?? []) as RentalWithRelations[];
  const tracking = await getRentalPaymentTracking(supabase, rentals.map((rental) => rental.id));
  const activeRental = rentals[0];
  const summary = activeRental ? tracking.summaries.get(activeRental.id) : null;
  const nextPayment = summary?.nextPayment ?? null;

  return (
    <div className="space-y-7">
      <DashboardHero
        eyebrow="Customer workspace"
        title="Your vehicle rental command center."
        description="Browse inventory, apply for vehicles, track dealership decisions, manage active rentals, and follow eligible purchase credit subject to dealership terms."
        actions={<><Button asChild><Link href="/vehicles">Browse vehicles</Link></Button><Button asChild variant="outline"><Link href={"/dashboard/customer/rentals" as Route}>Pay rent</Link></Button></>}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Next step" value={activeRental ? "Manage rental" : applications?.length ? "Track status" : "Browse"} detail={activeRental ? "Review due dates and payments." : "Start with available inventory."} />
          <MetricCard label="Applications" value={applications?.length ?? 0} detail="Recent dealership reviews." />
          <MetricCard label="Active rental" value={activeRental ? "Yes" : "None"} detail={activeRental ? "Payment tools available." : "Approved rentals appear here."} />
          <MetricCard label="Eligible credit" value={formatCurrency(summary?.eligiblePurchaseCredit ?? 0)} detail="Subject to dealership terms." />
        </div>
      </DashboardHero>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QuickAction href="/vehicles" title="Browse vehicles" description="Search available dealership inventory and compare monthly rental terms." cta="Browse" />
        <QuickAction href="/dashboard/customer/applications" title="Track applications" description="See status updates, dealer notes, and application history in one place." cta="View applications" />
        <QuickAction href={"/dashboard/customer/rentals" as Route} title="Pay rent" description="Review active rentals, due dates, payment status, and payment history." cta="Open rentals" />
        <QuickAction href="/vehicles" title="Apply again" description="Find another eligible vehicle when you are ready to submit a new application." cta="Find vehicles" />
      </section>

      {rentalError ? (
        <EmptyState title="Rentals could not load" description={rentalError.message} />
      ) : activeRental ? (
        <Card className="border-white/15 bg-card/80">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Active rental</p>
              <CardTitle className="mt-2">{activeRental.vehicles ? vehicleTitle(activeRental.vehicles) : "Active rental"}</CardTitle>
              <p className="text-sm text-muted-foreground">{activeRental.dealerships?.name ?? "Dealership"} · Started {formatDate(activeRental.start_date)}</p>
            </div>
            <StatusBadge value={nextPayment?.status ?? (tracking.configured ? "unpaid" : "setup required")} />
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <InfoTile label="Monthly rental payment" value={formatCurrency(nextPayment?.amount ?? activeRental.monthly_rate)} />
            <InfoTile label="Next payment due" value={formatDate(nextPayment?.due_date)} />
            <InfoTile label="Payment history" value={`${summary?.paymentHistory.length ?? 0} records`} />
            <InfoTile label="Eligible purchase credit" value={formatCurrency(summary?.eligiblePurchaseCredit ?? 0)} detail="Subject to dealership terms." />
            <div className="md:col-span-4"><Button asChild variant="outline"><Link href={"/dashboard/customer/rentals" as Route}>Payment history and checkout</Link></Button></div>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-4">
        <SectionHeader title="Recent applications" description="Follow approvals, denials, and dealer follow-up from the application inbox." action={<Button asChild variant="outline"><Link href="/dashboard/customer/applications">View all</Link></Button>} />
        {error ? (
          <EmptyState title="Applications could not load" description={error.message} />
        ) : applications && applications.length > 0 ? (
          <div className="grid gap-3">
            {applications.map((application) => (
              <Card className="border-white/10 bg-card/75" key={application.id}>
                <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-medium">Application {application.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">Submitted {formatDate(application.created_at)}</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <StatusBadge value={application.status} />
                    <Button asChild variant="outline"><Link href="/dashboard/customer/applications">View status</Link></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState action={<Button asChild><Link href="/vehicles">Find a vehicle</Link></Button>} description="Browse inventory, open a vehicle detail page, and submit an application when you find a fit." title="No applications yet" />
        )}
      </section>
    </div>
  );
}

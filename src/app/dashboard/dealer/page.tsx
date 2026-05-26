import Link from "next/link";

import { DashboardHero, MetricCard, QuickAction } from "@/components/app/dashboard-ui";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { listAccessibleDealerships } from "@/lib/bird-dog/dealer-data";
import { formatCurrency } from "@/lib/bird-dog/format";
import { getRentalPaymentTracking } from "@/lib/payments/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "Dealer workspace" };
export default async function DealerDashboardPage() {
  const { user, profile } = await requireRole(["dealer"], "/dashboard/dealer"); const supabase = await createServerSupabaseClient();
  const { data: dealerships, error: dealershipError } = await listAccessibleDealerships(supabase, user.id, profile.role); const ids = dealerships.map((d) => d.id);
  const [vehicleCount, applicationCount, rentalCount, activeRentals] = ids.length ? await Promise.all([supabase.from("vehicles").select("id", { count: "exact", head: true }).in("dealership_id", ids), supabase.from("rental_applications").select("id", { count: "exact", head: true }).in("dealership_id", ids), supabase.from("rentals").select("id", { count: "exact", head: true }).in("dealership_id", ids).eq("active", true), supabase.from("rentals").select("id").in("dealership_id", ids).eq("active", true)]) : [{ count: 0 }, { count: 0 }, { count: 0 }, { data: [] }];
  const rentalIds = (activeRentals.data ?? []).map((rental) => rental.id);
  const tracking = await getRentalPaymentTracking(supabase, rentalIds);
  const paymentSummaries = Array.from(tracking.summaries.values());
  const overduePayments = paymentSummaries.reduce((sum, summary) => sum + summary.overdueCount, 0);
  const eligibleCredit = paymentSummaries.reduce((sum, summary) => sum + summary.eligiblePurchaseCredit, 0);

  return (
    <div className="space-y-7">
      <DashboardHero
        eyebrow="Dealer workspace"
        title="Run your rental desk from one view."
        description="Manage inventory, customer applications, approvals, active rentals, payment status, overdue accounts, and eligible purchase credit subject to dealership terms."
        actions={<><Button asChild><Link href="/dashboard/dealer/inventory/new">Add vehicle</Link></Button><Button asChild variant="outline"><Link href="/dashboard/dealer/applications">Review applications</Link></Button></>}
      />
      {dealershipError ? (
        <EmptyState title="Dealerships could not load" description={dealershipError.message} />
      ) : dealerships.length === 0 ? (
        <EmptyState action={<Button asChild><Link href="/dashboard/dealer/settings">Create dealership profile</Link></Button>} description="Create your dealership profile, then an admin can approve it for the public marketplace." title="No dealership assigned" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Vehicles" value={vehicleCount.count ?? 0} detail="Inventory records." />
            <MetricCard label="Applications" value={applicationCount.count ?? 0} detail="Customer requests." />
            <MetricCard label="Active rentals" value={rentalCount.count ?? 0} detail="Current customers." />
            <MetricCard label="Overdue payments" value={tracking.configured ? overduePayments : "Setup required"} detail="Needs follow-up." />
            <MetricCard label="Eligible credit" value={tracking.configured ? formatCurrency(eligibleCredit) : "Setup required"} detail="Subject to terms." />
          </div>
          {!tracking.configured ? <Card className="border-primary/20 bg-primary/5"><CardContent className="p-5 text-sm leading-6 text-muted-foreground">{tracking.setupMessage}</CardContent></Card> : null}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <QuickAction href="/dashboard/dealer/inventory" title="Inventory management" description="Add vehicles, update pricing, manage availability, and keep listings marketplace-ready." cta="Manage inventory" />
            <QuickAction href="/dashboard/dealer/applications" title="Applications and approvals" description="Review customer details, selected vehicle, optional documents, and decision status." cta="Review queue" />
            <QuickAction href="/dashboard/dealer/rentals" title="Rentals and payments" description="Monitor active rentals, payment status, overdue accounts, and credit tracking." cta="Open rentals" />
            <QuickAction href="/dashboard/dealer/settings" title="Dealership profile" description="Keep dealership contact details current for marketplace listings and customer follow-up." cta="Edit settings" />
          </div>
        </>
      )}
    </div>
  );
}

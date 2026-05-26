import { EmptyState } from "@/components/app/empty-state";
import { DashboardHero, InfoTile, MetricCard } from "@/components/app/dashboard-ui";
import { MessageBanner } from "@/components/app/message-banner";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { listAccessibleDealerships } from "@/lib/bird-dog/dealer-data";
import { formatCurrency, formatDate, vehicleTitle } from "@/lib/bird-dog/format";
import type { RentalWithRelations } from "@/lib/bird-dog/types";
import { getRentalPaymentTracking } from "@/lib/payments/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "Active rentals" };
export default async function DealerRentalsPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  const { user } = await requireRole(["dealer"], "/dashboard/dealer/rentals");
  const supabase = await createServerSupabaseClient();
  const { data: dealerships, error: dealershipError } = await listAccessibleDealerships(supabase, user.id);
  const ids = dealerships.map((d) => d.id);
  if (dealershipError) return <EmptyState title="Rentals could not load" description={dealershipError.message} />;
  if (!ids.length) return <EmptyState title="No dealership assigned" description="Active rentals appear after dealership setup." />;
  const { data, error } = await supabase.from("rentals").select("*, vehicles (id, vin, year, make, model, trim, city, state), dealerships (id, name, phone), profiles (id, email, full_name, phone)").in("dealership_id", ids).eq("active", true).order("created_at", { ascending: false });
  const rentals = (data ?? []) as RentalWithRelations[];
  const tracking = await getRentalPaymentTracking(supabase, rentals.map((rental) => rental.id));
  const summaries = Array.from(tracking.summaries.values());
  const overdueCount = summaries.reduce((sum, summary) => sum + summary.overdueCount, 0);
  const eligibleCredit = summaries.reduce((sum, summary) => sum + summary.eligiblePurchaseCredit, 0);

  return (
    <div className="space-y-7">
      <DashboardHero
        eyebrow="Dealer fleet"
        title="Active rentals and payment watchlist."
        description="Review customer rentals, payment status, overdue accounts, and eligible purchase credit subject to dealership terms."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Active rentals" value={rentals.length} detail="Current rental accounts." />
          <MetricCard label="Overdue payments" value={tracking.configured ? overdueCount : "Setup required"} detail="Requires payment records." />
          <MetricCard label="Eligible credit tracked" value={tracking.configured ? formatCurrency(eligibleCredit) : "Setup required"} detail="Subject to terms." />
        </div>
      </DashboardHero>
      <MessageBanner error={params.error ?? (!tracking.configured ? tracking.setupMessage : undefined)} message={params.message} />
      {error ? (
        <EmptyState title="Rentals could not load" description={error.message} />
      ) : rentals.length === 0 ? (
        <EmptyState description="Approved applications can be converted into active rentals from the application detail page." title="No active rentals" />
      ) : (
        <div className="grid gap-4">
          {rentals.map((rental) => {
            const summary = tracking.summaries.get(rental.id);
            const nextPayment = summary?.nextPayment ?? null;
            const paymentStatus = nextPayment?.status ?? (tracking.configured ? "unpaid" : "setup required");
            return (
              <Card className="border-white/10 bg-card/80 transition hover:border-white/20" key={rental.id}>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>{rental.vehicles ? vehicleTitle(rental.vehicles) : "Vehicle unavailable"}</CardTitle>
                    <p className="text-sm text-muted-foreground">{rental.profiles?.full_name ?? rental.profiles?.email ?? "Customer"} · Starts {formatDate(rental.start_date)}</p>
                  </div>
                  <StatusBadge value={paymentStatus} />
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-4">
                    <InfoTile label="Monthly rental payment" value={formatCurrency(nextPayment?.amount ?? rental.monthly_rate)} />
                    <InfoTile label="Next due date" value={formatDate(nextPayment?.due_date)} />
                    <InfoTile label="Overdue payments" value={`${summary?.overdueCount ?? 0}`} />
                    <InfoTile label="Eligible purchase credit" value={formatCurrency(summary?.eligiblePurchaseCredit ?? 0)} detail="Subject to dealership terms." />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <InfoTile label="Deposit" value={formatCurrency(rental.deposit)} />
                    <InfoTile label="End date" value={formatDate(rental.end_date)} />
                    <InfoTile label="Payment records" value={`${summary?.paymentHistory.length ?? 0}`} />
                  </div>
                  <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-muted-foreground">Payments should be routed to the participating dealership or dealership-connected account. Eligible purchase credit is for a dealer-managed purchase option and is subject to dealership terms.</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

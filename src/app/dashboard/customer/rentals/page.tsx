import Link from "next/link";

import { startRentalCheckout } from "@/app/dashboard/customer/rentals/actions";
import { DashboardHero, InfoTile, MetricCard } from "@/components/app/dashboard-ui";
import { EmptyState } from "@/components/app/empty-state";
import { MessageBanner } from "@/components/app/message-banner";
import { StatusBadge } from "@/components/app/status-badge";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { formatCurrency, formatDate, vehicleTitle } from "@/lib/bird-dog/format";
import type { RentalWithRelations } from "@/lib/bird-dog/types";
import { getPaymentSetupStatus } from "@/lib/payments/config";
import { getRentalPaymentTracking } from "@/lib/payments/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "My rentals" };

export default async function CustomerRentalsPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  const { user } = await requireRole(["customer", "admin"], "/dashboard/customer/rentals");
  const supabase = await createServerSupabaseClient();
  const checkoutSetup = getPaymentSetupStatus();
  const { data, error } = await supabase
    .from("rentals")
    .select("*, vehicles (id, vin, year, make, model, trim, city, state), dealerships (id, name, phone)")
    .eq("customer_id", user.id)
    .eq("active", true)
    .order("created_at", { ascending: false });
  const rentals = (data ?? []) as RentalWithRelations[];
  const tracking = await getRentalPaymentTracking(supabase, rentals.map((rental) => rental.id));
  const summaries = Array.from(tracking.summaries.values());
  const totalEligibleCredit = summaries.reduce((sum, summary) => sum + summary.eligiblePurchaseCredit, 0);
  const overdueCount = summaries.reduce((sum, summary) => sum + summary.overdueCount, 0);

  return (
    <div className="space-y-7">
      <DashboardHero
        eyebrow="Customer rentals"
        title="Rent, pay, and track with confidence."
        description="See active rentals, next due dates, payment history, and eligible purchase credit for a dealer-managed purchase option subject to dealership terms."
        actions={<Button asChild variant="outline"><Link href="/vehicles">Browse more vehicles</Link></Button>}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Active rentals" value={rentals.length} detail="Converted from approved applications." />
          <MetricCard label="Overdue payments" value={tracking.configured ? overdueCount : "Setup required"} detail="Based on payment records." />
          <MetricCard label="Eligible purchase credit" value={tracking.configured ? formatCurrency(totalEligibleCredit) : "Setup required"} detail="Subject to dealership terms." />
        </div>
      </DashboardHero>
      <MessageBanner error={params.error ?? (!tracking.configured ? tracking.setupMessage : undefined)} message={params.message} />
      {!checkoutSetup.checkoutEnabled ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="space-y-2 p-5 text-sm leading-6 text-muted-foreground">
            <p className="font-semibold text-foreground">Rental checkout is not enabled yet.</p>
            <p>{checkoutSetup.message}</p>
          </CardContent>
        </Card>
      ) : null}
      {error ? (
        <EmptyState title="Rentals could not load" description={error.message} />
      ) : rentals.length === 0 ? (
        <EmptyState action={<Button asChild><Link href="/vehicles">Browse more vehicles</Link></Button>} description="Approved applications converted by a dealer will appear here as active rentals." title="No active rentals" />
      ) : (
        <div className="grid gap-5">
          {rentals.map((rental) => {
            const summary = tracking.summaries.get(rental.id);
            const nextPayment = summary?.nextPayment ?? null;
            const paymentStatus = nextPayment?.status ?? (tracking.configured ? "unpaid" : "setup required");
            return (
              <Card className="border-white/15" key={rental.id}>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>{rental.vehicles ? vehicleTitle(rental.vehicles) : "Vehicle unavailable"}</CardTitle>
                    <p className="text-sm text-muted-foreground">{rental.dealerships?.name ?? "Dealership"} · Started {formatDate(rental.start_date)}</p>
                  </div>
                  <StatusBadge value={paymentStatus} />
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-4">
                    <InfoTile label="Monthly rental payment" value={formatCurrency(nextPayment?.amount ?? rental.monthly_rate)} />
                    <InfoTile label="Next payment due" value={formatDate(nextPayment?.due_date)} />
                    <InfoTile label="Last payment date" value={formatDate(latestPaidDate(summary?.paymentHistory ?? []))} />
                    <InfoTile label="Eligible purchase credit" value={formatCurrency(summary?.eligiblePurchaseCredit ?? 0)} detail="Subject to dealership terms." />
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-muted-foreground">
                    Eligible purchase credit is tracked only when dealership terms allow it and may apply to a dealer-managed purchase option. Bird Dog does not promise ownership or hold rental funds.
                  </div>
                  <div className="space-y-3">
                    <p className="font-medium">Payment history</p>
                    {summary?.paymentHistory.length ? (
                      <div className="grid gap-3">
                        {summary.paymentHistory.map((payment) => (
                          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm md:grid-cols-5" key={payment.id}>
                            <span>{formatCurrency(payment.amount)}</span>
                            <span>Due {formatDate(payment.due_date)}</span>
                            <span><StatusBadge value={payment.status} /></span>
                            <span>Paid {formatDate(payment.payment_date)}</span>
                            <span className="truncate" title={payment.stripe_payment_intent_id ?? payment.stripe_checkout_session_id ?? ""}>{payment.stripe_payment_intent_id ?? payment.stripe_checkout_session_id ?? "No Stripe ID"}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-muted-foreground">No payment records are available yet.</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <form action={startRentalCheckout}>
                      <input name="rental_id" type="hidden" value={rental.id} />
                      <SubmitButton disabled={!checkoutSetup.checkoutEnabled} pendingLabel="Starting checkout...">Start rental checkout</SubmitButton>
                    </form>
                    <Button asChild variant="outline"><Link href="/vehicles">Browse more vehicles</Link></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function latestPaidDate(payments: Array<{ payment_date: string | null; status: string }>) {
  return payments
    .filter((payment) => payment.status === "paid" && payment.payment_date)
    .map((payment) => payment.payment_date)
    .sort()
    .at(-1) ?? null;
}

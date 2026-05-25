import Link from "next/link";
import type { Route } from "next";

import { EmptyState } from "@/components/app/empty-state";
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
  const { user } = await requireRole(["customer", "admin"]);
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

  return <div className="space-y-6"><section className="rounded-[2rem] border border-white/10 bg-card/85 p-7 shadow-2xl shadow-black/25 backdrop-blur-xl"><p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">Customer workspace</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Customer dashboard</h1><p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Browse vehicles, submit applications, and track dealership decisions, rentals, and eligible purchase credit subject to dealership terms.</p><div className="mt-5 flex flex-col gap-3 sm:flex-row"><Button asChild><Link href="/vehicles">Browse available vehicles</Link></Button><Button asChild variant="outline"><Link href={"/dashboard/customer/rentals" as Route}>View rentals and payments</Link></Button></div></section>{rentalError ? <EmptyState title="Rentals could not load" description={rentalError.message} /> : activeRental ? <Card className="border-white/15"><CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><CardTitle>{activeRental.vehicles ? vehicleTitle(activeRental.vehicles) : "Active rental"}</CardTitle><p className="text-sm text-muted-foreground">{activeRental.dealerships?.name ?? "Dealership"} · Started {formatDate(activeRental.start_date)}</p></div><StatusBadge value={nextPayment?.status ?? (tracking.configured ? "unpaid" : "setup required")} /></CardHeader><CardContent className="grid gap-4 md:grid-cols-4"><Info label="Monthly rental payment" value={formatCurrency(nextPayment?.amount ?? activeRental.monthly_rate)} /><Info label="Next payment due" value={formatDate(nextPayment?.due_date)} /><Info label="Payment history" value={`${summary?.paymentHistory.length ?? 0} records`} /><Info label="Eligible purchase credit" value={`${formatCurrency(summary?.eligiblePurchaseCredit ?? 0)} subject to dealership terms`} /><div className="md:col-span-4"><Button asChild variant="outline"><Link href={"/dashboard/customer/rentals" as Route}>Payment history and checkout</Link></Button></div></CardContent></Card> : null}{error ? <EmptyState title="Applications could not load" description={error.message} /> : applications && applications.length > 0 ? <Card><CardHeader><CardTitle>Recent applications</CardTitle></CardHeader><CardContent className="space-y-3">{applications.map((application) => <div className="flex flex-col justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row" key={application.id}><div><p className="font-medium">Application {application.id.slice(0, 8)}</p><p className="text-sm capitalize text-muted-foreground">{application.status.replaceAll("_", " ")}</p></div><Button asChild variant="outline"><Link href="/dashboard/customer/applications">View status</Link></Button></div>)}</CardContent></Card> : <EmptyState action={<Button asChild><Link href="/vehicles">Find a vehicle</Link></Button>} description="Applications submitted through vehicle pages will appear here." title="No applications yet" />}</div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }

import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { formatCurrency, formatDate, vehicleTitle } from "@/lib/bird-dog/format";
import type { ApplicationWithRelations } from "@/lib/bird-dog/types";
import { APPLICATION_SELECT } from "@/lib/supabase/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "My applications" };
export default async function CustomerApplicationsPage() {
  const { user } = await requireRole(["customer", "admin"]); const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("rental_applications").select(APPLICATION_SELECT).eq("customer_id", user.id).order("created_at", { ascending: false });
  const applications = (data ?? []) as ApplicationWithRelations[];
  return <div className="space-y-6"><div><p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">Customer records</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">My applications</h1><p className="mt-2 text-muted-foreground">Track dealership review status for every application.</p></div>{error ? <EmptyState title="Applications could not load" description={error.message} /> : applications.length === 0 ? <EmptyState action={<Button asChild><Link href="/vehicles">Browse vehicles</Link></Button>} description="Submit an application from an available vehicle detail page." title="No applications yet" /> : <div className="grid gap-4">{applications.map((application) => <Card className="transition hover:border-white/20" key={application.id}><CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><CardTitle>{application.vehicles ? vehicleTitle(application.vehicles) : "Vehicle unavailable"}</CardTitle><p className="text-sm text-muted-foreground">{application.dealerships?.name ?? "Dealership"} · Submitted {formatDate(application.created_at)}</p></div><StatusBadge value={application.status} /></CardHeader><CardContent className="grid gap-4 md:grid-cols-3"><Info label="Monthly" value={formatCurrency(application.vehicles?.monthly_price)} /><Info label="Deposit" value={formatCurrency(application.vehicles?.deposit)} /><Info label="Documents" value={`${application.application_documents.length} uploaded`} />{application.dealer_notes ? <div className="md:col-span-3"><p className="text-xs text-muted-foreground">Dealer notes</p><p className="mt-1 text-sm">{application.dealer_notes}</p></div> : null}</CardContent></Card>)}</div>}</div>;
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }

import Link from "next/link";
import type { Route } from "next";

import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { listAccessibleDealerships } from "@/lib/bird-dog/dealer-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "Dealer workspace" };
export default async function DealerDashboardPage() {
  const { user, profile } = await requireRole(["dealer", "admin"]); const supabase = await createServerSupabaseClient();
  const { data: dealerships, error: dealershipError } = await listAccessibleDealerships(supabase, user.id, profile.role); const ids = dealerships.map((d) => d.id);
  const counts = ids.length ? await Promise.all([supabase.from("vehicles").select("id", { count: "exact", head: true }).in("dealership_id", ids), supabase.from("rental_applications").select("id", { count: "exact", head: true }).in("dealership_id", ids), supabase.from("rentals").select("id", { count: "exact", head: true }).in("dealership_id", ids).eq("active", true)]) : [{ count: 0 }, { count: 0 }, { count: 0 }];
  return <div className="space-y-6"><section className="rounded-[2rem] border border-white/10 bg-card/85 p-7 shadow-2xl shadow-black/25 backdrop-blur-xl"><p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">Dealer workspace</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Dealer dashboard</h1><p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Manage monthly rental inventory, applications, and active rentals.</p></section>{dealershipError ? <EmptyState title="Dealerships could not load" description={dealershipError.message} /> : dealerships.length === 0 ? <EmptyState action={<Button asChild><Link href="/dashboard/dealer/settings">Create dealership profile</Link></Button>} description="Create your dealership profile, then an admin can approve it for the public marketplace." title="No dealership assigned" /> : <><div className="grid gap-4 md:grid-cols-3"><Metric label="Vehicles" value={counts[0].count ?? 0} /><Metric label="Applications" value={counts[1].count ?? 0} /><Metric label="Active rentals" value={counts[2].count ?? 0} /></div><div className="grid gap-4 sm:grid-cols-2"><ActionCard href="/dashboard/dealer/inventory/new" title="Add vehicle" /><ActionCard href="/dashboard/dealer/applications" title="Review applications" /></div></>}</div>;
}
function Metric({ label, value }: { label: string; value: number }) { return <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-4xl font-semibold tracking-[-0.05em]">{value}</p></CardContent></Card>; }
function ActionCard({ href, title }: { href: Route; title: string }) { return <Card className="transition hover:-translate-y-0.5 hover:border-white/20"><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><Button asChild><Link href={href}>{title}</Link></Button></CardContent></Card>; }

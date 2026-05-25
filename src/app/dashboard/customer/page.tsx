import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "Customer workspace" };

export default async function CustomerDashboardPage() {
  const { user } = await requireRole(["customer", "admin"]);
  const supabase = await createServerSupabaseClient();
  const { data: applications, error } = await supabase.from("rental_applications").select("id, status, created_at").eq("customer_id", user.id).order("created_at", { ascending: false }).limit(3);
  return <div className="space-y-6"><section className="rounded-[2rem] border border-white/10 bg-card/85 p-7 shadow-2xl shadow-black/25 backdrop-blur-xl"><p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">Customer workspace</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Customer dashboard</h1><p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Browse vehicles, submit applications, and track dealership decisions.</p><Button asChild className="mt-5"><Link href="/vehicles">Browse available vehicles</Link></Button></section>{error ? <EmptyState title="Applications could not load" description={error.message} /> : applications && applications.length > 0 ? <Card><CardHeader><CardTitle>Recent applications</CardTitle></CardHeader><CardContent className="space-y-3">{applications.map((application) => <div className="flex flex-col justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row" key={application.id}><div><p className="font-medium">Application {application.id.slice(0, 8)}</p><p className="text-sm capitalize text-muted-foreground">{application.status.replaceAll("_", " ")}</p></div><Button asChild variant="outline"><Link href="/dashboard/customer/applications">View status</Link></Button></div>)}</CardContent></Card> : <EmptyState action={<Button asChild><Link href="/vehicles">Find a vehicle</Link></Button>} description="Applications submitted through vehicle pages will appear here." title="No applications yet" />}</div>;
}

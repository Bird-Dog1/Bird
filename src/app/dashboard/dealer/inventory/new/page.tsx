import Link from "next/link";
import { createVehicle } from "@/app/dashboard/dealer/actions";
import { MessageBanner } from "@/components/app/message-banner";
import { VehicleForm } from "@/components/dealer/vehicle-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { listAccessibleDealerships } from "@/lib/bird-dog/dealer-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "Add vehicle" };
export default async function NewVehiclePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) { const params = await searchParams; const { user, profile } = await requireRole(["dealer"], "/dashboard/dealer/inventory/new"); const supabase = await createServerSupabaseClient(); const { data: dealerships } = await listAccessibleDealerships(supabase, user.id, profile.role); return <div className="space-y-6"><div><p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">Inventory studio</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Add vehicle</h1><p className="mt-2 text-muted-foreground">Create a real Supabase vehicle listing and upload photos.</p></div><MessageBanner error={params.error} />{dealerships.length === 0 ? <Card><CardContent className="space-y-4 p-6"><p className="text-muted-foreground">Create a dealership profile before adding inventory.</p><Button asChild><Link href="/dashboard/dealer/settings">Create dealership profile</Link></Button></CardContent></Card> : <Card className="border-white/15"><CardHeader><CardTitle>Vehicle details</CardTitle></CardHeader><CardContent><VehicleForm action={createVehicle} dealerships={dealerships} /></CardContent></Card>}</div>; }

import Link from "next/link";
import type { Route } from "next";
import { EmptyState } from "@/components/app/empty-state";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { formatCurrency, vehicleTitle } from "@/lib/bird-dog/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "All vehicles" };
export default async function AdminVehiclesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) { const params = await searchParams; await requireRole(["admin"]); const supabase = await createServerSupabaseClient(); let query = supabase.from("vehicles").select("*, dealerships (id, name)").order("created_at", { ascending: false }); if (params.q) query = query.or(`vin.ilike.%${params.q}%,make.ilike.%${params.q}%,model.ilike.%${params.q}%`); const { data: vehicles, error } = await query; return <div className="space-y-6"><div><h1 className="text-3xl font-bold">All vehicles</h1><p className="mt-2 text-muted-foreground">Search every vehicle across all dealerships.</p></div><Search value={params.q} />{error ? <EmptyState title="Vehicles could not load" description={error.message} /> : vehicles && vehicles.length > 0 ? <div className="grid gap-4">{vehicles.map((vehicle) => <Card key={vehicle.id}><CardContent className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{vehicleTitle(vehicle)}</p><StatusBadge value={vehicle.status} /></div><p className="text-sm text-muted-foreground">{vehicle.dealerships?.name ?? "Dealership"} · VIN {vehicle.vin}</p></div><div className="flex items-center gap-3"><p className="font-semibold text-primary">{formatCurrency(vehicle.monthly_price)}/mo</p><Button asChild variant="outline"><Link href={`/dashboard/dealer/inventory/${vehicle.id}/edit` as Route}>Edit</Link></Button></div></CardContent></Card>)}</div> : <EmptyState title="No vehicles found" description="Vehicles will appear after dealers add inventory." />}</div>; }
function Search({ value }: { value?: string }) { return <form className="flex gap-2"><input className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3 py-2 text-sm" defaultValue={value ?? ""} name="q" placeholder="Search VIN, make, or model" /><Button type="submit">Search</Button></form>; }

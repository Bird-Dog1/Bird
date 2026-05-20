import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin console",
};

export default async function AdminDashboardPage() {
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const [customers, dealers, inventory, applications, dealerships] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "dealer"),
    supabase.from("vehicles").select("id", { count: "exact", head: true }),
    supabase.from("rental_applications").select("id", { count: "exact", head: true }),
    supabase
      .from("dealerships")
      .select("id,name,city,state,approved,suspended")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);
  const metrics = [
    { label: "Customers", value: customers.count ?? 0 },
    { label: "Dealers", value: dealers.count ?? 0 },
    { label: "Inventory", value: inventory.count ?? 0 },
    { label: "Applications", value: applications.count ?? 0 },
  ];

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin console</CardTitle>
          <CardDescription>
            Review launch health across customers, dealers, applications, and inventory.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <div
              className="rounded-2xl border border-border bg-background/40 p-4"
              key={metric.label}
            >
              <p className="text-sm font-semibold text-muted-foreground">{metric.label}</p>
              <p className="mt-2 text-3xl font-bold">{metric.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent dealerships</CardTitle>
          <CardDescription>Approval and suspension status for dealer operations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {(dealerships.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Dealership records created from Supabase or admin tooling will appear here.
            </p>
          ) : (
            dealerships.data?.map((dealership) => (
              <div
                className="flex flex-col gap-2 rounded-2xl border border-border bg-background/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                key={dealership.id}
              >
                <div>
                  <p className="font-semibold">{dealership.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {dealership.city}, {dealership.state}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  {dealership.suspended
                    ? "suspended"
                    : dealership.approved
                      ? "approved"
                      : "pending"}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

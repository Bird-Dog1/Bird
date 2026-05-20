import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusMessage } from "@/components/ui/status-message";
import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin console",
};

export default async function AdminDashboardPage() {
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const metrics = await Promise.all([
    countRows(supabase, "profiles"),
    countRows(supabase, "dealerships"),
    countRows(supabase, "vehicles"),
    countRows(supabase, "rental_applications"),
  ]);
  const hasMetricError = metrics.some((metric) => metric.error);

  return (
    <div className="grid gap-6">
      {hasMetricError ? (
        <StatusMessage tone="error">
          Admin metrics could not be loaded. Refresh the page or check Supabase access.
        </StatusMessage>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Admin console</CardTitle>
          <CardDescription>
            Operational shell for reviewing customers, dealers, applications,
            vehicles, and platform controls.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Profiles", value: metrics[0].count },
            { label: "Dealerships", value: metrics[1].count },
            { label: "Inventory", value: metrics[2].count },
            { label: "Applications", value: metrics[3].count },
          ].map((metric) => (
            <div
              className="rounded-2xl border border-border bg-background/40 p-4"
              key={metric.label}
            >
              <p className="text-sm font-semibold">{metric.label}</p>
              <p className="mt-2 text-3xl font-bold">{metric.value ?? "-"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Visible through admin RLS policies.
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

async function countRows(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  table: "profiles" | "dealerships" | "vehicles" | "rental_applications",
) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  return { count, error };
}

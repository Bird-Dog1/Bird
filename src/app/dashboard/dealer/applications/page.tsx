import Link from "next/link";
import type { Route } from "next";
import { DashboardHero, InfoTile } from "@/components/app/dashboard-ui";
import { EmptyState } from "@/components/app/empty-state";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { listAccessibleDealerships } from "@/lib/bird-dog/dealer-data";
import { formatCurrency, formatDate, vehicleTitle } from "@/lib/bird-dog/format";
import type { ApplicationWithRelations } from "@/lib/bird-dog/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "Applications" };
export default async function DealerApplicationsPage() {
  const { user } = await requireRole(["dealer"], "/dashboard/dealer/applications");
  const supabase = await createServerSupabaseClient();
  const { data: dealerships, error: dealershipError } = await listAccessibleDealerships(supabase, user.id);
  const ids = dealerships.map((d) => d.id);

  if (dealershipError) return <EmptyState title="Applications could not load" description={dealershipError.message} />;
  if (!ids.length) return <EmptyState action={<Button asChild><Link href="/dashboard/dealer/settings">Create dealership profile</Link></Button>} description="Applications appear after customers apply to your dealership vehicles." title="No dealership assigned" />;

  const { data, error } = await supabase.from("rental_applications").select("*, vehicles (id, vin, year, make, model, trim, monthly_price, deposit, city, state), dealerships (id, name, phone), profiles (id, email, full_name, phone), application_documents (id, application_id, document_type, file_url, created_at)").in("dealership_id", ids).order("created_at", { ascending: false });
  const apps = (data ?? []) as ApplicationWithRelations[];

  return (
    <div className="space-y-7">
      <DashboardHero
        eyebrow="Dealer review"
        title="Applications inbox built for decisions."
        description="Review customer details, selected vehicles, optional documents, preferred start dates, and approval status for your dealership only."
        actions={<Button asChild variant="outline"><Link href="/dashboard/dealer/inventory">Manage inventory</Link></Button>}
      >
        <div className="grid gap-3 sm:grid-cols-4">
          <InfoTile label="Total" value={apps.length} />
          <InfoTile label="Pending" value={apps.filter((app) => app.status === "submitted").length} />
          <InfoTile label="Under review" value={apps.filter((app) => app.status === "under_review").length} />
          <InfoTile label="Approved" value={apps.filter((app) => app.status === "approved").length} />
        </div>
      </DashboardHero>
      {error ? (
        <EmptyState title="Applications could not load" description={error.message} />
      ) : apps.length === 0 ? (
        <EmptyState action={<Button asChild><Link href="/dashboard/dealer/inventory">Review inventory</Link></Button>} description="Customer applications will appear here after public marketplace submissions. Keep available vehicles published so customers can apply." title="No applications yet" />
      ) : (
        <div className="grid gap-4">
          {apps.map((application) => {
            const customerName = application.profiles?.full_name ?? getApplicationField(application.customer_notes, "Full name") ?? application.profiles?.email ?? "Customer";
            const preferredStartDate = getApplicationField(application.customer_notes, "Preferred start date");
            return (
              <Card className="transition hover:border-white/20" key={application.id}>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>{application.vehicles ? vehicleTitle(application.vehicles) : "Vehicle unavailable"}</CardTitle>
                    <p className="text-sm text-muted-foreground">{customerName} · {formatDate(application.created_at)}</p>
                  </div>
                  <StatusBadge value={application.status} />
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <InfoTile label="Monthly" value={`${formatCurrency(application.vehicles?.monthly_price)}/mo`} />
                    <InfoTile label="Documents" value={`${application.application_documents.length} optional`} />
                    <InfoTile label="Preferred start" value={preferredStartDate ?? "Not provided"} />
                  </div>
                  <Button asChild variant="outline"><Link href={`/dashboard/dealer/applications/${application.id}` as Route}>Review</Link></Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getApplicationField(notes: string | null, label: string) {
  return notes
    ?.split("\n")
    .find((line) => line.startsWith(`${label}: `))
    ?.slice(label.length + 2)
    .trim() || null;
}

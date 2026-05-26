import Link from "next/link";

import { DashboardHero, InfoTile } from "@/components/app/dashboard-ui";
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
  const { user } = await requireRole(["customer", "admin"], "/dashboard/customer/applications"); const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("rental_applications").select(APPLICATION_SELECT).eq("customer_id", user.id).order("created_at", { ascending: false });
  const applications = (data ?? []) as ApplicationWithRelations[];
  const pendingCount = applications.filter((application) => application.status === "submitted" || application.status === "under_review").length;

  return (
    <div className="space-y-7">
      <DashboardHero
        eyebrow="Customer records"
        title="Applications without the guesswork."
        description="Track every vehicle application, dealership review status, dealer notes, and next steps from one mobile-friendly inbox."
        actions={<Button asChild><Link href="/vehicles">Browse vehicles</Link></Button>}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <InfoTile label="Total applications" value={applications.length} />
          <InfoTile label="Pending review" value={pendingCount} />
          <InfoTile label="Approved" value={applications.filter((application) => application.status === "approved").length} />
        </div>
      </DashboardHero>

      {error ? (
        <EmptyState title="Applications could not load" description={error.message} />
      ) : applications.length === 0 ? (
        <EmptyState action={<Button asChild><Link href="/vehicles">Browse vehicles</Link></Button>} description="Choose a vehicle, click Apply, and submit your details. Dealer decisions and notes will appear here." title="No applications yet" />
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => (
            <Card className="border-white/10 bg-card/80 transition hover:border-white/20" key={application.id}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>{application.vehicles ? vehicleTitle(application.vehicles) : "Vehicle unavailable"}</CardTitle>
                  <p className="text-sm text-muted-foreground">{application.dealerships?.name ?? "Dealership"} · Submitted {formatDate(application.created_at)}</p>
                </div>
                <StatusBadge value={application.status} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <InfoTile label="Monthly" value={formatCurrency(application.vehicles?.monthly_price)} />
                  <InfoTile label="Deposit" value={formatCurrency(application.vehicles?.deposit)} />
                  <InfoTile label="Optional documents" value={`${application.application_documents.length} uploaded`} />
                </div>
                {application.dealer_notes ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs text-muted-foreground">Dealer notes</p>
                    <p className="mt-1 text-sm leading-6">{application.dealer_notes}</p>
                  </div>
                ) : (
                  <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-muted-foreground">No dealer notes yet. The dealership can update this application as they review it.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

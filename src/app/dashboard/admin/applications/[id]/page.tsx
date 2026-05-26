import Link from "next/link";

import {
  AdminDataTable,
  AdminEmptyState,
  AdminMetricCard,
  AdminPageHeader,
  AdminStatusBadge,
  AdminTableCell,
} from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { fetchAdminDashboardData } from "@/lib/admin/data";
import { formatCurrency, formatDate, vehicleTitle } from "@/lib/bird-dog/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSignedStorageUrl } from "@/lib/supabase/storage";

export const metadata = { title: "Application detail" };

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const data = await fetchAdminDashboardData(supabase);
  const application = data.applications.find((item) => item.id === id);

  if (!application) {
    return <AdminEmptyState description="No records found yet." title="Application not found" />;
  }

  const docs = await Promise.all(
    application.application_documents.map(async (doc) => ({
      ...doc,
      signed_url: await createSignedStorageUrl(supabase, "application-documents", doc.file_url),
    })),
  );

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description="Read-only application detail with customer, vehicle, dealership, approval state, and document access."
        eyebrow="Application detail"
        title={application.vehicles ? vehicleTitle(application.vehicles) : "Vehicle unavailable"}
      >
        <AdminStatusBadge value={application.status} />
      </AdminPageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Monthly price" value={formatCurrency(application.vehicles?.monthly_price)} />
        <AdminMetricCard label="Deposit" value={formatCurrency(application.vehicles?.deposit)} />
        <AdminMetricCard label="Documents" value={docs.length} />
        <AdminMetricCard label="Approval" value={application.status.replaceAll("_", " ")} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Applicant</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Info label="Name" value={application.profiles?.full_name} />
            <Info label="Email" value={application.profiles?.email} />
            <Info label="Phone" value={application.profiles?.phone} />
            <Info label="Submitted" value={formatDate(application.created_at)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle and dealership</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Info label="Vehicle" value={application.vehicles ? vehicleTitle(application.vehicles) : null} />
            <Info label="VIN" value={application.vehicles?.vin} />
            <Info label="Dealership" value={application.dealerships?.name} />
            <Info label="Dealership phone" value={application.dealerships?.phone} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminDataTable
            columns={["Type", "Uploaded", "File"]}
            empty={<AdminEmptyState description="No records found yet." />}
            rows={docs.map((doc) => (
              <>
                <AdminTableCell className="capitalize">{doc.document_type}</AdminTableCell>
                <AdminTableCell>{formatDate(doc.created_at)}</AdminTableCell>
                <AdminTableCell>
                  {doc.signed_url ? (
                    <Button asChild size="sm" variant="outline">
                      <a href={doc.signed_url} rel="noreferrer" target="_blank">Open</a>
                    </Button>
                  ) : (
                    "Unavailable"
                  )}
                </AdminTableCell>
              </>
            ))}
          />
        </CardContent>
      </Card>

      <Button asChild variant="outline">
        <Link href="/dashboard/admin/applications">Back to applications</Link>
      </Button>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value || "Not provided"}</p>
    </div>
  );
}

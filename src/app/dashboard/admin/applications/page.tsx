import Link from "next/link";
import { type Route } from "next";

import {
  AdminAlert,
  AdminPageHeader,
  AdminSearch,
  AdminTable,
  StatusBadge,
  TableCell,
  TableHead,
  TableHeaderCell,
} from "@/app/dashboard/admin/_components";
import {
  formatDate,
  getQueryIssue,
  matchesSearch,
  normalizeSearch,
  statusTone,
} from "@/app/dashboard/admin/_utils";
import { requireRole } from "@/lib/auth/guards";
import { type Tables } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = {
  title: "All applications",
};

type ApplicationsPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

type ApplicationRow = Tables<"rental_applications"> & {
  customer: Pick<Tables<"profiles">, "email" | "full_name" | "id"> | null;
  dealerships: Pick<Tables<"dealerships">, "id" | "name"> | null;
  vehicles: Pick<Tables<"vehicles">, "id" | "year" | "make" | "model" | "vin"> | null;
  application_documents: Array<{ id: string; document_type: string }> | null;
};

export default async function AllApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const search = normalizeSearch(params.q);
  const supabase = await createServerSupabaseClient();

  const applications = await supabase
    .from("rental_applications")
    .select(
      `
        *,
        customer:profiles!rental_applications_customer_id_fkey (
          id,
          email,
          full_name
        ),
        dealerships ( id, name ),
        vehicles ( id, year, make, model, vin ),
        application_documents ( id, document_type )
      `,
    )
    .order("created_at", { ascending: false });

  const issue = getQueryIssue([applications]);
  const rows = ((applications.data ?? []) as ApplicationRow[]).filter((application) =>
    matchesSearch(search, [
      application.id,
      application.status,
      application.customer?.email,
      application.customer?.full_name,
      application.dealerships?.name,
      application.vehicles?.vin,
      application.vehicles?.make,
      application.vehicles?.model,
    ]),
  );

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        description="Review every submitted, approved, denied, and cancelled rental application."
        title="All applications"
      />
      <AdminSearch
        defaultValue={params.q}
        placeholder="Search applicant, vehicle, dealership, status, or application ID..."
      />
      {issue ? <AdminAlert>{issue.message}</AdminAlert> : null}
      <AdminTable empty={!rows.length} emptyMessage="No applications match this search.">
        <TableHead>
          <tr>
            <TableHeaderCell>Applicant</TableHeaderCell>
            <TableHeaderCell>Vehicle</TableHeaderCell>
            <TableHeaderCell>Dealership</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Documents</TableHeaderCell>
            <TableHeaderCell>Created</TableHeaderCell>
          </tr>
        </TableHead>
        <tbody>
          {rows.map((application) => (
            <tr className="border-b border-border/60" key={application.id}>
              <TableCell>
                <p className="font-medium">
                  {application.customer?.full_name ?? "Name not set"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {application.customer?.email ?? application.customer_id}
                </p>
              </TableCell>
              <TableCell>
                <p>
                  {application.vehicles
                    ? `${application.vehicles.year} ${application.vehicles.make} ${application.vehicles.model}`
                    : "Vehicle unavailable"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {application.vehicles?.vin ?? application.vehicle_id}
                </p>
              </TableCell>
              <TableCell>
                {application.dealerships ? (
                  <Link
                    className="hover:underline"
                    href={
                      `/dashboard/admin/dealerships/${application.dealerships.id}` as Route
                    }
                  >
                    {application.dealerships.name}
                  </Link>
                ) : (
                  "Unknown"
                )}
              </TableCell>
              <TableCell>
                <StatusBadge tone={statusTone(application.status)}>
                  {application.status.replace("_", " ")}
                </StatusBadge>
              </TableCell>
              <TableCell>{application.application_documents?.length ?? 0}</TableCell>
              <TableCell>{formatDate(application.created_at)}</TableCell>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}

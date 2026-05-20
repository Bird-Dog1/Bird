import Link from "next/link";

import { updateDealershipAdminStatus } from "@/app/dashboard/admin/actions";
import {
  AdminAlert,
  AdminPageHeader,
  AdminTable,
  DealershipActionForm,
  StatusBadge,
  TableCell,
  TableHead,
  TableHeaderCell,
} from "@/app/dashboard/admin/_components";
import {
  dealershipStatus,
  formatDate,
  formatMoney,
  getQueryIssue,
  statusTone,
} from "@/app/dashboard/admin/_utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { type Tables } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dealership detail",
};

type DealershipDetailPageProps = {
  params: Promise<{
    dealershipId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

type DealershipDetail = Tables<"dealerships"> & {
  dealer_users: Array<{
    id: string;
    profiles: Pick<Tables<"profiles">, "email" | "full_name" | "id" | "role"> | null;
  }> | null;
  vehicles: Array<
    Pick<
      Tables<"vehicles">,
      "id" | "year" | "make" | "model" | "status" | "monthly_price" | "created_at"
    >
  > | null;
  rental_applications: Array<
    Pick<Tables<"rental_applications">, "id" | "status" | "created_at">
  > | null;
  rentals: Array<Pick<Tables<"rentals">, "id" | "active" | "start_date" | "monthly_rate">> | null;
};

export default async function DealershipDetailPage({
  params,
  searchParams,
}: DealershipDetailPageProps) {
  await requireRole(["admin"]);
  const { dealershipId } = await params;
  const messages = await searchParams;
  const supabase = await createServerSupabaseClient();

  const dealership = await supabase
    .from("dealerships")
    .select(
      `
        *,
        dealer_users (
          id,
          profiles ( id, email, full_name, role )
        ),
        vehicles (
          id,
          year,
          make,
          model,
          status,
          monthly_price,
          created_at
        ),
        rental_applications (
          id,
          status,
          created_at
        ),
        rentals (
          id,
          active,
          start_date,
          monthly_rate
        )
      `,
    )
    .eq("id", dealershipId)
    .maybeSingle();

  const issue = getQueryIssue([dealership]);
  const detail = dealership.data as DealershipDetail | null;
  const status = detail ? dealershipStatus(detail.approved, detail.suspended) : null;
  const returnTo = `/dashboard/admin/dealerships/${dealershipId}`;

  return (
    <div className="grid gap-6">
      {messages.error ? <AdminAlert>{messages.error}</AdminAlert> : null}
      {messages.message ? (
        <AdminAlert tone="success">{messages.message}</AdminAlert>
      ) : null}
      <AdminPageHeader
        description="Inspect dealership ownership, inventory, applications, and rental activity."
        title={detail?.name ?? "Dealership detail"}
      >
        <Link
          className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
          href="/dashboard/admin/dealerships"
        >
          Back to approvals
        </Link>
      </AdminPageHeader>

      {issue ? <AdminAlert>{issue.message}</AdminAlert> : null}
      {!detail && !issue ? <AdminAlert>Dealership not found.</AdminAlert> : null}

      {detail && status ? (
        <>
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{detail.name}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  {detail.address ? `${detail.address}, ` : ""}
                  {detail.city}, {detail.state} {detail.zip ?? ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                {!detail.approved ? (
                  <DealershipActionForm
                    action={updateDealershipAdminStatus}
                    dealershipId={detail.id}
                    intent="approve"
                    label="Approve"
                    returnTo={returnTo}
                    variant="default"
                  />
                ) : null}
                {detail.suspended ? (
                  <DealershipActionForm
                    action={updateDealershipAdminStatus}
                    dealershipId={detail.id}
                    intent="unsuspend"
                    label="Unsuspend"
                    returnTo={returnTo}
                  />
                ) : (
                  <DealershipActionForm
                    action={updateDealershipAdminStatus}
                    dealershipId={detail.id}
                    intent="suspend"
                    label="Suspend"
                    returnTo={returnTo}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <DetailStat label="Dealer users" value={detail.dealer_users?.length ?? 0} />
              <DetailStat label="Vehicles" value={detail.vehicles?.length ?? 0} />
              <DetailStat
                label="Applications"
                value={detail.rental_applications?.length ?? 0}
              />
              <DetailStat label="Rentals" value={detail.rentals?.length ?? 0} />
            </CardContent>
          </Card>

          <DetailSection title="Dealer users">
            <AdminTable
              empty={!detail.dealer_users?.length}
              emptyMessage="No dealer users assigned."
            >
              <TableHead>
                <tr>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Role</TableHeaderCell>
                </tr>
              </TableHead>
              <tbody>
                {(detail.dealer_users ?? []).map((dealerUser) => (
                  <tr className="border-b border-border/60" key={dealerUser.id}>
                    <TableCell>{dealerUser.profiles?.full_name ?? "Not set"}</TableCell>
                    <TableCell>{dealerUser.profiles?.email ?? "Not set"}</TableCell>
                    <TableCell>
                      <StatusBadge>{dealerUser.profiles?.role ?? "Unknown"}</StatusBadge>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </DetailSection>

          <DetailSection title="Vehicles">
            <AdminTable empty={!detail.vehicles?.length} emptyMessage="No vehicles found.">
              <TableHead>
                <tr>
                  <TableHeaderCell>Vehicle</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Monthly</TableHeaderCell>
                  <TableHeaderCell>Created</TableHeaderCell>
                </tr>
              </TableHead>
              <tbody>
                {(detail.vehicles ?? []).map((vehicle) => (
                  <tr className="border-b border-border/60" key={vehicle.id}>
                    <TableCell>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={statusTone(vehicle.status)}>
                        {vehicle.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{formatMoney(vehicle.monthly_price)}</TableCell>
                    <TableCell>{formatDate(vehicle.created_at)}</TableCell>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </DetailSection>

          <DetailSection title="Applications">
            <AdminTable
              empty={!detail.rental_applications?.length}
              emptyMessage="No applications found."
            >
              <TableHead>
                <tr>
                  <TableHeaderCell>Application</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Created</TableHeaderCell>
                </tr>
              </TableHead>
              <tbody>
                {(detail.rental_applications ?? []).map((application) => (
                  <tr className="border-b border-border/60" key={application.id}>
                    <TableCell>{application.id}</TableCell>
                    <TableCell>
                      <StatusBadge tone={statusTone(application.status)}>
                        {application.status.replace("_", " ")}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{formatDate(application.created_at)}</TableCell>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </DetailSection>

          <DetailSection title="Rentals">
            <AdminTable empty={!detail.rentals?.length} emptyMessage="No rentals found.">
              <TableHead>
                <tr>
                  <TableHeaderCell>Rental</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Monthly</TableHeaderCell>
                  <TableHeaderCell>Start date</TableHeaderCell>
                </tr>
              </TableHead>
              <tbody>
                {(detail.rentals ?? []).map((rental) => (
                  <tr className="border-b border-border/60" key={rental.id}>
                    <TableCell>{rental.id}</TableCell>
                    <TableCell>
                      <StatusBadge tone={rental.active ? "success" : "muted"}>
                        {rental.active ? "Active" : "Inactive"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{formatMoney(rental.monthly_rate)}</TableCell>
                    <TableCell>{formatDate(rental.start_date)}</TableCell>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </DetailSection>
        </>
      ) : null}
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-background/40 p-4">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function DetailSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="grid gap-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

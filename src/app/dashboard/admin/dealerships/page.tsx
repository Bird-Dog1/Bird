import Link from "next/link";
import { type Route } from "next";

import { updateDealershipAdminStatus } from "@/app/dashboard/admin/actions";
import {
  AdminAlert,
  AdminPageHeader,
  AdminSearch,
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
  getQueryIssue,
  matchesSearch,
  normalizeSearch,
} from "@/app/dashboard/admin/_utils";
import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { type Tables } from "@/lib/supabase";

export const metadata = {
  title: "Dealership approvals",
};

type DealershipsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    q?: string;
  }>;
};

type DealerUser = {
  id: string;
  profiles: Pick<Tables<"profiles">, "email" | "full_name" | "id" | "role"> | null;
};

type DealershipRow = Tables<"dealerships"> & {
  dealer_users: DealerUser[] | null;
  vehicles: Array<{ id: string }> | null;
  rental_applications: Array<{ id: string }> | null;
  rentals: Array<{ id: string; active: boolean }> | null;
};

export default async function DealershipApprovalsPage({
  searchParams,
}: DealershipsPageProps) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const search = normalizeSearch(params.q);
  const supabase = await createServerSupabaseClient();

  const dealerships = await supabase
    .from("dealerships")
    .select(
      `
        *,
        dealer_users (
          id,
          profiles ( id, email, full_name, role )
        ),
        vehicles ( id ),
        rental_applications ( id ),
        rentals ( id, active )
      `,
    )
    .order("created_at", { ascending: false });

  const issue = getQueryIssue([dealerships]);
  const rows = ((dealerships.data ?? []) as DealershipRow[]).filter((dealership) =>
    matchesSearch(search, [
      dealership.name,
      dealership.city,
      dealership.state,
      dealership.phone,
      dealership.website,
      dealership.approved ? "approved" : "pending",
      dealership.suspended ? "suspended" : "active",
      ...(dealership.dealer_users ?? []).flatMap((dealerUser) => [
        dealerUser.profiles?.email,
        dealerUser.profiles?.full_name,
      ]),
    ]),
  );

  return (
    <div className="grid gap-6">
      {params.error ? <AdminAlert>{params.error}</AdminAlert> : null}
      {params.message ? (
        <AdminAlert tone="success">{params.message}</AdminAlert>
      ) : null}
      <AdminPageHeader
        description="Approve pending dealerships and suspend or restore dealership access."
        title="Dealership approvals"
      />
      <AdminSearch
        defaultValue={params.q}
        placeholder="Search dealership, city, status, or dealer email..."
      />
      {issue ? <AdminAlert>{issue.message}</AdminAlert> : null}
      <AdminTable empty={!rows.length} emptyMessage="No dealerships match this search.">
        <TableHead>
          <tr>
            <TableHeaderCell>Dealership</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Dealer users</TableHeaderCell>
            <TableHeaderCell>Activity</TableHeaderCell>
            <TableHeaderCell>Created</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </tr>
        </TableHead>
        <tbody>
          {rows.map((dealership) => {
            const status = dealershipStatus(
              dealership.approved,
              dealership.suspended,
            );

            return (
              <tr className="border-b border-border/60" key={dealership.id}>
                <TableCell>
                  <Link
                    className="font-medium hover:underline"
                    href={`/dashboard/admin/dealerships/${dealership.id}` as Route}
                  >
                    {dealership.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {dealership.city}, {dealership.state}
                  </p>
                </TableCell>
                <TableCell>
                  <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                </TableCell>
                <TableCell>
                  <p>{dealership.dealer_users?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">
                    {dealership.dealer_users?.[0]?.profiles?.email ?? "No users"}
                  </p>
                </TableCell>
                <TableCell>
                  <p>{dealership.vehicles?.length ?? 0} vehicles</p>
                  <p className="text-xs text-muted-foreground">
                    {dealership.rental_applications?.length ?? 0} applications,{" "}
                    {dealership.rentals?.length ?? 0} rentals
                  </p>
                </TableCell>
                <TableCell>{formatDate(dealership.created_at)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {!dealership.approved ? (
                      <DealershipActionForm
                        action={updateDealershipAdminStatus}
                        dealershipId={dealership.id}
                        intent="approve"
                        label="Approve"
                        returnTo="/dashboard/admin/dealerships"
                        variant="default"
                      />
                    ) : null}
                    {dealership.suspended ? (
                      <DealershipActionForm
                        action={updateDealershipAdminStatus}
                        dealershipId={dealership.id}
                        intent="unsuspend"
                        label="Unsuspend"
                        returnTo="/dashboard/admin/dealerships"
                      />
                    ) : (
                      <DealershipActionForm
                        action={updateDealershipAdminStatus}
                        dealershipId={dealership.id}
                        intent="suspend"
                        label="Suspend"
                        returnTo="/dashboard/admin/dealerships"
                      />
                    )}
                  </div>
                </TableCell>
              </tr>
            );
          })}
        </tbody>
      </AdminTable>
    </div>
  );
}

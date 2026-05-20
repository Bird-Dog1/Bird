import Link from "next/link";
import { type Route } from "next";

import {
  AdminAlert,
  AdminPageHeader,
  AdminTable,
  MetricCard,
  StatusBadge,
  TableCell,
  TableHead,
  TableHeaderCell,
} from "@/app/dashboard/admin/_components";
import {
  dealershipStatus,
  formatDate,
  getQueryIssue,
  statusTone,
} from "@/app/dashboard/admin/_utils";
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

type AdminDashboardPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

type RecentDealership = {
  id: string;
  name: string;
  city: string;
  state: string;
  approved: boolean;
  suspended: boolean;
  created_at: string;
};

type RecentApplication = {
  id: string;
  status: string;
  created_at: string;
  dealerships: { name: string } | Array<{ name: string }> | null;
  vehicles:
    | { year: number; make: string; model: string }
    | Array<{ year: number; make: string; model: string }>
    | null;
};

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  const [
    users,
    dealerships,
    pendingDealerships,
    suspendedDealerships,
    vehicles,
    applications,
    rentals,
    activeRentals,
    recentDealerships,
    recentApplications,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("dealerships").select("*", { count: "exact", head: true }),
    supabase
      .from("dealerships")
      .select("*", { count: "exact", head: true })
      .eq("approved", false),
    supabase
      .from("dealerships")
      .select("*", { count: "exact", head: true })
      .eq("suspended", true),
    supabase.from("vehicles").select("*", { count: "exact", head: true }),
    supabase.from("rental_applications").select("*", { count: "exact", head: true }),
    supabase.from("rentals").select("*", { count: "exact", head: true }),
    supabase
      .from("rentals")
      .select("*", { count: "exact", head: true })
      .eq("active", true),
    supabase
      .from("dealerships")
      .select("id,name,city,state,approved,suspended,created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("rental_applications")
      .select(
        `
          id,
          status,
          created_at,
          dealerships ( name ),
          vehicles ( year, make, model )
        `,
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const issue = getQueryIssue([
    users,
    dealerships,
    pendingDealerships,
    suspendedDealerships,
    vehicles,
    applications,
    rentals,
    activeRentals,
    recentDealerships,
    recentApplications,
  ]);

  return (
    <div className="grid gap-6">
      {params.error ? <AdminAlert>{params.error}</AdminAlert> : null}
      {params.message ? (
        <AdminAlert tone="success">{params.message}</AdminAlert>
      ) : null}
      <AdminPageHeader
        description="Review platform activity, approve dealerships, and inspect every operational record backed by Supabase."
        title="Admin dashboard"
      />

      {issue ? <AdminAlert>{issue.message}</AdminAlert> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          description="Total platform accounts"
          href="/dashboard/admin/users"
          label="Users"
          value={users.count ?? 0}
        />
        <MetricCard
          description={`${pendingDealerships.count ?? 0} awaiting approval, ${
            suspendedDealerships.count ?? 0
          } suspended`}
          href="/dashboard/admin/dealerships"
          label="Dealerships"
          value={dealerships.count ?? 0}
        />
        <MetricCard
          description="Vehicles across all dealerships"
          href="/dashboard/admin/vehicles"
          label="Vehicles"
          value={vehicles.count ?? 0}
        />
        <MetricCard
          description={`${activeRentals.count ?? 0} active rentals`}
          href="/dashboard/admin/rentals"
          label="Rentals"
          value={rentals.count ?? 0}
        />
        <MetricCard
          description="Customer rental requests"
          href="/dashboard/admin/applications"
          label="Applications"
          value={applications.count ?? 0}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent dealerships</CardTitle>
            <CardDescription>Newest dealership records and approval status.</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminTable
              empty={!recentDealerships.data?.length}
              emptyMessage="No dealerships found."
            >
              <TableHead>
                <tr>
                  <TableHeaderCell>Dealership</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Created</TableHeaderCell>
                </tr>
              </TableHead>
              <tbody>
                {((recentDealerships.data ?? []) as RecentDealership[]).map(
                  (dealership) => {
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
                        <TableCell>{formatDate(dealership.created_at)}</TableCell>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </AdminTable>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent applications</CardTitle>
            <CardDescription>Latest rental application activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminTable
              empty={!recentApplications.data?.length}
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
                {((recentApplications.data ?? []) as RecentApplication[]).map(
                  (application) => {
                    const vehicle = firstRelation(application.vehicles);
                    const dealership = firstRelation(application.dealerships);

                    return (
                      <tr className="border-b border-border/60" key={application.id}>
                        <TableCell>
                          <p className="font-medium">
                            {vehicle
                              ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                              : "Vehicle unavailable"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {dealership?.name ?? "Dealership unavailable"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <StatusBadge tone={statusTone(application.status)}>
                            {application.status.replace("_", " ")}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>{formatDate(application.created_at)}</TableCell>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </AdminTable>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function firstRelation<T>(relation: T | T[] | null) {
  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}

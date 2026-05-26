import Link from "next/link";
import type { Route } from "next";

import {
  AdminDataTable,
  AdminEmptyState,
  AdminPageHeader,
  AdminStatusBadge,
  AdminTableCell,
} from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/guards";
import { fetchAdminDashboardData, getDealershipNamesForUser, includesSearch } from "@/lib/admin/data";
import { formatDate } from "@/lib/bird-dog/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "Users" };
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const data = await fetchAdminDashboardData(supabase);
  const query = params.q?.trim() ?? "";
  const users = query
    ? data.profiles.filter(
        (user) =>
          includesSearch(user.email, query) ||
          includesSearch(user.full_name, query) ||
          includesSearch(user.role, query),
      )
    : data.profiles;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description="Read-only profile directory across customers, dealers, and admins. Role changes stay out of this owner dashboard."
        title="Users"
      />
      <Search value={query} />
      <AdminDataTable
        columns={["Name", "Email", "Role", "Created", "Status", "Linked dealership", "Details"]}
        empty={<AdminEmptyState description="No records found yet." />}
        rows={users.map((user) => (
          <>
            <AdminTableCell className="font-semibold">{user.full_name ?? "Not provided"}</AdminTableCell>
            <AdminTableCell>{user.email ?? "Not provided"}</AdminTableCell>
            <AdminTableCell><AdminStatusBadge value={user.role} /></AdminTableCell>
            <AdminTableCell>{formatDate(user.created_at)}</AdminTableCell>
            <AdminTableCell><AdminStatusBadge value="active" /></AdminTableCell>
            <AdminTableCell>{getDealershipNamesForUser(data.dealerUsers, user.id)}</AdminTableCell>
            <AdminTableCell>
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/admin/users/${user.id}` as Route}>View details</Link>
              </Button>
            </AdminTableCell>
          </>
        ))}
      />
    </div>
  );
}

function Search({ value }: { value?: string }) {
  return (
    <form className="flex gap-2 rounded-[2rem] border border-white/10 bg-card/85 p-3 shadow-2xl shadow-black/20">
      <input
        className="flex h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-foreground shadow-inner shadow-black/20 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        defaultValue={value ?? ""}
        name="q"
        placeholder="Search name, email, or role"
      />
      <Button type="submit">Search</Button>
    </form>
  );
}

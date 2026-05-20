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
} from "@/app/dashboard/admin/_utils";
import { requireRole } from "@/lib/auth/guards";
import { type Tables } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = {
  title: "User management",
};

type UsersPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

type UserRow = Tables<"profiles"> & {
  dealer_users: Array<{
    id: string;
    dealerships: Pick<Tables<"dealerships">, "id" | "name"> | null;
  }> | null;
  rental_applications: Array<{ id: string }> | null;
  rentals: Array<{ id: string; active: boolean }> | null;
};

export default async function UserManagementPage({ searchParams }: UsersPageProps) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const search = normalizeSearch(params.q);
  const supabase = await createServerSupabaseClient();

  const users = await supabase
    .from("profiles")
    .select(
      `
        *,
        dealer_users (
          id,
          dealerships ( id, name )
        ),
        rental_applications ( id ),
        rentals ( id, active )
      `,
    )
    .order("created_at", { ascending: false });

  const issue = getQueryIssue([users]);
  const rows = ((users.data ?? []) as UserRow[]).filter((user) =>
    matchesSearch(search, [
      user.id,
      user.email,
      user.full_name,
      user.phone,
      user.role,
      ...(user.dealer_users ?? []).map((dealerUser) => dealerUser.dealerships?.name),
    ]),
  );

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        description="View every platform user, role, dealership assignment, and account activity."
        title="User management"
      />
      <AdminSearch
        defaultValue={params.q}
        placeholder="Search name, email, role, phone, or dealership..."
      />
      {issue ? <AdminAlert>{issue.message}</AdminAlert> : null}
      <AdminTable empty={!rows.length} emptyMessage="No users match this search.">
        <TableHead>
          <tr>
            <TableHeaderCell>User</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
            <TableHeaderCell>Dealerships</TableHeaderCell>
            <TableHeaderCell>Activity</TableHeaderCell>
            <TableHeaderCell>Created</TableHeaderCell>
          </tr>
        </TableHead>
        <tbody>
          {rows.map((user) => (
            <tr className="border-b border-border/60" key={user.id}>
              <TableCell>
                <p className="font-medium">{user.full_name ?? "Name not set"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </TableCell>
              <TableCell>
                <StatusBadge>{user.role}</StatusBadge>
              </TableCell>
              <TableCell>
                {user.dealer_users?.length ? (
                  <div className="grid gap-1">
                    {user.dealer_users.map((dealerUser) => (
                      <span key={dealerUser.id}>
                        {dealerUser.dealerships?.name ?? "Unknown dealership"}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </TableCell>
              <TableCell>
                <p>{user.rental_applications?.length ?? 0} applications</p>
                <p className="text-xs text-muted-foreground">
                  {(user.rentals ?? []).filter((rental) => rental.active).length} active
                  rentals
                </p>
              </TableCell>
              <TableCell>{formatDate(user.created_at)}</TableCell>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}

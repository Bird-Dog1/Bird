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
  formatMoney,
  getQueryIssue,
  matchesSearch,
  normalizeSearch,
} from "@/app/dashboard/admin/_utils";
import { requireRole } from "@/lib/auth/guards";
import { type Tables } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = {
  title: "All rentals",
};

type RentalsPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

type RentalRow = Tables<"rentals"> & {
  customer: Pick<Tables<"profiles">, "email" | "full_name" | "id"> | null;
  dealerships: Pick<Tables<"dealerships">, "id" | "name"> | null;
  vehicles: Pick<Tables<"vehicles">, "id" | "year" | "make" | "model" | "vin"> | null;
  rental_applications: Pick<Tables<"rental_applications">, "id" | "status"> | null;
};

export default async function AllRentalsPage({ searchParams }: RentalsPageProps) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const search = normalizeSearch(params.q);
  const supabase = await createServerSupabaseClient();

  const rentals = await supabase
    .from("rentals")
    .select(
      `
        *,
        customer:profiles!rentals_customer_id_fkey (
          id,
          email,
          full_name
        ),
        dealerships ( id, name ),
        vehicles ( id, year, make, model, vin ),
        rental_applications ( id, status )
      `,
    )
    .order("created_at", { ascending: false });

  const issue = getQueryIssue([rentals]);
  const rows = ((rentals.data ?? []) as RentalRow[]).filter((rental) =>
    matchesSearch(search, [
      rental.id,
      rental.customer?.email,
      rental.customer?.full_name,
      rental.dealerships?.name,
      rental.vehicles?.vin,
      rental.vehicles?.make,
      rental.vehicles?.model,
      rental.active ? "active" : "inactive",
      rental.rental_applications?.status,
    ]),
  );

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        description="Track every rental, its customer, dealership, linked application, and active status."
        title="All rentals"
      />
      <AdminSearch
        defaultValue={params.q}
        placeholder="Search renter, vehicle, dealership, status, or rental ID..."
      />
      {issue ? <AdminAlert>{issue.message}</AdminAlert> : null}
      <AdminTable empty={!rows.length} emptyMessage="No rentals match this search.">
        <TableHead>
          <tr>
            <TableHeaderCell>Renter</TableHeaderCell>
            <TableHeaderCell>Vehicle</TableHeaderCell>
            <TableHeaderCell>Dealership</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Rate</TableHeaderCell>
            <TableHeaderCell>Dates</TableHeaderCell>
          </tr>
        </TableHead>
        <tbody>
          {rows.map((rental) => (
            <tr className="border-b border-border/60" key={rental.id}>
              <TableCell>
                <p className="font-medium">
                  {rental.customer?.full_name ?? "Name not set"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {rental.customer?.email ?? rental.customer_id}
                </p>
              </TableCell>
              <TableCell>
                <p>
                  {rental.vehicles
                    ? `${rental.vehicles.year} ${rental.vehicles.make} ${rental.vehicles.model}`
                    : "Vehicle unavailable"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {rental.vehicles?.vin ?? rental.vehicle_id}
                </p>
              </TableCell>
              <TableCell>
                {rental.dealerships ? (
                  <Link
                    className="hover:underline"
                    href={`/dashboard/admin/dealerships/${rental.dealerships.id}` as Route}
                  >
                    {rental.dealerships.name}
                  </Link>
                ) : (
                  "Unknown"
                )}
              </TableCell>
              <TableCell>
                <StatusBadge tone={rental.active ? "success" : "muted"}>
                  {rental.active ? "Active" : "Inactive"}
                </StatusBadge>
                {rental.rental_applications ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Application {rental.rental_applications.status.replace("_", " ")}
                  </p>
                ) : null}
              </TableCell>
              <TableCell>
                <p>{formatMoney(rental.monthly_rate)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatMoney(rental.deposit)} deposit
                </p>
              </TableCell>
              <TableCell>
                <p>{formatDate(rental.start_date)}</p>
                <p className="text-xs text-muted-foreground">
                  Ends {formatDate(rental.end_date)}
                </p>
              </TableCell>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}

import type { SupabaseClient } from "@supabase/supabase-js";

import { formatCurrency } from "@/lib/bird-dog/format";
import type { ApplicationDocument, VehiclePhoto } from "@/lib/bird-dog/types";
import type { Database, Tables } from "@/lib/supabase/database.types";
import { signVehiclePhotos } from "@/lib/supabase/storage";

export type AdminProfile = Tables<"profiles">;
export type AdminDealership = Tables<"dealerships">;
export type AdminDealerUser = Tables<"dealer_users"> & {
  dealerships: Pick<Tables<"dealerships">, "id" | "name"> | null;
};
export type AdminVehicle = Tables<"vehicles"> & {
  dealerships: Pick<Tables<"dealerships">, "id" | "name"> | null;
  vehicle_photos: VehiclePhoto[];
};
export type AdminApplication = Tables<"rental_applications"> & {
  application_documents: ApplicationDocument[];
  dealerships: Pick<Tables<"dealerships">, "id" | "name" | "phone"> | null;
  profiles: Pick<Tables<"profiles">, "id" | "email" | "full_name" | "phone"> | null;
  vehicles: Pick<
    Tables<"vehicles">,
    "id" | "vin" | "year" | "make" | "model" | "trim" | "monthly_price" | "deposit" | "city" | "state"
  > | null;
};
export type AdminRental = Tables<"rentals"> & {
  dealerships: Pick<Tables<"dealerships">, "id" | "name" | "phone"> | null;
  profiles: Pick<Tables<"profiles">, "id" | "email" | "full_name" | "phone"> | null;
  vehicles: Pick<
    Tables<"vehicles">,
    "id" | "vin" | "year" | "make" | "model" | "trim" | "city" | "state"
  > | null;
};
export type AdminPayment = Record<string, unknown>;

type AdminQueryError = {
  message: string;
};

type DynamicPaymentSelect = {
  limit: (count: number) => PromiseLike<{
    data: AdminPayment[] | null;
    error: AdminQueryError | null;
  }>;
};

type DynamicSupabaseClient = {
  from: (table: string) => {
    select: (columns: string) => DynamicPaymentSelect;
  };
};

export type AdminDashboardData = {
  applications: AdminApplication[];
  dealerUsers: AdminDealerUser[];
  dealerships: AdminDealership[];
  payments: AdminPayment[];
  paymentError: AdminQueryError | null;
  profiles: AdminProfile[];
  rentals: AdminRental[];
  vehicles: AdminVehicle[];
};

const applicationSelect = `
  *,
  vehicles (id, vin, year, make, model, trim, monthly_price, deposit, city, state),
  dealerships (id, name, phone),
  profiles (id, email, full_name, phone),
  application_documents (id, application_id, document_type, file_url, created_at)
`;

const rentalSelect = `
  *,
  vehicles (id, vin, year, make, model, trim, city, state),
  dealerships (id, name, phone),
  profiles (id, email, full_name, phone)
`;

export async function fetchAdminDashboardData(
  supabase: SupabaseClient<Database>,
): Promise<AdminDashboardData> {
  const [
    profilesResult,
    dealershipsResult,
    dealerUsersResult,
    vehiclesResult,
    applicationsResult,
    rentalsResult,
    paymentsResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("dealerships").select("*").order("created_at", { ascending: false }),
    supabase
      .from("dealer_users")
      .select("*, dealerships (id, name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("vehicles")
      .select("*, dealerships (id, name), vehicle_photos (id, vehicle_id, photo_url, sort_order, created_at, updated_at)")
      .order("created_at", { ascending: false }),
    supabase.from("rental_applications").select(applicationSelect).order("created_at", { ascending: false }),
    supabase.from("rentals").select(rentalSelect).order("created_at", { ascending: false }),
    fetchPaymentsIfPresent(supabase),
  ]);

  logAdminQueryError("profiles", profilesResult.error);
  logAdminQueryError("dealerships", dealershipsResult.error);
  logAdminQueryError("dealer_users", dealerUsersResult.error);
  logAdminQueryError("vehicles", vehiclesResult.error);
  logAdminQueryError("rental_applications", applicationsResult.error);
  logAdminQueryError("rentals", rentalsResult.error);

  const vehicles = ((vehiclesResult.data ?? []) as AdminVehicle[]).map((vehicle) => ({
    ...vehicle,
    vehicle_photos: vehicle.vehicle_photos ?? [],
  }));

  return {
    applications: (applicationsResult.data ?? []) as AdminApplication[],
    dealerUsers: (dealerUsersResult.data ?? []) as AdminDealerUser[],
    dealerships: (dealershipsResult.data ?? []) as AdminDealership[],
    payments: paymentsResult.data,
    paymentError: paymentsResult.error,
    profiles: (profilesResult.data ?? []) as AdminProfile[],
    rentals: (rentalsResult.data ?? []) as AdminRental[],
    vehicles: await Promise.all(
      vehicles.map(async (vehicle) => ({
        ...vehicle,
        vehicle_photos: await signVehiclePhotos(supabase, vehicle.vehicle_photos),
      })),
    ),
  };
}

export async function fetchPaymentsIfPresent(supabase: SupabaseClient<Database>) {
  const dynamicSupabase = supabase as unknown as DynamicSupabaseClient;
  const { data, error } = await dynamicSupabase.from("payments").select("*").limit(200);

  if (error) {
    logAdminQueryError("payments", error);
  }

  return {
    data: data ?? [],
    error,
  };
}

export function countBy<T>(records: T[], predicate: (record: T) => boolean) {
  return records.reduce((total, record) => total + (predicate(record) ? 1 : 0), 0);
}

export function getDealershipNamesForUser(
  dealerUsers: AdminDealerUser[],
  userId: string,
) {
  const names = dealerUsers
    .filter((dealerUser) => dealerUser.user_id === userId)
    .map((dealerUser) => dealerUser.dealerships?.name)
    .filter(Boolean);

  return names.length ? names.join(", ") : "None linked";
}

export function getPaymentAmount(payment: AdminPayment) {
  const value = payment.amount ?? payment.amount_paid ?? payment.total ?? payment.monthly_amount;
  const amount = Number(value ?? 0);

  return Number.isFinite(amount) ? amount : 0;
}

export function getPaymentDisplayAmount(payment: AdminPayment) {
  const amount = getPaymentAmount(payment);

  return formatCurrency(amount > 1000 ? amount / 100 : amount);
}

export function getPaymentDate(payment: AdminPayment, keys: string[]) {
  for (const key of keys) {
    const value = payment[key];

    if (typeof value === "string" && value) {
      return value;
    }
  }

  return null;
}

export function getPaymentStatus(payment: AdminPayment) {
  const status = payment.status ?? payment.payment_status;

  return typeof status === "string" && status ? status : "not set";
}

export function isPaymentOverdue(payment: AdminPayment) {
  const dueDate = getPaymentDate(payment, ["due_date", "due_at"]);
  const paidDate = getPaymentDate(payment, ["paid_date", "paid_at"]);
  const status = getPaymentStatus(payment).toLowerCase();

  return (
    status === "overdue" ||
    Boolean(dueDate && !paidDate && new Date(dueDate).getTime() < Date.now())
  );
}

export function getMonthlyPaymentVolume(payments: AdminPayment[]) {
  const now = new Date();

  return payments.reduce((total, payment) => {
    const paymentDate = getPaymentDate(payment, ["paid_date", "paid_at", "created_at"]);

    if (!paymentDate) {
      return total;
    }

    const date = new Date(paymentDate);
    const sameMonth = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

    return sameMonth ? total + getPaymentAmount(payment) : total;
  }, 0);
}

export function getNextDueDate(startDate: string | null | undefined) {
  if (!startDate) {
    return null;
  }

  const dueDate = new Date(startDate);
  const today = new Date();

  while (dueDate.getTime() < today.getTime()) {
    dueDate.setMonth(dueDate.getMonth() + 1);
  }

  return dueDate.toISOString();
}

export function includesSearch(value: string | null | undefined, query: string) {
  return (value ?? "").toLowerCase().includes(query.toLowerCase());
}

function logAdminQueryError(scope: string, error: AdminQueryError | null) {
  if (!error) {
    return;
  }

  console.error(`[admin-dashboard] ${scope} query failed: ${error.message}`);
}

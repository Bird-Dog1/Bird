import { createServerSupabaseClient } from "@/lib/supabase/server";
import { type CustomerApplication, type DealerVehicle } from "@/types/app";

export type VehicleFilters = {
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  make?: string;
  model?: string;
  vehicleType?: string;
  rideshareAllowed?: boolean;
};

export type VehicleFilterOptions = {
  cities: string[];
  states: string[];
  makes: string[];
  models: string[];
  vehicleTypes: string[];
};

export type ApplicationWithVehicle = CustomerApplication & {
  dealer_vehicles: Pick<
    DealerVehicle,
    | "id"
    | "year"
    | "make"
    | "model"
    | "city"
    | "state"
    | "monthly_price"
    | "deposit_amount"
    | "dealership_name"
  > | null;
};

const vehicleSelect = `
  id,
  dealer_id,
  vin,
  year,
  make,
  model,
  inventory_type,
  monthly_price,
  mileage,
  city,
  state,
  vehicle_type,
  photo_urls,
  deposit_amount,
  mileage_limit,
  insurance_required,
  minimum_age,
  rideshare_allowed,
  dealership_name,
  dealership_phone,
  dealership_email,
  description,
  status,
  created_at,
  updated_at
`;

function uniqueSorted(values: Array<string | null>) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function parseVehicleFilters(
  params: Record<string, string | string[] | undefined>,
): VehicleFilters {
  const getString = (key: string) => {
    const value = params[key];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  };
  const getNumber = (key: string) => {
    const value = Number(getString(key));
    return Number.isFinite(value) ? value : undefined;
  };

  return {
    city: getString("city"),
    state: getString("state"),
    minPrice: getNumber("min_price"),
    maxPrice: getNumber("max_price"),
    make: getString("make"),
    model: getString("model"),
    vehicleType: getString("vehicle_type"),
    rideshareAllowed: getString("rideshare_allowed") === "true" ? true : undefined,
  };
}

export function hasVehicleFilters(filters: VehicleFilters) {
  return Object.values(filters).some((value) => value !== undefined);
}

export async function getAvailableVehicles(filters: VehicleFilters) {
  const supabase = await createServerSupabaseClient();

  let vehiclesQuery = supabase
    .from("dealer_vehicles")
    .select(vehicleSelect)
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (filters.city) {
    vehiclesQuery = vehiclesQuery.eq("city", filters.city);
  }
  if (filters.state) {
    vehiclesQuery = vehiclesQuery.eq("state", filters.state);
  }
  if (filters.make) {
    vehiclesQuery = vehiclesQuery.eq("make", filters.make);
  }
  if (filters.model) {
    vehiclesQuery = vehiclesQuery.eq("model", filters.model);
  }
  if (filters.vehicleType) {
    vehiclesQuery = vehiclesQuery.eq("vehicle_type", filters.vehicleType);
  }
  if (filters.minPrice !== undefined) {
    vehiclesQuery = vehiclesQuery.gte("monthly_price", filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    vehiclesQuery = vehiclesQuery.lte("monthly_price", filters.maxPrice);
  }
  if (filters.rideshareAllowed) {
    vehiclesQuery = vehiclesQuery.eq("rideshare_allowed", true);
  }

  const [vehiclesResult, optionsResult] = await Promise.all([
    vehiclesQuery,
    supabase
      .from("dealer_vehicles")
      .select("city,state,make,model,vehicle_type")
      .eq("status", "available"),
  ]);

  const optionRows = optionsResult.data ?? [];

  return {
    vehicles: (vehiclesResult.data ?? []) as DealerVehicle[],
    options: {
      cities: uniqueSorted(optionRows.map((row) => row.city)),
      states: uniqueSorted(optionRows.map((row) => row.state)),
      makes: uniqueSorted(optionRows.map((row) => row.make)),
      models: uniqueSorted(optionRows.map((row) => row.model)),
      vehicleTypes: uniqueSorted(optionRows.map((row) => row.vehicle_type)),
    } satisfies VehicleFilterOptions,
    error: vehiclesResult.error?.message ?? optionsResult.error?.message ?? null,
  };
}

export async function getAvailableVehicleById(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("dealer_vehicles")
    .select(vehicleSelect)
    .eq("id", id)
    .eq("status", "available")
    .maybeSingle();

  return {
    vehicle: data as DealerVehicle | null,
    error: error?.message ?? null,
  };
}

export async function getCustomerApplications(customerId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("customer_applications")
    .select(
      `
        id,
        customer_id,
        vehicle_id,
        monthly_budget,
        primary_use,
        transportation_needs,
        driver_license_path,
        insurance_document_path,
        applicant_phone,
        applicant_city,
        applicant_state,
        desired_start_date,
        employment_status,
        notes,
        status,
        created_at,
        updated_at,
        dealer_vehicles (
          id,
          year,
          make,
          model,
          city,
          state,
          monthly_price,
          deposit_amount,
          dealership_name
        )
      `,
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  return {
    applications: (data ?? []) as unknown as ApplicationWithVehicle[],
    error: error?.message ?? null,
  };
}

export async function getCustomerApplicationById(customerId: string, id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("customer_applications")
    .select(
      `
        id,
        customer_id,
        vehicle_id,
        monthly_budget,
        primary_use,
        transportation_needs,
        driver_license_path,
        insurance_document_path,
        applicant_phone,
        applicant_city,
        applicant_state,
        desired_start_date,
        employment_status,
        notes,
        status,
        created_at,
        updated_at,
        dealer_vehicles (
          id,
          year,
          make,
          model,
          city,
          state,
          monthly_price,
          deposit_amount,
          dealership_name
        )
      `,
    )
    .eq("customer_id", customerId)
    .eq("id", id)
    .maybeSingle();

  return {
    application: data as unknown as ApplicationWithVehicle | null,
    error: error?.message ?? null,
  };
}

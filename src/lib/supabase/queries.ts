import type { Database, TablesInsert, TablesUpdate } from "./database.types";

type TableName = keyof Database["public"]["Tables"];

export type SupabaseClientLike = {
  from: (table: TableName) => any;
  storage: {
    from: (bucket: "vehicle-photos" | "application-documents") => any;
  };
};

export type VehicleFilters = {
  city?: string;
  state?: string;
  make?: string;
  model?: string;
  vehicleType?: string;
  rideshareAllowed?: boolean;
  limit?: number;
};

export type ApplicationFilters = {
  status?: Database["public"]["Enums"]["application_status"];
  limit?: number;
};

export const PUBLIC_VEHICLE_SELECT = `
  *,
  dealerships!inner (
    id,
    name,
    city,
    state,
    phone,
    website,
    approved,
    suspended
  ),
  vehicle_photos (
    id,
    photo_url,
    sort_order
  )
`;

export const APPLICATION_SELECT = `
  *,
  vehicles (
    id,
    vin,
    year,
    make,
    model,
    trim,
    monthly_price,
    city,
    state
  ),
  dealerships (
    id,
    name,
    phone
  ),
  application_documents (
    id,
    document_type,
    file_url,
    created_at
  )
`;

export const RENTAL_SELECT = `
  *,
  vehicles (
    id,
    vin,
    year,
    make,
    model,
    trim,
    city,
    state
  ),
  dealerships (
    id,
    name,
    phone
  )
`;

export function listAvailableVehicles(
  supabase: SupabaseClientLike,
  filters: VehicleFilters = {},
) {
  let query = supabase
    .from("vehicles")
    .select(PUBLIC_VEHICLE_SELECT)
    .eq("status", "available")
    .eq("dealerships.approved", true)
    .eq("dealerships.suspended", false)
    .order("created_at", { ascending: false });

  query = applyVehicleFilters(query, filters);

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  return query;
}

export function getAvailableVehicleById(
  supabase: SupabaseClientLike,
  vehicleId: string,
) {
  return supabase
    .from("vehicles")
    .select(PUBLIC_VEHICLE_SELECT)
    .eq("id", vehicleId)
    .eq("status", "available")
    .eq("dealerships.approved", true)
    .eq("dealerships.suspended", false)
    .maybeSingle();
}

export function listDealerVehicles(
  supabase: SupabaseClientLike,
  dealershipId: string,
  filters: VehicleFilters = {},
) {
  let query = supabase
    .from("vehicles")
    .select("*, vehicle_photos (id, photo_url, sort_order)")
    .eq("dealership_id", dealershipId)
    .order("created_at", { ascending: false });

  query = applyVehicleFilters(query, filters);

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  return query;
}

export function createVehicle(
  supabase: SupabaseClientLike,
  vehicle: TablesInsert<"vehicles">,
) {
  return supabase.from("vehicles").insert(vehicle).select().single();
}

export function updateVehicle(
  supabase: SupabaseClientLike,
  vehicleId: string,
  vehicle: TablesUpdate<"vehicles">,
) {
  return supabase.from("vehicles").update(vehicle).eq("id", vehicleId).select().single();
}

export function addVehiclePhoto(
  supabase: SupabaseClientLike,
  photo: TablesInsert<"vehicle_photos">,
) {
  return supabase.from("vehicle_photos").insert(photo).select().single();
}

export function listCustomerApplications(
  supabase: SupabaseClientLike,
  customerId: string,
  filters: ApplicationFilters = {},
) {
  let query = supabase
    .from("rental_applications")
    .select(APPLICATION_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  query = applyApplicationFilters(query, filters);

  return query;
}

export function listDealerApplications(
  supabase: SupabaseClientLike,
  dealershipId: string,
  filters: ApplicationFilters = {},
) {
  let query = supabase
    .from("rental_applications")
    .select(APPLICATION_SELECT)
    .eq("dealership_id", dealershipId)
    .order("created_at", { ascending: false });

  query = applyApplicationFilters(query, filters);

  return query;
}

export function createRentalApplication(
  supabase: SupabaseClientLike,
  application: TablesInsert<"rental_applications">,
) {
  return supabase.from("rental_applications").insert(application).select().single();
}

export function updateRentalApplicationStatus(
  supabase: SupabaseClientLike,
  applicationId: string,
  status: Database["public"]["Enums"]["application_status"],
  dealerNotes?: string | null,
) {
  return supabase
    .from("rental_applications")
    .update({ status, dealer_notes: dealerNotes })
    .eq("id", applicationId)
    .select()
    .single();
}

export function addApplicationDocument(
  supabase: SupabaseClientLike,
  document: TablesInsert<"application_documents">,
) {
  return supabase.from("application_documents").insert(document).select().single();
}

export function listCustomerRentals(supabase: SupabaseClientLike, customerId: string) {
  return supabase
    .from("rentals")
    .select(RENTAL_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
}

export function listDealerRentals(supabase: SupabaseClientLike, dealershipId: string) {
  return supabase
    .from("rentals")
    .select(RENTAL_SELECT)
    .eq("dealership_id", dealershipId)
    .order("created_at", { ascending: false });
}

export function createRental(
  supabase: SupabaseClientLike,
  rental: TablesInsert<"rentals">,
) {
  return supabase.from("rentals").insert(rental).select().single();
}

export function vehiclePhotoPath(vehicleId: string, fileName: string) {
  return `${vehicleId}/${sanitizeStorageFileName(fileName)}`;
}

export function applicationDocumentPath(applicationId: string, fileName: string) {
  return `${applicationId}/${sanitizeStorageFileName(fileName)}`;
}

export function uploadVehiclePhoto(
  supabase: SupabaseClientLike,
  vehicleId: string,
  fileName: string,
  file: File | Blob,
) {
  return supabase
    .storage
    .from("vehicle-photos")
    .upload(vehiclePhotoPath(vehicleId, fileName), file);
}

export function uploadApplicationDocument(
  supabase: SupabaseClientLike,
  applicationId: string,
  fileName: string,
  file: File | Blob,
) {
  return supabase
    .storage
    .from("application-documents")
    .upload(applicationDocumentPath(applicationId, fileName), file);
}

function applyVehicleFilters(query: any, filters: VehicleFilters) {
  let next = query;

  if (filters.city) {
    next = next.eq("city", filters.city);
  }

  if (filters.state) {
    next = next.eq("state", filters.state);
  }

  if (filters.make) {
    next = next.eq("make", filters.make);
  }

  if (filters.model) {
    next = next.eq("model", filters.model);
  }

  if (filters.vehicleType) {
    next = next.eq("vehicle_type", filters.vehicleType);
  }

  if (filters.rideshareAllowed !== undefined) {
    next = next.eq("rideshare_allowed", filters.rideshareAllowed);
  }

  return next;
}

function applyApplicationFilters(query: any, filters: ApplicationFilters) {
  let next = query;

  if (filters.status) {
    next = next.eq("status", filters.status);
  }

  if (filters.limit) {
    next = next.limit(filters.limit);
  }

  return next;
}

function sanitizeStorageFileName(fileName: string) {
  const sanitized = fileName
    .trim()
    .replace(/[/\\]+/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized || "file";
}

import type { Tables } from "@/lib/supabase/database.types";

export type Dealership = Tables<"dealerships">;
export type VehiclePhoto = Tables<"vehicle_photos"> & {
  signed_url?: string | null;
};

export type PublicVehicle = Tables<"vehicles"> & {
  dealerships: Pick<
    Dealership,
    "id" | "name" | "address" | "city" | "state" | "zip" | "phone" | "website" | "approved" | "suspended"
  >;
  vehicle_photos: VehiclePhoto[];
};

export type DealerVehicle = Tables<"vehicles"> & {
  vehicle_photos: VehiclePhoto[];
};

export type ApplicationDocument = Tables<"application_documents"> & {
  signed_url?: string | null;
};

export type ApplicationWithRelations = Tables<"rental_applications"> & {
  vehicles: Pick<
    Tables<"vehicles">,
    "id" | "vin" | "year" | "make" | "model" | "trim" | "monthly_price" | "deposit" | "city" | "state"
  > | null;
  dealerships: Pick<Tables<"dealerships">, "id" | "name" | "phone"> | null;
  profiles?: Pick<Tables<"profiles">, "id" | "email" | "full_name" | "phone"> | null;
  application_documents: ApplicationDocument[];
};

export type RentalWithRelations = Tables<"rentals"> & {
  vehicles: Pick<Tables<"vehicles">, "id" | "vin" | "year" | "make" | "model" | "trim" | "city" | "state"> | null;
  dealerships: Pick<Tables<"dealerships">, "id" | "name" | "phone"> | null;
  profiles?: Pick<Tables<"profiles">, "id" | "email" | "full_name" | "phone"> | null;
};

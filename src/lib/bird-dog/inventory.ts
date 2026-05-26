import { formatCurrency } from "@/lib/bird-dog/format";
import type { Dealership, VehiclePhoto } from "@/lib/bird-dog/types";
import type { Enums } from "@/lib/supabase/database.types";

export type InventoryVehicle = {
  id: string;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  trim?: string | null;
  monthly_price?: number | string | null;
  mileage_limit?: number | null;
  city?: string | null;
  state?: string | null;
  status?: Enums<"vehicle_status"> | string | null;
  vin?: string | null;
  dealerships?: Partial<Dealership> | null;
  vehicle_photos?: Array<Partial<VehiclePhoto> & { photo_url?: string | null; signed_url?: string | null }> | null;
};

export type InventoryFilterState = {
  searchTerm: string;
  selectedMake: string;
  selectedPriceRange: string;
  selectedLocation: string;
  selectedStatus: string;
};

export const VEHICLE_STATUS_OPTIONS: Array<Enums<"vehicle_status">> = [
  "available",
  "pending",
  "rented",
  "unavailable",
];

export const INVENTORY_PRICE_RANGES = [
  { label: "Any price", value: "all" },
  { label: "Under $750", value: "under-750" },
  { label: "$750 - $1,000", value: "750-1000" },
  { label: "$1,000 - $1,500", value: "1000-1500" },
  { label: "$1,500+", value: "1500-plus" },
];

export function getInventoryFilterState(
  params: Record<string, string | undefined>,
): InventoryFilterState {
  return {
    searchTerm: normalizeParam(params.q) ?? normalizeParam(params.searchTerm) ?? "",
    selectedMake: normalizeParam(params.make) ?? "all",
    selectedPriceRange: normalizeParam(params.price_range) ?? "all",
    selectedLocation: normalizeParam(params.location) ?? "all",
    selectedStatus: normalizeParam(params.status) ?? "all",
  };
}

export function filterInventoryVehicles<T extends InventoryVehicle>(
  vehicles: T[],
  filters: InventoryFilterState,
) {
  return vehicles.filter((vehicle) => {
    if (filters.searchTerm && !matchesSearch(vehicle, filters.searchTerm)) {
      return false;
    }

    if (filters.selectedMake !== "all" && !matchesText(vehicle.make, filters.selectedMake)) {
      return false;
    }

    if (
      filters.selectedPriceRange !== "all" &&
      !matchesPriceRange(vehicle.monthly_price, filters.selectedPriceRange)
    ) {
      return false;
    }

    if (filters.selectedLocation !== "all" && !matchesVehicleLocation(vehicle, filters.selectedLocation)) {
      return false;
    }

    if (filters.selectedStatus !== "all" && !matchesText(vehicle.status, filters.selectedStatus)) {
      return false;
    }

    return true;
  });
}

export function hasActiveInventoryFilters(filters: InventoryFilterState) {
  return Boolean(
    filters.searchTerm ||
      filters.selectedMake !== "all" ||
      filters.selectedPriceRange !== "all" ||
      filters.selectedLocation !== "all" ||
      filters.selectedStatus !== "all",
  );
}

export function getInventoryMakeOptions(vehicles: InventoryVehicle[]) {
  return uniqueOptions(vehicles.map((vehicle) => vehicle.make));
}

export function getInventoryLocationOptions(vehicles: InventoryVehicle[]) {
  return uniqueOptions(
    vehicles.flatMap((vehicle) => [
      getVehicleLocation(vehicle, ""),
      getDealershipLocation(vehicle, ""),
    ]),
  );
}

export function getVehicleImageUrl(vehicle: InventoryVehicle) {
  return vehicle.vehicle_photos?.find((photo) => photo.signed_url || photo.photo_url)?.signed_url ??
    vehicle.vehicle_photos?.find((photo) => photo.signed_url || photo.photo_url)?.photo_url ??
    null;
}

export function getVehicleTitle(vehicle: InventoryVehicle) {
  const title = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
    .map((value) => (typeof value === "string" ? value.trim() : value))
    .filter(Boolean)
    .join(" ");

  return title || "Vehicle details available soon";
}

export function getVehicleMonthlyPrice(vehicle: InventoryVehicle) {
  return formatCurrency(vehicle.monthly_price);
}

export function getVehicleMileage(vehicle: InventoryVehicle) {
  return vehicle.mileage_limit ? `${vehicle.mileage_limit.toLocaleString()}/mo` : "Ask dealer";
}

export function getVehicleDealership(vehicle: InventoryVehicle) {
  return cleanText(vehicle.dealerships?.name) || "Participating dealership";
}

export function getVehicleLocation(vehicle: InventoryVehicle, fallback = "Location available soon") {
  return joinLocation(vehicle.city, vehicle.state) || getDealershipLocation(vehicle, fallback);
}

export function getDealershipLocation(vehicle: InventoryVehicle, fallback = "Location available soon") {
  return joinLocation(vehicle.dealerships?.city, vehicle.dealerships?.state) || fallback;
}

export function getVehicleStatus(vehicle: InventoryVehicle) {
  return cleanText(vehicle.status) || "available";
}

export function formatInventoryStatus(status: string) {
  return status.replaceAll("_", " ");
}

function matchesSearch(vehicle: InventoryVehicle, searchTerm: string) {
  const normalizedSearch = searchTerm.toLowerCase();

  return [
    getVehicleTitle(vehicle),
    vehicle.make,
    vehicle.model,
    vehicle.year?.toString(),
    vehicle.vin,
    getVehicleDealership(vehicle),
    getVehicleLocation(vehicle, ""),
    getDealershipLocation(vehicle, ""),
    vehicle.status,
  ]
    .map((value) => cleanText(value))
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(normalizedSearch));
}

function matchesVehicleLocation(vehicle: InventoryVehicle, selectedLocation: string) {
  return [getVehicleLocation(vehicle, ""), getDealershipLocation(vehicle, "")]
    .filter(Boolean)
    .some((location) => matchesText(location, selectedLocation));
}

function matchesText(value: string | number | null | undefined, expected: string) {
  return cleanText(value).toLowerCase() === expected.toLowerCase();
}

function matchesPriceRange(value: number | string | null | undefined, range: string) {
  const price = Number(value ?? 0);

  if (!Number.isFinite(price)) {
    return false;
  }

  if (range === "under-750") return price < 750;
  if (range === "750-1000") return price >= 750 && price <= 1000;
  if (range === "1000-1500") return price > 1000 && price <= 1500;
  if (range === "1500-plus") return price > 1500;

  return true;
}

function uniqueOptions(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map(cleanText).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

function normalizeParam(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function cleanText(value: string | number | null | undefined) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function joinLocation(city: string | null | undefined, state: string | null | undefined) {
  return [city, state].map(cleanText).filter(Boolean).join(", ");
}

import { type DealerVehicle } from "@/types/app";

export const inventoryTypeLabels: Record<string, string> = {
  aged_inventory: "Aged inventory",
  punched_unit: "Punched unit",
  r_unit: "R unit",
  service_loaner: "Service loaner",
  extra_vehicle: "Extra vehicle",
};

export const primaryUseLabels: Record<string, string> = {
  rideshare: "Rideshare",
  personal: "Personal transportation",
  between_vehicles: "Between vehicles",
};

export const statusLabels: Record<string, string> = {
  submitted: "Submitted",
  reviewing: "Reviewing",
  approved: "Approved",
  declined: "Declined",
};

export function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Contact dealer";
  }

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export function formatLocation(vehicle: Pick<DealerVehicle, "city" | "state">) {
  return [vehicle.city, vehicle.state].filter(Boolean).join(", ") || "Location pending";
}

export function formatVehicleTitle(
  vehicle: Pick<DealerVehicle, "year" | "make" | "model">,
) {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}

export function getPrimaryPhoto(vehicle: Pick<DealerVehicle, "photo_urls">) {
  return vehicle.photo_urls.find((url) => /^https?:\/\//i.test(url));
}

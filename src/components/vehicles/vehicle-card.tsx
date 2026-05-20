import Link from "next/link";
import { type Route } from "next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type VehiclePhoto = {
  id: string;
  photo_url: string;
  sort_order: number | null;
};

export type VehicleDealership = {
  id: string;
  name: string;
  city: string;
  state: string;
  phone: string | null;
  website: string | null;
  approved?: boolean;
  suspended?: boolean;
};

export type VehicleListing = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  vehicle_type: string | null;
  monthly_price: number;
  deposit: number;
  mileage_limit: number | null;
  city: string;
  state: string;
  rideshare_allowed: boolean;
  insurance_required: boolean;
  minimum_age: number;
  status?: string;
  description: string | null;
  dealerships?: VehicleDealership | VehicleDealership[] | null;
  vehicle_photos?: VehiclePhoto[] | null;
};

type VehicleCardProps = {
  vehicle: VehicleListing;
  actionLabel?: string;
  href?: Route;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export function VehicleCard({
  vehicle,
  actionLabel = "View details",
  href = `/inventory/${vehicle.id}` as Route,
}: VehicleCardProps) {
  const dealership = vehicleDealership(vehicle);
  const photo = primaryVehiclePhoto(vehicle);

  return (
    <Card className="overflow-hidden">
      <div
        className="flex h-44 items-end bg-secondary/70 bg-cover bg-center"
        style={photo ? { backgroundImage: `url(${photo.photo_url})` } : undefined}
      >
        {!photo ? (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
            Vehicle photos coming soon
          </div>
        ) : null}
      </div>
      <CardHeader>
        <CardTitle>{vehicleTitle(vehicle)}</CardTitle>
        <CardDescription>
          {dealership?.name ?? "Approved dealership"} in {vehicle.city}, {vehicle.state}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm text-muted-foreground">
        <div className="flex items-baseline justify-between rounded-2xl border border-border bg-background/40 p-3">
          <span>Monthly payment</span>
          <span className="text-lg font-semibold text-foreground">
            {formatCurrency(vehicle.monthly_price)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Pill label="Deposit" value={formatCurrency(vehicle.deposit)} />
          <Pill label="Minimum age" value={`${vehicle.minimum_age}+`} />
          <Pill
            label="Mileage"
            value={vehicle.mileage_limit ? `${vehicle.mileage_limit}/mo` : "Flexible"}
          />
          <Pill label="Rideshare" value={vehicle.rideshare_allowed ? "Allowed" : "Ask dealer"} />
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={href}>{actionLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function vehicleTitle(vehicle: Pick<VehicleListing, "year" | "make" | "model" | "trim">) {
  return [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(" ");
}

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function vehicleDealership(vehicle: Pick<VehicleListing, "dealerships">) {
  const { dealerships } = vehicle;

  return Array.isArray(dealerships) ? dealerships[0] : dealerships;
}

function primaryVehiclePhoto(vehicle: Pick<VehicleListing, "vehicle_photos">) {
  return vehicle.vehicle_photos
    ?.slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/30 p-3">
      <p className="text-xs uppercase tracking-[0.2em]">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}

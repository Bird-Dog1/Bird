import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/bird-dog/format";
import type { PublicVehicle } from "@/lib/bird-dog/types";

export function VehicleCard({ vehicle }: { vehicle: PublicVehicle }) {
  const photo = vehicle.vehicle_photos?.[0]?.signed_url;
  const title = formatVehicleTitle(vehicle);
  const location = formatLocation(vehicle);
  const dealership = vehicle.dealerships?.name?.trim() || "Participating dealership";
  const mileage = vehicle.mileage_limit ? `${vehicle.mileage_limit.toLocaleString()}/mo` : "Ask dealer";

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-black/50">
      <Link href={`/vehicles/${vehicle.id}` as Route}>
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
          {photo ? (
            <Image
              alt={title}
              className="object-cover transition duration-500 group-hover:scale-105"
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              src={photo}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-white/[0.08] to-transparent text-sm text-muted-foreground">
              Photos coming soon
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/70 to-transparent" />
        </div>
      </Link>
      <CardContent className="flex flex-1 flex-col space-y-5 p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="line-clamp-1 text-xl font-semibold tracking-[-0.03em]">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {dealership} · {location}
              </p>
            </div>
            <StatusBadge value={vehicle.status ?? "available"} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-muted-foreground">Monthly</p>
            <p className="mt-1 font-semibold text-primary">{formatCurrency(vehicle.monthly_price)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-muted-foreground">Mileage</p>
            <p className="mt-1 font-semibold">{mileage}</p>
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          Approval is not guaranteed. Valid license and active insurance required.
        </p>
        <div className="mt-auto grid gap-3 sm:grid-cols-2">
          <Button asChild variant="outline">
            <Link href={`/vehicles/${vehicle.id}` as Route}>View Details</Link>
          </Button>
          <Button asChild>
            <Link href={`/vehicles/${vehicle.id}/apply` as Route}>Apply</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function formatVehicleTitle(vehicle: PublicVehicle) {
  const title = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
    .filter(Boolean)
    .join(" ");

  return title || "Vehicle details available soon";
}

function formatLocation(vehicle: PublicVehicle) {
  const location = [vehicle.city, vehicle.state].filter(Boolean).join(", ");
  const dealershipLocation = [vehicle.dealerships?.city, vehicle.dealerships?.state]
    .filter(Boolean)
    .join(", ");

  return location || dealershipLocation || "Location available soon";
}

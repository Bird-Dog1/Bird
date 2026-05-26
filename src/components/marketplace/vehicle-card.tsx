import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getVehicleDealership,
  getVehicleImageUrl,
  getVehicleLocation,
  getVehicleMileage,
  getVehicleMonthlyPrice,
  getVehicleStatus,
  getVehicleTitle,
  type InventoryVehicle,
} from "@/lib/bird-dog/inventory";

export type VehicleCardProps = {
  vehicle: InventoryVehicle;
  detailsHref?: Route;
  detailsLabel?: string;
  applyHref?: Route;
  applyLabel?: string;
};

export function VehicleCard({
  vehicle,
  detailsHref = `/vehicles/${vehicle.id}` as Route,
  detailsLabel = "View Details",
  applyHref = `/vehicles/${vehicle.id}/apply` as Route,
  applyLabel = "Apply",
}: VehicleCardProps) {
  const photo = getVehicleImageUrl(vehicle);
  const title = getVehicleTitle(vehicle);
  const location = getVehicleLocation(vehicle);
  const dealership = getVehicleDealership(vehicle);
  const mileage = getVehicleMileage(vehicle);
  const monthlyPrice = getVehicleMonthlyPrice(vehicle);
  const status = getVehicleStatus(vehicle);

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-black/50">
      <Link href={detailsHref}>
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
            <StatusBadge value={status} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-muted-foreground">Monthly</p>
            <p className="mt-1 font-semibold text-primary">{monthlyPrice}</p>
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
            <Link href={detailsHref}>{detailsLabel}</Link>
          </Button>
          <Button asChild>
            <Link href={applyHref}>{applyLabel}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

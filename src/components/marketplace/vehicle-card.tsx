import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, vehicleTitle } from "@/lib/bird-dog/format";
import type { PublicVehicle } from "@/lib/bird-dog/types";

export function VehicleCard({ vehicle }: { vehicle: PublicVehicle }) {
  const photo = vehicle.vehicle_photos?.[0]?.signed_url;

  return (
    <Link className="block h-full" href={`/vehicles/${vehicle.id}` as Route}>
      <Card className="h-full overflow-hidden transition hover:border-primary/70">
        <div className="relative aspect-[16/10] bg-secondary">
          {photo ? (
            <Image
              alt={vehicleTitle(vehicle)}
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              src={photo}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Photos coming soon
            </div>
          )}
        </div>
        <CardContent className="space-y-4 p-5">
          <div>
            <h2 className="line-clamp-1 text-xl font-semibold">{vehicleTitle(vehicle)}</h2>
            <p className="text-sm text-muted-foreground">
              {vehicle.city}, {vehicle.state} · {vehicle.dealerships.name}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Monthly</p>
              <p className="font-semibold text-primary">{formatCurrency(vehicle.monthly_price)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Deposit</p>
              <p className="font-semibold">{formatCurrency(vehicle.deposit)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Approval is not guaranteed. Valid license and active insurance required.
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

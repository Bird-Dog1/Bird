import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, vehicleTitle } from "@/lib/bird-dog/format";
import type { PublicVehicle } from "@/lib/bird-dog/types";

export function VehicleCard({ vehicle }: { vehicle: PublicVehicle }) {
  const photo = vehicle.vehicle_photos?.[0]?.signed_url;

  return (
    <Link className="group block h-full" href={`/vehicles/${vehicle.id}` as Route}>
      <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-black/50">
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
          {photo ? (
            <Image
              alt={vehicleTitle(vehicle)}
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
        <CardContent className="space-y-5 p-5">
          <div>
            <h2 className="line-clamp-1 text-xl font-semibold tracking-[-0.03em]">{vehicleTitle(vehicle)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {vehicle.city}, {vehicle.state} · {vehicle.dealerships.name}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-muted-foreground">Monthly</p>
              <p className="mt-1 font-semibold text-primary">{formatCurrency(vehicle.monthly_price)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-muted-foreground">Deposit</p>
              <p className="mt-1 font-semibold">{formatCurrency(vehicle.deposit)}</p>
            </div>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            Approval is not guaranteed. Valid license and active insurance required.
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

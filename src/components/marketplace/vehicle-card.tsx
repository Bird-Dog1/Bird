import Link from "next/link";
import { type ReactNode } from "react";
import { ArrowRight, Gauge, MapPin, ShieldCheck } from "lucide-react";

import { VehiclePhoto } from "@/components/marketplace/vehicle-photo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatLocation,
  formatMoney,
  formatVehicleTitle,
  inventoryTypeLabels,
} from "@/lib/marketplace/format";
import { type DealerVehicle } from "@/types/app";

type VehicleCardProps = {
  vehicle: DealerVehicle;
};

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Card className="overflow-hidden">
      <VehiclePhoto className="min-h-52 rounded-none" vehicle={vehicle} />
      <CardContent className="space-y-5 p-5">
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {formatLocation(vehicle)}
          </p>
          <h2 className="text-2xl font-semibold">{formatVehicleTitle(vehicle)}</h2>
          <p className="text-sm text-muted-foreground">
            {vehicle.vehicle_type ?? inventoryTypeLabels[vehicle.inventory_type] ?? "Vehicle"}
          </p>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <VehicleStat label="Monthly" value={formatMoney(vehicle.monthly_price)} />
          <VehicleStat label="Deposit" value={formatMoney(vehicle.deposit_amount)} />
          <VehicleStat
            icon={<Gauge className="h-4 w-4" />}
            label="Mileage"
            value={vehicle.mileage_limit ? `${vehicle.mileage_limit.toLocaleString()} mi/mo` : "Ask dealer"}
          />
          <VehicleStat
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Insurance"
            value={vehicle.insurance_required ? "Required" : "Ask dealer"}
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href={`/vehicles/${vehicle.id}`}>
              View details <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild className="flex-1" variant="outline">
            <Link href={`/apply?vehicle=${vehicle.id}`}>Apply</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VehicleStat({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/30 p-3">
      <p className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

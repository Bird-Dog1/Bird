import { VehicleCard, type VehicleCardProps } from "@/components/marketplace/vehicle-card";
import type { InventoryVehicle } from "@/lib/bird-dog/inventory";
import { cn } from "@/lib/utils";

type VehicleGridProps<T extends InventoryVehicle> = {
  vehicles: T[];
  className?: string;
  getVehicleCardProps?: (vehicle: T) => Omit<VehicleCardProps, "vehicle">;
};

export function VehicleGrid<T extends InventoryVehicle>({
  vehicles,
  className,
  getVehicleCardProps,
}: VehicleGridProps<T>) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          {...getVehicleCardProps?.(vehicle)}
        />
      ))}
    </div>
  );
}

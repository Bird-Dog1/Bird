import { Car } from "lucide-react";

import { getPrimaryPhoto } from "@/lib/marketplace/format";
import { cn } from "@/lib/utils";
import { type DealerVehicle } from "@/types/app";

type VehiclePhotoProps = {
  vehicle: Pick<DealerVehicle, "make" | "model" | "photo_urls">;
  className?: string;
};

export function VehiclePhoto({ vehicle, className }: VehiclePhotoProps) {
  const photoUrl = getPrimaryPhoto(vehicle);

  if (!photoUrl) {
    return (
      <div
        className={cn(
          "flex min-h-56 items-center justify-center rounded-3xl border border-dashed border-border bg-secondary/40 text-muted-foreground",
          className,
        )}
      >
        <div className="text-center">
          <Car className="mx-auto mb-3 h-10 w-10" />
          <p className="text-sm font-medium">Photos not uploaded yet</p>
        </div>
      </div>
    );
  }

  return (
    <div
      aria-label={`${vehicle.make} ${vehicle.model} vehicle photo`}
      className={cn("min-h-56 rounded-3xl bg-cover bg-center", className)}
      role="img"
      style={{ backgroundImage: `url(${photoUrl})` }}
    />
  );
}

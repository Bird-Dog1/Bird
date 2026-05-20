import Link from "next/link";
import { type ReactNode } from "react";
import { ArrowLeft, BadgeDollarSign, Calendar, Gauge, MapPin, ShieldCheck, UserRound } from "lucide-react";

import { VehiclePhoto } from "@/components/marketplace/vehicle-photo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatLocation,
  formatMoney,
  formatVehicleTitle,
  getPrimaryPhoto,
} from "@/lib/marketplace/format";
import { getAvailableVehicleById } from "@/lib/marketplace/queries";
import { type DealerVehicle } from "@/types/app";

type VehicleDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vehicle details",
};

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const { id } = await params;
  const { vehicle, error } = await getAvailableVehicleById(id);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="space-y-4 p-8">
            <h1 className="text-2xl font-semibold">Vehicle unavailable</h1>
            <p className="text-sm text-destructive-foreground">
              We could not load this vehicle: {error}
            </p>
            <Button asChild variant="outline">
              <Link href="/vehicles">Back to vehicles</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!vehicle) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="space-y-4 p-8">
            <h1 className="text-2xl font-semibold">Vehicle not found</h1>
            <p className="text-sm text-muted-foreground">
              This vehicle may be rented, inactive, or no longer listed.
            </p>
            <Button asChild>
              <Link href="/vehicles">Browse available vehicles</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Button asChild className="mb-6" variant="ghost">
        <Link href="/vehicles">
          <ArrowLeft className="h-4 w-4" />
          Back to vehicles
        </Link>
      </Button>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <VehicleGallery vehicle={vehicle} />
        <div className="space-y-6">
          <div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {formatLocation(vehicle)}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              {formatVehicleTitle(vehicle)}
            </h1>
            <p className="mt-3 text-muted-foreground">
              {vehicle.description ??
                "Review the monthly rental terms and submit an application to the dealership."}
            </p>
          </div>

          <Card>
            <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
              <DetailStat icon={<BadgeDollarSign className="h-4 w-4" />} label="Monthly price" value={formatMoney(vehicle.monthly_price)} />
              <DetailStat icon={<BadgeDollarSign className="h-4 w-4" />} label="Deposit" value={formatMoney(vehicle.deposit_amount)} />
              <DetailStat
                icon={<Gauge className="h-4 w-4" />}
                label="Mileage limit"
                value={vehicle.mileage_limit ? `${vehicle.mileage_limit.toLocaleString()} miles/month` : "Ask dealer"}
              />
              <DetailStat
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Insurance"
                value={vehicle.insurance_required ? "Active insurance required" : "Ask dealer"}
              />
              <DetailStat
                icon={<UserRound className="h-4 w-4" />}
                label="Minimum age"
                value={`${vehicle.minimum_age}+`}
              />
              <DetailStat
                icon={<Calendar className="h-4 w-4" />}
                label="Rideshare"
                value={vehicle.rideshare_allowed ? "Allowed" : "Not listed"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dealership info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="text-base font-semibold text-foreground">
                {vehicle.dealership_name ?? "Dealership name pending"}
              </p>
              <p>{formatLocation(vehicle)}</p>
              {vehicle.dealership_phone ? <p>{vehicle.dealership_phone}</p> : null}
              {vehicle.dealership_email ? <p>{vehicle.dealership_email}</p> : null}
            </CardContent>
          </Card>

          <div className="rounded-3xl border border-border bg-card/70 p-5 text-sm leading-6 text-muted-foreground">
            Approval is not guaranteed. Valid license and active insurance
            required. Final approval, contract, and payment are handled by the
            dealership.
          </div>

          <Button asChild className="w-full" size="lg">
            <Link href={`/apply?vehicle=${vehicle.id}`}>Apply for this rental</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function VehicleGallery({ vehicle }: { vehicle: DealerVehicle }) {
  const primaryPhoto = getPrimaryPhoto(vehicle);
  const secondaryPhotos = vehicle.photo_urls
    .filter((url) => /^https?:\/\//i.test(url))
    .filter((url) => url !== primaryPhoto)
    .slice(0, 4);

  return (
    <div className="space-y-4">
      <VehiclePhoto className="min-h-[26rem]" vehicle={vehicle} />
      {secondaryPhotos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {secondaryPhotos.map((photoUrl) => (
            <div
              aria-label={`${vehicle.make} ${vehicle.model} additional photo`}
              className="min-h-44 rounded-3xl bg-cover bg-center"
              key={photoUrl}
              role="img"
              style={{ backgroundImage: `url(${photoUrl})` }}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
          Additional photos have not been uploaded by the dealership.
        </p>
      )}
    </div>
  );
}

function DetailStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/30 p-4">
      <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

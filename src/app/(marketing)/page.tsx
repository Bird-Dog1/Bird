import Link from "next/link";
import { ArrowRight, Car, ClipboardCheck, FileCheck2, ShieldCheck } from "lucide-react";

import { VehicleCard } from "@/components/marketplace/vehicle-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAvailableVehicles } from "@/lib/marketplace/queries";

const assurances = [
  "Approval is not guaranteed.",
  "Valid license and active insurance required.",
  "Final approval, contract, and payment are handled by the dealership.",
];

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Monthly dealership rentals",
};

export default async function LandingPage() {
  const { vehicles, error } = await getAvailableVehicles({});
  const featuredVehicles = vehicles.slice(0, 3);

  return (
    <main className="overflow-hidden">
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-muted-foreground">
            Public marketplace for dealership vehicles
          </div>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl">
              Monthly dealership rentals without traditional financing.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Browse available vehicles, compare monthly terms, and submit a
              customer rental application backed by the real Bird Dog Supabase
              backend.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/vehicles">
                Browse vehicles <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/signup">Create customer account</Link>
            </Button>
          </div>
          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            {assurances.map((item) => (
              <li className="rounded-2xl border border-border bg-card/50 p-4" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Card className="self-start">
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Car, label: "Browse" },
                { icon: ClipboardCheck, label: "Apply" },
                { icon: FileCheck2, label: "Track" },
              ].map(({ icon: Icon, label }) => (
                <div
                  className="rounded-2xl border border-border bg-background/40 p-4"
                  key={label}
                >
                  <Icon className="mb-4 h-6 w-6 text-primary" />
                  <p className="font-semibold">{label}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-background/40 p-5">
              <ShieldCheck className="mb-3 h-6 w-6 text-accent" />
              <p className="font-semibold">Customer requirements</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Valid license and active insurance required. Approval is not
                guaranteed.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Available now
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Featured marketplace vehicles
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/vehicles">View all vehicles</Link>
          </Button>
        </div>
        {error ? (
          <Card>
            <CardContent className="p-6 text-sm text-destructive-foreground">
              We could not load available vehicles: {error}
            </CardContent>
          </Card>
        ) : featuredVehicles.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {featuredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Car className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <h3 className="text-xl font-semibold">No vehicles available yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Check back when dealerships publish available monthly rentals.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}

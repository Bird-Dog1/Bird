import Link from "next/link";
import { ArrowRight, Car, ClipboardCheck, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const customerSegments = [
  "Denied traditional auto loans",
  "Uber and Lyft drivers",
  "Monthly transportation needs",
  "Between vehicles",
];

const dealerInventory = [
  "Aged inventory",
  "Punched units",
  "R units",
  "Service loaners",
  "Extra vehicles",
];

export default function LandingPage() {
  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-muted-foreground">
            Monthly vehicle access for customers and dealerships
          </div>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl">
              Rent dealership vehicles monthly instead of financing.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Bird Dog connects qualified customers with dealership vehicles
              that are ready for productive monthly use.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">
                Apply or list inventory <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
        <Card className="self-start">
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: ClipboardCheck, label: "Apply" },
                { icon: Car, label: "Match" },
                { icon: ShieldCheck, label: "Manage" },
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
            <div className="grid gap-6 md:grid-cols-2">
              <AudienceList items={customerSegments} title="Customers" />
              <AudienceList items={dealerInventory} title="Dealerships" />
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function AudienceList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
        {title}
      </h2>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

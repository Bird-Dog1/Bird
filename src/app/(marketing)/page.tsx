import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Car,
  ClipboardCheck,
  Gauge,
  Handshake,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const trustSignals = [
  "Participating dealerships",
  "Subject to approval",
  "Dealer-managed terms",
  "Eligible purchase opportunities",
];

const processSteps = [
  {
    icon: Car,
    title: "Browse participating inventory",
    description:
      "Explore monthly vehicle programs from dealerships that manage their own terms, pricing, and availability.",
  },
  {
    icon: ClipboardCheck,
    title: "Apply with clear expectations",
    description:
      "Submit an application for dealer review with legal-safe guidance around approval, insurance, and program fit.",
  },
  {
    icon: Handshake,
    title: "Work directly with the dealer",
    description:
      "Qualified customers can review dealer-managed rental terms and eligible purchase opportunities when available.",
  },
];

const renterBenefits = [
  "Flexible monthly access without implying guaranteed approval",
  "Clear program language for insurance, documentation, and dealership review",
  "Marketplace discovery for customers comparing participating dealership options",
];

const dealerBenefits = [
  "A premium digital storefront for monthly vehicle programs",
  "Structured application intake for dealership-managed decisions",
  "Position aging, specialty, or program-ready inventory with polished presentation",
];

const featuredVehicles = [
  {
    icon: Car,
    name: "Executive sedan",
    detail: "Premium daily access",
    price: "From dealer terms",
  },
  {
    icon: Gauge,
    name: "Adventure SUV",
    detail: "Monthly flexibility",
    price: "Subject to approval",
  },
  {
    icon: ShieldCheck,
    name: "Rideshare-ready vehicle",
    detail: "Program availability varies",
    price: "Dealer-managed",
  },
];

export default function LandingPage() {
  return (
    <main className="overflow-hidden">
      <section className="mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.06fr_0.94fr] lg:px-8 lg:py-28">
        <div className="space-y-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-muted-foreground shadow-xl shadow-black/20 backdrop-blur">
            <Sparkles className="h-4 w-4 text-primary" />
            Premium dealership-managed mobility programs
          </div>
          <div className="space-y-6">
            <h1 className="max-w-5xl text-6xl font-semibold tracking-[-0.075em] text-white sm:text-7xl lg:text-8xl">
              Monthly vehicle access, built smarter.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Bird Dog helps participating dealerships offer flexible monthly vehicle programs with dealership-managed purchase pathways for qualified customers.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/vehicles">Browse Inventory <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/signup">Partner With Bird Dog</Link>
            </Button>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Programs are subject to dealership approval, eligible inventory, insurance requirements, and dealer-managed terms.
          </p>
        </div>

        <Card className="relative self-start overflow-hidden border-white/15 bg-card/90">
          <div className="absolute inset-x-8 top-0 h-px bg-white/35" />
          <CardContent className="space-y-8 p-6 sm:p-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                Platform preview
              </p>
              <h2 className="text-3xl font-semibold tracking-[-0.05em] text-white">
                A refined marketplace layer for modern dealership programs.
              </h2>
            </div>
            <div className="grid gap-3">
              {processSteps.map(({ icon: Icon, title, description }) => (
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-black/20" key={title}>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {trustSignals.map((signal) => (
            <div className="flex items-center gap-3 text-sm text-muted-foreground" key={signal}>
              <BadgeCheck className="h-4 w-4 text-primary" />
              <span>{signal}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How Bird Dog works"
          title="A cleaner way to present monthly vehicle programs."
          description="Bird Dog creates a polished digital path from inventory discovery to dealership-managed review without changing who controls approval, terms, or customer relationships."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {processSteps.map(({ icon: Icon, title, description }) => (
            <FeatureCard description={description} icon={Icon} key={title} title={title} />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <BenefitPanel
          eyebrow="For renters"
          icon={Gauge}
          items={renterBenefits}
          title="Flexible access with clear program expectations."
        />
        <BenefitPanel
          eyebrow="For dealerships"
          icon={Building2}
          items={dealerBenefits}
          title="A premium channel for inventory and customer intake."
        />
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 pb-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured program styles"
          title="Marketplace presentation built for premium inventory."
          description="These visual categories show how participating dealership inventory can be framed. Availability, pricing, and purchase opportunities remain dealer-managed."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {featuredVehicles.map((vehicle) => {
            const Icon = vehicle.icon;

            return (
              <Card className="overflow-hidden transition hover:-translate-y-1 hover:border-white/20" key={vehicle.name}>
                <div className="flex aspect-[16/10] items-center justify-center border-b border-white/10 bg-white/[0.04] p-5">
                  <div className="grid h-24 w-24 place-items-center rounded-full border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/20">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <CardContent className="space-y-4 p-5">
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.035em] text-white">{vehicle.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{vehicle.detail}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm">
                    <span className="text-muted-foreground">Program note</span>
                    <span className="font-semibold text-primary">{vehicle.price}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-white/15">
          <CardContent className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                Start with Bird Dog
              </p>
              <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl">
                Bring dealership-managed monthly programs into a premium digital experience.
              </h2>
              <p className="max-w-2xl leading-7 text-muted-foreground">
                Browse participating inventory or create an account to explore how Bird Dog supports eligible monthly vehicle opportunities.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild size="lg">
                <Link href="/vehicles">Browse Inventory</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/signup">Partner With Bird Dog</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/login">Dealer Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">{eyebrow}</p>
      <h2 className="text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl">{title}</h2>
      <p className="text-lg leading-8 text-muted-foreground">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Car;
  title: string;
  description: string;
}) {
  return (
    <Card className="transition hover:-translate-y-1 hover:border-white/20">
      <CardContent className="space-y-5 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold tracking-[-0.035em] text-white">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BenefitPanel({
  eyebrow,
  icon: Icon,
  title,
  items,
}: {
  eyebrow: string;
  icon: typeof Car;
  title: string;
  items: string[];
}) {
  return (
    <Card className="border-white/15">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">{eyebrow}</p>
          <h2 className="text-3xl font-semibold tracking-[-0.05em] text-white">{title}</h2>
        </div>
        <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
          {items.map((item) => (
            <li className="flex gap-3" key={item}>
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
      </ul>
      </CardContent>
    </Card>
  );
}

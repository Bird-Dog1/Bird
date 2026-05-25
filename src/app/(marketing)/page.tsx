import Link from "next/link";
import type React from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CarFront,
  Check,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Gauge,
  Handshake,
  KeyRound,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const trustSignals = [
  "Participating dealerships",
  "Subject to approval",
  "Dealer-managed terms",
  "Eligible purchase opportunities",
];

const steps = [
  {
    icon: Search,
    eyebrow: "01",
    title: "Browse participating inventory.",
    description:
      "Explore monthly vehicle access options presented by dealerships ready to review qualified customers.",
  },
  {
    icon: ClipboardCheck,
    eyebrow: "02",
    title: "Apply with confidence.",
    description:
      "Submit your information online so the dealership can evaluate eligibility and program terms.",
  },
  {
    icon: Handshake,
    eyebrow: "03",
    title: "Finalize with the dealer.",
    description:
      "Approved customers complete dealership-managed agreements, payments, and eligible purchase pathways.",
  },
];

const renterBenefits = [
  "Flexible monthly access without a traditional long-term auto loan",
  "Dealership-reviewed applications with clear next steps",
  "Program terms designed around qualified customer eligibility",
  "Eligible purchase opportunities when offered by participating dealerships",
];

const dealerBenefits = [
  "Convert aged, loaner, or specialty inventory into monthly program demand",
  "Keep approval, contract, payment, and purchase terms dealer-managed",
  "Present a more polished marketplace experience to serious customers",
  "Build a flexible access channel without changing dealership operations",
];

const featuredVehicles = [
  {
    name: "2022 Porsche Macan",
    location: "Premium SUV program",
    price: "$1,240",
    deposit: "Dealer terms",
    tag: "Performance",
    gradient: "from-zinc-200 via-zinc-500 to-zinc-950",
  },
  {
    name: "2023 Rivian R1T",
    location: "Electric truck access",
    price: "$1,480",
    deposit: "Subject to approval",
    tag: "Electric",
    gradient: "from-stone-100 via-stone-500 to-black",
  },
  {
    name: "2021 BMW X5",
    location: "Executive utility",
    price: "$1,120",
    deposit: "Eligible pathway",
    tag: "Luxury",
    gradient: "from-slate-100 via-slate-500 to-slate-950",
  },
];

export default function LandingPage() {
  return (
    <main className="overflow-hidden bg-[#050505] text-white">
      <section className="relative isolate min-h-[calc(100vh-4rem)]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_28rem),radial-gradient(circle_at_80%_0%,rgba(148,163,184,0.16),transparent_30rem),linear-gradient(180deg,#050505_0%,#0c0c0d_48%,#050505_100%)]" />
        <div className="absolute left-1/2 top-24 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl motion-safe:animate-pulse" />

        <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.04fr_0.96fr] lg:px-8 lg:py-28">
          <div className="max-w-4xl space-y-9">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-zinc-300 shadow-2xl shadow-black/30 backdrop-blur">
              <Sparkles className="h-4 w-4 text-zinc-100" />
              Premium vehicle access platform
            </div>
            <div className="space-y-7">
              <h1 className="max-w-5xl text-6xl font-semibold tracking-[-0.075em] text-white sm:text-7xl lg:text-[6.7rem] lg:leading-[0.9]">
                Monthly vehicle access, built smarter.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-zinc-300 sm:text-xl sm:leading-9">
                Bird Dog helps participating dealerships offer flexible monthly
                vehicle programs with dealership-managed purchase pathways for
                qualified customers.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-14 rounded-full bg-white px-8 text-[15px] font-semibold text-black shadow-[0_18px_70px_rgba(255,255,255,0.2)] transition hover:-translate-y-0.5 hover:bg-zinc-200"
                size="lg"
              >
                <Link href="/vehicles">
                  Browse Inventory <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                className="h-14 rounded-full border-white/15 bg-white/[0.04] px-8 text-[15px] font-semibold text-white shadow-2xl shadow-black/30 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10"
                size="lg"
                variant="outline"
              >
                <Link href="/signup">Partner With Bird Dog</Link>
              </Button>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-zinc-500">
              Program availability, monthly terms, approvals, and eligible
              purchase opportunities are managed by participating dealerships
              and are subject to approval.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-white/15 via-transparent to-white/5 blur-3xl" />
            <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950/80 p-3 shadow-[0_32px_120px_rgba(0,0,0,0.7)] backdrop-blur">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_24rem),linear-gradient(145deg,#f4f4f5_0%,#71717a_32%,#09090b_76%)]">
                <div className="absolute inset-x-8 bottom-24 h-32 rounded-[100%] border border-white/25 bg-black/20 shadow-[0_60px_120px_rgba(0,0,0,0.75)] transition duration-700 group-hover:scale-105" />
                <div className="absolute bottom-32 left-1/2 h-24 w-[78%] -translate-x-1/2 rounded-t-[5rem] border border-white/25 bg-white/10 shadow-2xl backdrop-blur-md" />
                <div className="absolute bottom-28 left-1/2 h-16 w-[92%] -translate-x-1/2 rounded-[3rem] border border-white/20 bg-black/55 shadow-2xl" />
                <div className="absolute bottom-24 left-[18%] h-14 w-14 rounded-full border-8 border-zinc-900 bg-zinc-500 shadow-inner" />
                <div className="absolute bottom-24 right-[18%] h-14 w-14 rounded-full border-8 border-zinc-900 bg-zinc-500 shadow-inner" />
                <div className="absolute left-6 top-6 rounded-full border border-white/15 bg-black/25 px-4 py-2 text-xs uppercase tracking-[0.25em] text-zinc-200 backdrop-blur">
                  Dealer marketplace
                </div>
                <div className="absolute bottom-6 left-6 right-6 rounded-[1.5rem] border border-white/15 bg-black/35 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-zinc-400">
                        Monthly access
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">
                        Curated premium inventory
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
                      <CarFront className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {trustSignals.map((signal) => (
            <div
              className="flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-300"
              key={signal}
            >
              <Check className="h-4 w-4 text-zinc-100" />
              {signal}
            </div>
          ))}
        </div>
      </section>

      <Section
        eyebrow="How Bird Dog works"
        title="A cleaner path from monthly access to dealership-managed decisions."
        description="Bird Dog gives customers a serious marketplace experience while keeping approvals, agreements, and eligible purchase terms with participating dealerships."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {steps.map(({ description, eyebrow, icon: Icon, title }) => (
            <article
              className="group rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
              key={title}
            >
              <div className="mb-12 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30">
                  <Icon className="h-5 w-5 text-zinc-100" />
                </div>
                <span className="text-sm font-medium text-zinc-500">
                  {eyebrow}
                </span>
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-white">
                {title}
              </h3>
              <p className="mt-4 leading-7 text-zinc-400">{description}</p>
            </article>
          ))}
        </div>
      </Section>

      <section className="relative border-y border-white/10 bg-zinc-100 text-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.08),transparent_26rem)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-28">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-zinc-500">
              For qualified renters
            </p>
            <h2 className="text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Designed for flexibility without casual wording.
            </h2>
            <p className="text-lg leading-8 text-zinc-600">
              Customers get a refined way to discover monthly vehicle programs
              and connect with dealerships that control the final approval,
              agreement, and purchase pathway.
            </p>
          </div>
          <BenefitGrid items={renterBenefits} tone="light" />
        </div>
      </section>

      <Section
        eyebrow="For dealerships"
        title="A premium channel for inventory that deserves a better story."
        description="Bird Dog supports dealership-led programs without taking over financing decisions, customer funds, or dealer terms."
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <div className="rounded-[2.5rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))] p-8 shadow-2xl shadow-black/30">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="mt-12 max-w-sm text-3xl font-semibold tracking-[-0.04em]">
              Keep the dealership at the center of every decision.
            </h3>
            <p className="mt-5 leading-7 text-zinc-400">
              Bird Dog presents a polished digital front door. Dealerships
              continue to manage approvals, agreements, payments, and eligible
              purchase opportunities under their own terms.
            </p>
          </div>
          <BenefitGrid items={dealerBenefits} />
        </div>
      </Section>

      <Section
        eyebrow="Featured marketplace"
        title="Inventory cards built for confidence, not clutter."
        description="A premium presentation layer helps customers understand monthly pricing while reinforcing that approval and terms stay with participating dealerships."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {featuredVehicles.map((vehicle) => (
            <Link
              className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-white/20"
              href="/vehicles"
              key={vehicle.name}
            >
              <div
                className={`relative aspect-[16/11] bg-gradient-to-br ${vehicle.gradient}`}
              >
                <div className="absolute inset-x-8 bottom-10 h-14 rounded-full bg-black/45 blur-xl" />
                <div className="absolute bottom-12 left-1/2 h-16 w-[76%] -translate-x-1/2 rounded-t-[4rem] border border-white/30 bg-white/15 backdrop-blur-sm transition duration-500 group-hover:scale-105" />
                <div className="absolute bottom-9 left-1/2 h-10 w-[88%] -translate-x-1/2 rounded-full bg-black/70" />
                <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white backdrop-blur">
                  {vehicle.tag}
                </div>
              </div>
              <div className="space-y-5 p-6">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight">
                    {vehicle.name}
                  </h3>
                  <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                    <MapPin className="h-4 w-4" />
                    {vehicle.location}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-zinc-500">Monthly from</p>
                    <p className="mt-1 text-xl font-semibold">
                      {vehicle.price}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-zinc-500">Program note</p>
                    <p className="mt-1 font-semibold">{vehicle.deposit}</p>
                  </div>
                </div>
                <p className="text-xs leading-5 text-zinc-500">
                  Example marketplace presentation. Availability and terms are
                  managed by participating dealerships.
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.16),transparent_22rem),linear-gradient(135deg,#18181b,#050505)] p-8 shadow-[0_32px_120px_rgba(0,0,0,0.55)] sm:p-12 lg:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-zinc-400">
                Built for serious operators
              </p>
              <h2 className="text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
                Make monthly vehicle access feel as premium as the inventory.
              </h2>
              <p className="text-lg leading-8 text-zinc-400">
                Browse inventory as a customer or start the dealership partner
                path through the existing Bird Dog account flow.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button
                asChild
                className="h-14 rounded-full bg-white px-7 text-black hover:bg-zinc-200"
                size="lg"
              >
                <Link href="/vehicles">
                  Browse Inventory <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                className="h-14 rounded-full border-white/15 bg-white/[0.04] px-7 text-white hover:bg-white/10"
                size="lg"
                variant="outline"
              >
                <Link href="/signup">Partner With Bird Dog</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-10 text-sm text-zinc-500 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-white">Bird Dog</p>
            <p className="mt-1">
              Premium monthly vehicle access for participating dealerships.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Link className="transition hover:text-white" href="/vehicles">
              Inventory
            </Link>
            <Link className="transition hover:text-white" href="/login">
              Dealer sign in
            </Link>
            <Link className="transition hover:text-white" href="/signup">
              Partner
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Section({
  children,
  description,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="max-w-4xl space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-zinc-500">
            {eyebrow}
          </p>
          <h2 className="text-4xl font-semibold tracking-[-0.055em] text-white sm:text-6xl">
            {title}
          </h2>
          <p className="max-w-3xl text-lg leading-8 text-zinc-400">
            {description}
          </p>
        </div>
        {children}
      </div>
    </section>
  );
}

function BenefitGrid({
  items,
  tone = "dark",
}: {
  items: string[];
  tone?: "dark" | "light";
}) {
  const isLight = tone === "light";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item, index) => {
        const icons = [
          ShieldCheck,
          Clock3,
          CircleDollarSign,
          KeyRound,
          BadgeCheck,
          Gauge,
          UsersRound,
          CarFront,
        ];
        const Icon = icons[index % icons.length];

        return (
          <div
            className={
              isLight
                ? "rounded-[1.75rem] border border-zinc-200 bg-white/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
                : "rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/20"
            }
            key={item}
          >
            <div
              className={
                isLight
                  ? "mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-950 text-white"
                  : "mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black"
              }
            >
              <Icon className="h-5 w-5" />
            </div>
            <p
              className={
                isLight
                  ? "text-lg font-medium leading-7 text-zinc-800"
                  : "text-lg font-medium leading-7 text-zinc-200"
              }
            >
              {item}
            </p>
          </div>
        );
      })}
    </div>
  );
}
      </section>
    </main>
  );
}

function AudienceList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-primary">{title}</h2>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((item) => <li className="flex gap-2" key={item}><span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" /><span>{item}</span></li>)}
      </ul>
    </div>
  );
}

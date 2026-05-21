"use client";

import { EmptyState } from "@/components/app/empty-state";

export default function VehiclesError({ error }: { error: Error }) { return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><EmptyState title="Marketplace error" description={error.message} /></main>; }

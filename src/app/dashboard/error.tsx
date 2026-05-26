"use client";

import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <EmptyState
        action={<Button onClick={reset}>Try again</Button>}
        title="Dashboard could not load"
        description={error.message || "Something interrupted this workspace. Retry or return to the dashboard from the navigation."}
      />
    </main>
  );
}

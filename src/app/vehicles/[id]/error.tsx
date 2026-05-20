"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function VehicleDetailError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="space-y-4 p-8">
          <h1 className="text-2xl font-semibold">Vehicle details failed</h1>
          <p className="text-sm text-destructive-foreground">{error.message}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={reset} type="button">
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/vehicles">Back to vehicles</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

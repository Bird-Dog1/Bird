"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin data could not load</CardTitle>
        <CardDescription>
          Check your Supabase connection or retry this admin view.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {error.message}
        </p>
        <Button onClick={reset} type="button">
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

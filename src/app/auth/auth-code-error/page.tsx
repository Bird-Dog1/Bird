import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Authentication error",
};

type AuthCodeErrorPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AuthCodeErrorPage({ searchParams }: AuthCodeErrorPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Authentication link expired</CardTitle>
          <CardDescription>
            Request a new sign-in link or sign in with your email and password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {params.error ? (
            <p className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
              {params.error}
            </p>
          ) : null}
          <Button asChild>
            <Link href="/login">Return to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

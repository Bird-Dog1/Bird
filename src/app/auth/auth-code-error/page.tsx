import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Authentication error",
};

export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-md border-white/15">
        <CardHeader className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
            Authentication
          </p>
          <CardTitle>Authentication link expired</CardTitle>
          <CardDescription>
            Request a new sign-in link or sign in with your email and password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/login">Return to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

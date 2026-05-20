import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
          <CardDescription>
            The Bird Dog page you requested does not exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

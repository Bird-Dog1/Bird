import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Loading Bird Dog...</p>
        </CardContent>
      </Card>
    </main>
  );
}

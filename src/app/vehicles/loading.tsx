import { Card, CardContent } from "@/components/ui/card";

export default function VehiclesLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 h-32 animate-pulse rounded-3xl bg-card/60" />
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <div className="h-96 animate-pulse rounded-3xl bg-card/60" />
        <div className="grid gap-6 xl:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <Card className="overflow-hidden" key={item}>
              <div className="h-52 animate-pulse bg-secondary/60" />
              <CardContent className="space-y-4 p-5">
                <div className="h-6 animate-pulse rounded bg-secondary/60" />
                <div className="h-20 animate-pulse rounded-2xl bg-secondary/60" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}

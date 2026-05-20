export default function VehicleDetailLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 h-10 w-40 animate-pulse rounded-xl bg-card/60" />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="h-[32rem] animate-pulse rounded-3xl bg-card/60" />
        <div className="space-y-6">
          <div className="h-36 animate-pulse rounded-3xl bg-card/60" />
          <div className="h-64 animate-pulse rounded-3xl bg-card/60" />
          <div className="h-40 animate-pulse rounded-3xl bg-card/60" />
        </div>
      </div>
    </main>
  );
}

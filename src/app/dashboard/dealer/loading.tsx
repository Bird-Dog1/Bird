export default function DealerDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-40 animate-pulse rounded-full bg-secondary" />
        <div className="h-9 w-72 animate-pulse rounded-full bg-secondary" />
        <div className="h-4 max-w-2xl animate-pulse rounded-full bg-secondary" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            className="h-32 animate-pulse rounded-3xl border border-border bg-card/70"
            key={item}
          />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {[0, 1].map((item) => (
          <div
            className="h-80 animate-pulse rounded-3xl border border-border bg-card/70"
            key={item}
          />
        ))}
      </div>
    </div>
  );
}

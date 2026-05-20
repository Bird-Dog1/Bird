export default function AdminLoading() {
  return (
    <div className="grid gap-6" aria-label="Loading admin dashboard">
      <div className="space-y-3">
        <div className="h-4 w-24 animate-pulse rounded-full bg-secondary" />
        <div className="h-9 w-72 animate-pulse rounded-xl bg-secondary" />
        <div className="h-4 max-w-2xl animate-pulse rounded-full bg-secondary" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className="h-36 animate-pulse rounded-3xl border border-border bg-card/60"
            key={index}
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-3xl border border-border bg-card/60" />
    </div>
  );
}

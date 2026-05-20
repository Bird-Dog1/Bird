export default function MarketingLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="h-96 animate-pulse rounded-3xl bg-card/60" />
        <div className="h-72 animate-pulse rounded-3xl bg-card/60" />
      </div>
      <div className="mt-12 h-80 animate-pulse rounded-3xl bg-card/60" />
    </main>
  );
}

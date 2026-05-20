export default function ApplyLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 h-10 w-40 animate-pulse rounded-xl bg-card/60" />
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="h-48 animate-pulse rounded-3xl bg-card/60" />
          <div className="h-72 animate-pulse rounded-3xl bg-card/60" />
        </div>
        <div className="h-[42rem] animate-pulse rounded-3xl bg-card/60" />
      </div>
    </main>
  );
}

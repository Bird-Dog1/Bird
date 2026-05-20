export default function ApplicationsLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 h-32 animate-pulse rounded-3xl bg-card/60" />
      <div className="grid gap-5">
        {[1, 2, 3].map((item) => (
          <div className="h-48 animate-pulse rounded-3xl bg-card/60" key={item} />
        ))}
      </div>
    </main>
  );
}

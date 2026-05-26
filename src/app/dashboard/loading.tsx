export default function DashboardLoading() {
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[18rem_1fr] lg:px-8">
      <div className="space-y-3 rounded-[2rem] border border-white/10 bg-card/70 p-4 shadow-2xl shadow-black/20">
        <div className="h-4 w-24 animate-pulse rounded-full bg-white/[0.08]" />
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="h-10 animate-pulse rounded-2xl bg-white/[0.06]" key={index} />
        ))}
      </div>
      <div className="space-y-5">
        <div className="h-56 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.06]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-28 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/[0.05]" key={index} />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.05]" />
      </div>
    </main>
  );
}

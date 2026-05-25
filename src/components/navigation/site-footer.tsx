import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-background/75">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="font-semibold tracking-[-0.02em] text-foreground">Bird Dog</p>
          <p className="mt-1">Premium monthly vehicle access for dealerships and drivers.</p>
        </div>
        <nav className="flex flex-wrap gap-4">
          <Link className="hover:text-foreground" href="/vehicles">
            Browse
          </Link>
          <Link className="hover:text-foreground" href="/login">
            Sign in
          </Link>
          <Link className="hover:text-foreground" href="/signup">
            Get started
          </Link>
        </nav>
      </div>
    </footer>
  );
}

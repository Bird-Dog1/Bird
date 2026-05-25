import Link from "next/link";

import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { roleLabels } from "@/lib/auth/roles";
import { type AppRole } from "@/types/app";

type SiteHeaderProps = {
  role?: AppRole;
  email?: string | null;
};

export function SiteHeader({ role, email }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/75 backdrop-blur-2xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3 font-semibold tracking-[-0.02em]" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white text-[0.7rem] font-black tracking-[0.18em] text-background shadow-lg shadow-white/10">
            BD
          </span>
          <span className="text-base">Bird Dog</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Button asChild size="sm" variant="ghost">
            <Link href="/vehicles">Browse</Link>
          </Button>
          {role ? (
            <>
              <Link className="hidden text-muted-foreground hover:text-foreground sm:block" href="/dashboard">
                {roleLabels[role]} dashboard
              </Link>
              <span className="hidden max-w-48 truncate text-muted-foreground md:block">
                {email}
              </span>
              <form action={signOut}>
                <Button size="sm" type="submit" variant="secondary">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

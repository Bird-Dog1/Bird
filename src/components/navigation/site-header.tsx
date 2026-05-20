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
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3 font-semibold" href="/">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            BD
          </span>
          <span>Bird Dog</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {role ? (
            <>
              <Link className="hidden text-muted-foreground sm:block" href="/dashboard">
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

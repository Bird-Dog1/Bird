import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getEffectiveRole, roleHome, roleLabels } from "@/lib/auth/roles";
import { requireUserProfile } from "@/lib/auth/guards";

export default async function DashboardPage() {
  const { user, profile } = await requireUserProfile();
  const role = getEffectiveRole(user, profile);

  return (
    <div className="space-y-6">
      <Card className="border-white/15">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
            Workspace
          </p>
          <CardTitle className="text-3xl">Dashboard</CardTitle>
          <CardDescription>
            Role-aware workspace for {roleLabels[role].toLowerCase()} accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="font-medium">{profile.full_name ?? profile.email}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
          <Button asChild>
            <Link href={roleHome[role]}>Open workspace</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { roleHome, roleLabels } from "@/lib/auth/roles";
import { requireUserProfile } from "@/lib/auth/guards";

export default async function DashboardPage() {
  const { profile } = await requireUserProfile();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            Role-aware workspace for {roleLabels[profile.role].toLowerCase()} accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">{profile.full_name ?? profile.email}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
          <Button asChild>
            <Link href={roleHome[profile.role]}>Open workspace</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

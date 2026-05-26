import {
  AdminDataTable,
  AdminPageHeader,
  AdminStatusBadge,
  AdminTableCell,
} from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Admin settings" };

const reminders = [
  {
    area: "Access",
    note: "Only profiles with role admin can access this dashboard through existing guards and middleware.",
    status: "active",
  },
  {
    area: "Payments",
    note: "Do not describe Bird Dog as holding customer funds; payment and purchase terms remain dealer-managed.",
    status: "active",
  },
  {
    area: "Purchase credit",
    note: "Use subject-to-dealership-terms language unless a signed dealer program explicitly defines credit rules.",
    status: "active",
  },
  {
    area: "Data safety",
    note: "This admin dashboard is read-only and intentionally excludes destructive controls.",
    status: "active",
  },
];

export default async function AdminSettingsPage() {
  await requireRole(["admin"]);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description="Simple platform information and legal-safe reminders. No destructive controls are included."
        title="Settings"
      />

      <Card>
        <CardHeader>
          <CardTitle>Platform info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Info label="Product" value="Bird Dog" />
          <Info label="Admin mode" value="Read-only owner dashboard" />
          <Info label="Data access" value="Supabase session with RLS" />
          <Info label="Payments" value="Shown only if payment records exist" />
        </CardContent>
      </Card>

      <AdminDataTable
        columns={["Area", "Reminder", "Status"]}
        empty={null}
        rows={reminders.map((reminder) => (
          <>
            <AdminTableCell className="font-semibold">{reminder.area}</AdminTableCell>
            <AdminTableCell className="whitespace-normal leading-6 text-muted-foreground">{reminder.note}</AdminTableCell>
            <AdminTableCell><AdminStatusBadge value={reminder.status} /></AdminTableCell>
          </>
        ))}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

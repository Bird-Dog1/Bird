import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";

export const metadata = {
  title: "Admin console",
};

export default async function AdminDashboardPage() {
  await requireRole(["admin"]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin console</CardTitle>
          <CardDescription>
            Operational shell for reviewing customers, dealers, applications,
            vehicles, and platform controls.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {["Customers", "Dealers", "Inventory"].map((label) => (
            <div
              className="rounded-2xl border border-border bg-background/40 p-4"
              key={label}
            >
              <p className="text-sm font-semibold">{label}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Connected to Supabase policies and ready for real data views.
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

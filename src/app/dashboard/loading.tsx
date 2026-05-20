import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="h-7 w-48 animate-pulse rounded-lg bg-secondary" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded-lg bg-secondary" />
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="h-11 animate-pulse rounded-xl bg-secondary" />
          <div className="h-11 animate-pulse rounded-xl bg-secondary" />
          <div className="h-11 animate-pulse rounded-xl bg-secondary" />
        </CardContent>
      </Card>
    </div>
  );
}

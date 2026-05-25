import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Application submitted" };
export default async function ApplicationSubmittedPage() {
  await requireRole(["customer", "admin"]);
  return <main className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8"><Card className="border-white/15"><CardHeader><p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">Application</p><CardTitle>Application submitted</CardTitle></CardHeader><CardContent className="space-y-5"><p className="leading-7 text-muted-foreground">Your rental application and documents were sent to the dealership. Approval is not guaranteed. Final approval, contract, and payment are handled by the dealership.</p><div className="flex flex-col gap-3 sm:flex-row"><Button asChild><Link href="/dashboard/customer/applications">View my applications</Link></Button><Button asChild variant="outline"><Link href="/vehicles">Browse more vehicles</Link></Button></div></CardContent></Card></main>;
}

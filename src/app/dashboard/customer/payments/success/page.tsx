import Link from "next/link";
import type { Route } from "next";

import { MessageBanner } from "@/components/app/message-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { getPaymentSetupStatus } from "@/lib/payments/config";

export const metadata = { title: "Payment success" };

export default async function PaymentSuccessPage() {
  await requireRole(["customer", "admin"], "/dashboard/customer/payments/success");
  const setup = getPaymentSetupStatus();

  return (
    <div className="space-y-6">
      <Card className="border-white/15">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">Rental checkout</p>
          <CardTitle>Payment recording setup required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <MessageBanner error={setup.message} />
          <p className="leading-7 text-muted-foreground">
            This route is reserved for Stripe Checkout success redirects. A payment should only be recorded after a verified Stripe webhook confirms funds were paid to the participating dealership or the dealership-managed destination account.
          </p>
          <Button asChild><Link href={"/dashboard/customer/rentals" as Route}>Back to rentals</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}

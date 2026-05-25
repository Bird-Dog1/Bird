import type { RentalPaymentRecord, RentalPaymentSummary, PaymentTrackingResult } from "@/lib/payments/types";

type SupabaseFromRentalPayments = {
  from: (table: "rental_payments") => {
    select: (columns: string) => {
      in: (column: string, values: string[]) => {
        order: (column: string, options: { ascending: boolean }) => Promise<{
          data: RentalPaymentRecord[] | null;
          error: { message: string; code?: string } | null;
        }>;
      };
    };
  };
};

export async function getRentalPaymentTracking(
  supabase: unknown,
  rentalIds: string[],
): Promise<PaymentTrackingResult> {
  if (rentalIds.length === 0) {
    return { configured: true, summaries: new Map() };
  }

  const { data, error } = await (supabase as SupabaseFromRentalPayments)
    .from("rental_payments")
    .select("*")
    .in("rental_id", rentalIds)
    .order("due_date", { ascending: true });

  if (error) {
    return {
      configured: false,
      setupMessage: paymentSetupMessage(error.message),
      summaries: new Map(rentalIds.map((rentalId) => [rentalId, emptySummary(rentalId)])),
    };
  }

  return {
    configured: true,
    summaries: summarizePayments(rentalIds, data ?? []),
  };
}

function summarizePayments(rentalIds: string[], payments: RentalPaymentRecord[]) {
  const today = new Date().toISOString().slice(0, 10);
  const summaries = new Map<string, RentalPaymentSummary>();

  for (const rentalId of rentalIds) {
    const history = payments.filter((payment) => payment.rental_id === rentalId);
    const openPayments = history.filter((payment) => payment.status === "unpaid" || payment.status === "late");
    const nextPayment = openPayments[0] ?? null;
    const eligiblePurchaseCredit = history
      .filter((payment) => payment.status === "paid" && payment.credit_subject_to_dealer_terms)
      .reduce((sum, payment) => sum + Number(payment.eligible_purchase_credit ?? 0), 0);
    const overdueCount = history.filter((payment) =>
      payment.status === "late" || (payment.status === "unpaid" && payment.due_date < today),
    ).length;

    summaries.set(rentalId, {
      eligiblePurchaseCredit,
      nextPayment,
      overdueCount,
      paymentHistory: history,
      rentalId,
    });
  }

  return summaries;
}

function emptySummary(rentalId: string): RentalPaymentSummary {
  return {
    eligiblePurchaseCredit: 0,
    nextPayment: null,
    overdueCount: 0,
    paymentHistory: [],
    rentalId,
  };
}

function paymentSetupMessage(message: string) {
  if (message.toLowerCase().includes("rental_payments")) {
    return "Payment tracking tables are not applied yet. Use the SQL suggestion in supabase/migration_suggestions before enabling rental checkout.";
  }

  return message;
}

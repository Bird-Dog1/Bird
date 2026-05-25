export const paymentStatuses = ["unpaid", "paid", "late", "void"] as const;

export type PaymentStatus = (typeof paymentStatuses)[number];

export type RentalPaymentRecord = {
  id: string;
  rental_id: string;
  amount: number | string;
  due_date: string;
  status: PaymentStatus;
  payment_date: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  dealership_id: string;
  vehicle_id: string;
  customer_id: string;
  eligible_purchase_credit: number | string | null;
  credit_subject_to_dealer_terms: boolean;
  created_at: string;
  updated_at: string;
};

export type RentalPaymentSummary = {
  rentalId: string;
  nextPayment: RentalPaymentRecord | null;
  paymentHistory: RentalPaymentRecord[];
  eligiblePurchaseCredit: number;
  overdueCount: number;
};

export type PaymentTrackingResult = {
  configured: boolean;
  setupMessage?: string;
  summaries: Map<string, RentalPaymentSummary>;
};

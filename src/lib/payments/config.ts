export function getPaymentSetupStatus() {
  return {
    stripeInstalled: false,
    checkoutEnabled: false,
    message:
      "Stripe is not installed or configured. Apply the payment schema suggestion and wire Stripe Checkout with dealership-connected payouts before accepting rental payments.",
  };
}

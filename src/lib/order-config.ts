/** Order limits and copy shared by client and server (no dependencies). */
export const MAX_QTY = 10;
export const MAX_LINES = 20;
export const NOTES_MAX = 500;
export const NO_PAYMENT_NOTE =
  "No payment now: after we confirm your cake by email, we'll send you a PayPal invoice.";

/** Hidden honeypot field on the checkout form. People never see it; simple bots fill it in. */
export const HONEYPOT_FIELD = "website";

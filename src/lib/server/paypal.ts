import "server-only";
import type { OrderPayload } from "@/lib/server/order-token";
import { getCake } from "@/lib/cakes";
import { optionName } from "@/lib/order";

/**
 * PayPal Invoicing API v2 stub. Logs the requests it would make (create a
 * draft invoice, then send it) and never calls PayPal or needs credentials.
 *
 * A real implementation would get an OAuth token with PAYPAL_CLIENT_ID /
 * PAYPAL_CLIENT_SECRET, then make these two calls against PAYPAL_API_BASE.
 * The order number is used as invoice_number and in PayPal-Request-Id, so
 * PayPal would refuse to create a second invoice for the same order
 * (DUPLICATE_INVOICE_NUMBER / idempotent request).
 */

const API_BASE = "https://api-m.sandbox.paypal.com";

const money = (value: number) => ({ currency_code: "USD", value: value.toFixed(2) });

function splitName(full: string): { given_name: string; surname: string } {
  const parts = full.trim().split(/\s+/);
  return parts.length > 1
    ? { given_name: parts.slice(0, -1).join(" "), surname: parts.at(-1)! }
    : { given_name: parts[0] ?? "", surname: "" };
}

export function buildDraftInvoice(order: OrderPayload, orderUrl: string, invoicerEmail: string) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    detail: {
      invoice_number: order.n,
      reference: order.n,
      invoice_date: today,
      currency_code: "USD",
      note: `Thank you for your Frostwell Cakes order ${order.n}. Pickup on ${order.d}. Order details: ${orderUrl}`,
      term: "Payment is due before pickup.",
      payment_term: { term_type: "DUE_ON_RECEIPT" },
    },
    invoicer: {
      business_name: "Frostwell Cakes",
      email_address: invoicerEmail,
      website: orderUrl.split("/order/")[0],
    },
    primary_recipients: [
      {
        billing_info: {
          name: splitName(order.c.n),
          email_address: order.c.e,
          phones: [{ national_number: order.c.p.replace(/\D/g, "").slice(-14), phone_type: "MOBILE" }],
        },
      },
    ],
    items: order.i.map(([slug, size, flavour, frosting, message, qty, unit]) => ({
      name: `${getCake(slug)?.name ?? slug}, ${size} inch`,
      description: [
        `${optionName("flavour", flavour)} sponge`,
        optionName("frosting", frosting),
        message ? `Message: "${message}"` : null,
      ]
        .filter(Boolean)
        .join(", "),
      quantity: String(qty),
      unit_amount: money(unit),
      unit_of_measure: "QUANTITY",
    })),
    configuration: { allow_tip: false, tax_inclusive: false, partial_payment: { allow_partial_payment: false } },
    amount: { breakdown: { item_total: money(order.s) } },
  };
}

export type InvoiceStubResult = { id: string; status: "SENT"; total: string };

/** Log the two Invoicing v2 calls a real integration would make. No network access. */
export async function createAndSendInvoiceStub(
  order: OrderPayload,
  orderUrl: string,
  invoicerEmail: string,
): Promise<InvoiceStubResult> {
  const draft = buildDraftInvoice(order, orderUrl, invoicerEmail);
  const id = `INV2-STUB-${order.n.slice(3)}`;
  console.info(
    [
      "[paypal-stub] Would call PayPal Invoicing API v2 (not called; stub):",
      `POST ${API_BASE}/v2/invoicing/invoices`,
      "Authorization: Bearer <access token from PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET>",
      "Content-Type: application/json",
      `PayPal-Request-Id: ${order.n}-create`,
      JSON.stringify(draft, null, 2),
      `-> 201 Created (simulated) { "id": "${id}", "status": "DRAFT" }`,
      "",
      `POST ${API_BASE}/v2/invoicing/invoices/${id}/send`,
      `PayPal-Request-Id: ${order.n}-send`,
      JSON.stringify(
        {
          send_to_invoicer: true,
          send_to_recipient: true,
          subject: `Invoice for your Frostwell Cakes order ${order.n}`,
          note: "Thank you! Please pay before your pickup date.",
        },
        null,
        2,
      ),
      `-> 200 OK (simulated) status SENT`,
      "[/paypal-stub]",
    ].join("\n"),
  );
  return { id, status: "SENT", total: draft.amount.breakdown.item_total.value };
}

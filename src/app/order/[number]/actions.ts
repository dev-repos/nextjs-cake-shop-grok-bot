"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { type DecisionState, REASON_MAX, REASON_MIN } from "@/lib/order-decision";
import { baseUrl } from "@/lib/server/base-url";
import { bakeryAddress, sendEmails } from "@/lib/server/email";
import { confirmedEmail, declinedEmail } from "@/lib/server/order-emails";
import { getOutcome, rememberOutcome } from "@/lib/server/order-outcome";
import { type LinkPurpose, signedOrderLink, verifyOrderLink } from "@/lib/server/order-token";
import { createAndSendInvoiceStub } from "@/lib/server/paypal";

const LINK_PROBLEM: Record<string, string> = {
  invalid: "This link isn't valid any more. Please open the exact link from the order email.",
  expired: "This link has expired, so the order can't be changed from it. Please contact the customer directly.",
  config: "Orders can't be processed right now because the site isn't fully set up.",
};

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

/** Re-verify the signed link sent with the form, and refuse links already used on this device. */
async function verifyForm(purpose: LinkPurpose, formData: FormData) {
  const number = text(formData, "number");
  const data = text(formData, "d");
  const sig = text(formData, "sig");
  const result = verifyOrderLink(purpose, number, data, sig);
  if (!result.ok) return { ok: false as const, message: LINK_PROBLEM[result.reason] };
  const outcome = await getOutcome(result.order.n);
  if (outcome) {
    return { ok: false as const, message: `Order ${result.order.n} was already ${outcome.action}. Nothing was sent again.` };
  }
  return { ok: true as const, order: result.order, data, sig };
}

const resultPath = (path: string, result: "confirmed" | "declined") => `${path}&result=${result}`;

/** Bakery confirms: email the customer, log the PayPal invoice stub, remember the outcome. */
export async function confirmOrder(_prev: DecisionState, formData: FormData): Promise<DecisionState> {
  const checked = await verifyForm("accept", formData);
  if (!checked.ok) return { status: "error", message: checked.message };
  const { order } = checked;

  const origin = await baseUrl();
  const orderLink = origin + signedOrderLink("confirmed", order, checked.data).path;
  const bakery = bakeryAddress();
  try {
    await sendEmails([confirmedEmail(order, orderLink, bakery)]);
  } catch (error) {
    console.error(`[orders] Confirmation email for ${order.n} failed:`, error instanceof Error ? error.message : error);
    return { status: "error", message: "The confirmation email couldn't be sent, so the order is not confirmed yet. Please try again." };
  }
  const invoice = await createAndSendInvoiceStub(order, orderLink, bakery);
  await rememberOutcome(order.n, "confirmed");
  console.info(`[orders] Order ${order.n} confirmed; customer emailed; PayPal invoice ${invoice.id} (stub) for $${invoice.total} USD.`);

  redirect(resultPath(`/order/${order.n}/accept?d=${checked.data}&sig=${checked.sig}`, "confirmed"));
}

const reasonSchema = z
  .string()
  .trim()
  .min(REASON_MIN, `Please give a short reason (at least ${REASON_MIN} characters).`)
  .max(REASON_MAX, `Please keep the reason under ${REASON_MAX} characters.`);

/** Bakery declines: email the customer a polite note with the reason, remember the outcome. */
export async function declineOrder(_prev: DecisionState, formData: FormData): Promise<DecisionState> {
  const checked = await verifyForm("decline", formData);
  if (!checked.ok) return { status: "error", message: checked.message };
  const { order } = checked;

  const reason = reasonSchema.safeParse(text(formData, "reason"));
  if (!reason.success) {
    const message = reason.error.issues[0]?.message ?? "Please give a short reason.";
    return { status: "error", message, fieldError: message };
  }

  try {
    await sendEmails([declinedEmail(order, reason.data, bakeryAddress())]);
  } catch (error) {
    console.error(`[orders] Decline email for ${order.n} failed:`, error instanceof Error ? error.message : error);
    return { status: "error", message: "The email to the customer couldn't be sent, so the order is not declined yet. Please try again." };
  }
  await rememberOutcome(order.n, "declined");
  console.info(`[orders] Order ${order.n} declined; customer emailed.`);

  redirect(resultPath(`/order/${order.n}/decline?d=${checked.data}&sig=${checked.sig}`, "declined"));
}

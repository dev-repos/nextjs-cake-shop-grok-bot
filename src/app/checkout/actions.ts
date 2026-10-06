"use server";

import { formatDate } from "@/lib/cakes";
import {
  bakeryMinPickupDate,
  type CheckoutField,
  type CheckoutState,
  checkoutSchema,
  priceLines,
} from "@/lib/order";
import { baseUrl } from "@/lib/server/base-url";
import { HONEYPOT_FIELD } from "@/lib/order-config";
import { bakeryAddress, sendEmails } from "@/lib/server/email";
import { bakeryEmail, customerEmail } from "@/lib/server/order-emails";
import {
  assertOrderSigningConfigured,
  newOrderNumber,
  OrderConfigError,
  type OrderPayload,
  signedOrderLinks,
} from "@/lib/server/order-token";
import { checkOrderRateLimit, recordOrder } from "@/lib/server/rate-limit";

const UNAVAILABLE =
  "Sorry, online order requests aren't available right now. Please email us at hello@frostwellcakes.example and we'll take your order by email.";

function parseItems(raw: FormDataEntryValue | null): unknown {
  if (typeof raw !== "string" || raw.length > 20_000) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Server Action: validate the order request, sign its links and email it. */
export async function submitOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };

  // Honeypot: the hidden "website" field is empty for people. If it's filled in, quietly drop
  // the request with a neutral message and send nothing.
  if (text(HONEYPOT_FIELD).trim() !== "") {
    console.warn("[orders] Honeypot field filled in; request dropped, no emails sent.");
    return {
      status: "error",
      formError: "Sorry, we couldn't send your order request. Please try again later, or email us at hello@frostwellcakes.example.",
      fieldErrors: {},
    };
  }

  const parsed = checkoutSchema.safeParse({
    name: text("name"),
    phone: text("phone"),
    email: text("email"),
    pickupDate: text("pickupDate"),
    notes: text("notes"),
    items: parseItems(formData.get("items")),
  });

  const fieldErrors: Partial<Record<CheckoutField, string>> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as CheckoutField;
      // Problems inside a cart line (e.g. an edited quantity) get one friendly message.
      const message =
        field === "items" && issue.path.length > 1
          ? "Something in your cart can't be ordered as it is. Please review your cart and try again."
          : issue.message;
      if (field && !fieldErrors[field]) fieldErrors[field] = message;
    }
  }

  // The bakery's calendar decides the earliest pickup date.
  const minDate = bakeryMinPickupDate();
  const pickupDate = text("pickupDate");
  if (!fieldErrors.pickupDate && /^\d{4}-\d{2}-\d{2}$/.test(pickupDate) && pickupDate < minDate) {
    fieldErrors.pickupDate = `Pickup needs at least 3 days' notice. The earliest date is ${formatDate(minDate)}.`;
  }

  if (!parsed.success || Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      formError: fieldErrors.items,
      fieldErrors,
    };
  }

  const input = parsed.data;

  const limit = await checkOrderRateLimit();
  if (!limit.ok) {
    console.warn("[orders] Rate limit reached; request refused, no emails sent.");
    return {
      status: "error",
      formError: `You've sent several order requests in the last few minutes. Please wait about ${limit.retryAfterMinutes} minute${limit.retryAfterMinutes === 1 ? "" : "s"} and try again, or email us at hello@frostwellcakes.example.`,
      fieldErrors: {},
    };
  }

  try {
    assertOrderSigningConfigured();
  } catch (error) {
    if (error instanceof OrderConfigError) {
      console.error(`[orders] ${error.message}`);
      return { status: "error", formError: UNAVAILABLE, fieldErrors: {} };
    }
    throw error;
  }

  const { lines, total } = priceLines(input.items);
  const order: OrderPayload = {
    v: 1,
    n: newOrderNumber(),
    t: Math.floor(Date.now() / 1000),
    c: { n: input.name, p: input.phone, e: input.email },
    d: input.pickupDate,
    x: input.notes,
    i: lines.map((l) => [l.slug, l.size, l.flavour, l.frosting, l.message, l.qty, l.unitPrice]),
    s: total,
  };

  const signed = signedOrderLinks(order);
  const origin = await baseUrl();
  const links = {
    view: origin + signed.view.path,
    accept: origin + signed.accept.path,
    decline: origin + signed.decline.path,
  };
  const bakery = bakeryAddress();

  try {
    const mode = await sendEmails([bakeryEmail(order, links, bakery), customerEmail(order, links, bakery)]);
    await recordOrder();
    console.info(`[orders] Order ${order.n} received (${lines.length} line(s), total $${total}); emails ${mode === "gmail" ? "sent" : "logged"}.`);
  } catch (error) {
    console.error(`[orders] Sending emails for ${order.n} failed:`, error instanceof Error ? error.message : error);
    return {
      status: "error",
      formError:
        "We couldn't send your order request just now. Please try again in a minute, or email us at hello@frostwellcakes.example.",
      fieldErrors: {},
    };
  }

  return { status: "ok", orderNumber: order.n, orderPath: signed.view.path };
}

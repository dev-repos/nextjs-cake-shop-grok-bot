import "server-only";
import { formatDate, getCake } from "@/lib/cakes";
import { NO_PAYMENT_NOTE, optionName } from "@/lib/order";
import { usd } from "@/lib/site";
import { type Email, escapeHtml } from "@/lib/server/email";
import type { OrderPayload } from "@/lib/server/order-token";

type Links = { view: string; accept: string; decline: string };

function lineText(order: OrderPayload): string[] {
  return order.i.map(([slug, size, flavour, frosting, message, qty, unit]) => {
    const name = getCake(slug)?.name ?? slug;
    const msg = message ? `, message "${message}"` : "";
    return `- ${qty} × ${name}, ${size} inch, ${optionName("flavour", flavour)} sponge, ${optionName("frosting", frosting)}${msg}: ${usd(unit)} each = ${usd(unit * qty)}`;
  });
}

function linesHtml(order: OrderPayload): string {
  return `<ul>${lineText(order)
    .map((l) => `<li>${escapeHtml(l.slice(2))}</li>`)
    .join("")}</ul>`;
}

export function bakeryEmail(order: OrderPayload, links: Links, to: string): Email {
  const pickup = formatDate(order.d);
  const text = [
    `New order request ${order.n} from ${order.c.n}.`,
    "",
    ...lineText(order),
    `Total: ${usd(order.s)}`,
    "",
    `Pickup: ${pickup}`,
    `Name: ${order.c.n}`,
    `Phone: ${order.c.p}`,
    `Email: ${order.c.e}`,
    `Notes: ${order.x || "(none)"}`,
    "",
    `Accept this order: ${links.accept}`,
    `Decline this order: ${links.decline}`,
    "",
    `Order page: ${links.view}`,
    "Each link is signed for this order only. Reply to this email to contact the customer.",
  ].join("\n");
  const html = `
<p><strong>New order request ${escapeHtml(order.n)}</strong> from ${escapeHtml(order.c.n)}.</p>
${linesHtml(order)}
<p><strong>Total: ${usd(order.s)}</strong></p>
<p>Pickup: ${escapeHtml(pickup)}<br>Name: ${escapeHtml(order.c.n)}<br>Phone: ${escapeHtml(order.c.p)}<br>Email: ${escapeHtml(order.c.e)}<br>Notes: ${escapeHtml(order.x || "(none)")}</p>
<p><a href="${escapeHtml(links.accept)}">Accept this order</a> &nbsp;·&nbsp; <a href="${escapeHtml(links.decline)}">Decline this order</a></p>
<p><a href="${escapeHtml(links.view)}">View the order page</a></p>
<p style="color:#8a6350;font-size:12px">Each link is signed for this order only. Reply to this email to contact the customer.</p>`;
  return {
    to,
    replyTo: order.c.e,
    subject: `New cake order ${order.n}: ${order.c.n}, pickup ${pickup}`,
    text,
    html,
  };
}

export function customerEmail(order: OrderPayload, links: Links, bakery: string): Email {
  const pickup = formatDate(order.d);
  const text = [
    `Hi ${order.c.n},`,
    "",
    `We got your cake request ${order.n}. Thank you!`,
    "",
    ...lineText(order),
    `Total: ${usd(order.s)}`,
    `Pickup: ${pickup}`,
    "",
    NO_PAYMENT_NOTE,
    "We'll reply within one working day.",
    "",
    `View your order: ${links.view}`,
    "",
    "Frostwell Cakes",
  ].join("\n");
  const html = `
<p>Hi ${escapeHtml(order.c.n)},</p>
<p>We got your cake request <strong>${escapeHtml(order.n)}</strong>. Thank you!</p>
${linesHtml(order)}
<p><strong>Total: ${usd(order.s)}</strong><br>Pickup: ${escapeHtml(pickup)}</p>
<p>${escapeHtml(NO_PAYMENT_NOTE)} We'll reply within one working day.</p>
<p><a href="${escapeHtml(links.view)}">View your order</a></p>
<p>Frostwell Cakes</p>`;
  return {
    to: order.c.e,
    replyTo: bakery,
    subject: `We got your cake request (${order.n})`,
    text,
    html,
  };
}

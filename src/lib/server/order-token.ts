import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { z } from "zod";
import { cartItemSchema } from "@/lib/order";

/**
 * Signed order links (no database).
 *
 * The order is stored in the link itself: `d` is the order as compact JSON,
 * deflated and base64url-encoded. `sig` is HMAC-SHA256 with ORDER_SECRET over
 * "fw1.<purpose>.<orderNumber>.<d>", so each link only works for one purpose
 * (view, accept or decline) and one order. Signatures are compared in
 * constant time.
 */

export type LinkPurpose = "view" | "accept" | "decline";

export class OrderConfigError extends Error {}

const MIN_SECRET_LENGTH = 32;
let warnedDevSecret = false;

function orderSecret(): string {
  const secret = process.env.ORDER_SECRET;
  if (secret && secret.length >= MIN_SECRET_LENGTH) return secret;
  if (process.env.NODE_ENV !== "production") {
    if (!warnedDevSecret) {
      console.warn(
        "[orders] ORDER_SECRET is not set (or shorter than 32 characters). Using an insecure development-only key. Set ORDER_SECRET before deploying.",
      );
      warnedDevSecret = true;
    }
    return "frostwell-insecure-development-only-key-do-not-use";
  }
  throw new OrderConfigError(
    "ORDER_SECRET is missing or shorter than 32 characters, so order links can't be signed.",
  );
}

/** Call early to fail fast with a clear error when the server isn't configured. */
export function assertOrderSigningConfigured(): void {
  orderSecret();
}

const ORDER_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L

export function newOrderNumber(): string {
  let id = "";
  for (let i = 0; i < 6; i++) id += ORDER_ALPHABET[randomInt(ORDER_ALPHABET.length)];
  return `FW-${id}`;
}

export const ORDER_NUMBER = /^FW-[A-HJKMNP-Z2-9]{6}$/;

/** Compact order stored inside signed links. */
const orderPayloadSchema = z.object({
  v: z.literal(1),
  n: z.string().regex(ORDER_NUMBER),
  t: z.number().int(), // created at, unix seconds
  c: z.object({ n: z.string(), p: z.string(), e: z.string() }), // customer name, phone, email
  d: z.iso.date(), // pickup date
  x: z.string(), // notes
  i: z.array(
    z.tuple([
      cartItemSchema.shape.slug,
      cartItemSchema.shape.size,
      cartItemSchema.shape.flavour,
      cartItemSchema.shape.frosting,
      z.string(), // message
      cartItemSchema.shape.qty,
      z.number().int(), // unit price in USD at the time of the order
    ]),
  ),
  s: z.number().int(), // total in USD
});

export type OrderPayload = z.infer<typeof orderPayloadSchema>;

const MAX_ENCODED_LENGTH = 6000;

function encodePayload(payload: OrderPayload): string {
  return deflateRawSync(Buffer.from(JSON.stringify(payload), "utf8")).toString("base64url");
}

function sign(purpose: LinkPurpose, orderNumber: string, data: string): string {
  return createHmac("sha256", orderSecret())
    .update(`fw1.${purpose}.${orderNumber}.${data}`)
    .digest("base64url");
}

export type SignedLink = { path: string; data: string; sig: string };

export function signedOrderLinks(payload: OrderPayload): Record<LinkPurpose, SignedLink> {
  const data = encodePayload(payload);
  const make = (purpose: LinkPurpose, suffix: string): SignedLink => {
    const sig = sign(purpose, payload.n, data);
    return { data, sig, path: `/order/${payload.n}${suffix}?d=${data}&sig=${sig}` };
  };
  return { view: make("view", ""), accept: make("accept", "/accept"), decline: make("decline", "/decline") };
}

export type VerifyResult =
  | { ok: true; order: OrderPayload }
  | { ok: false; reason: "invalid" | "config" };

/** Verify a signed link for one purpose and order number. */
export function verifyOrderLink(
  purpose: LinkPurpose,
  orderNumber: string,
  data: string | undefined,
  sig: string | undefined,
): VerifyResult {
  if (!ORDER_NUMBER.test(orderNumber) || !data || !sig || data.length > MAX_ENCODED_LENGTH) {
    return { ok: false, reason: "invalid" };
  }
  let expected: Buffer;
  try {
    expected = Buffer.from(sign(purpose, orderNumber, data), "base64url");
  } catch (error) {
    if (error instanceof OrderConfigError) return { ok: false, reason: "config" };
    throw error;
  }
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { ok: false, reason: "invalid" };
  }
  try {
    const json = inflateRawSync(Buffer.from(data, "base64url"), { maxOutputLength: 64 * 1024 });
    const order = orderPayloadSchema.parse(JSON.parse(json.toString("utf8")));
    if (order.n !== orderNumber) return { ok: false, reason: "invalid" };
    return { ok: true, order };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

/**
 * Order request schema and helpers shared by the checkout form and the Server
 * Action. Contains no secrets.
 */
import { z } from "zod";
import {
  cakes,
  FLAVOURS,
  FROSTINGS,
  getCake,
  MESSAGE_MAX,
  MIN_LEAD_DAYS,
  priceFor,
  type SizeInches,
} from "@/lib/cakes";

import { MAX_LINES, MAX_QTY, NOTES_MAX } from "@/lib/order-config";

export { MAX_LINES, MAX_QTY, NO_PAYMENT_NOTE, NOTES_MAX } from "@/lib/order-config";
export const BAKERY_TIME_ZONE = "America/Los_Angeles";

/** Today's date in the bakery's time zone (Portland), as YYYY-MM-DD. */
export function bakeryToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BAKERY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Earliest pickup date the bakery accepts (bakery today + MIN_LEAD_DAYS). */
export function bakeryMinPickupDate(now = new Date()): string {
  return addDaysIso(bakeryToday(now), MIN_LEAD_DAYS);
}

const slugs = cakes.map((c) => c.slug) as [string, ...string[]];
const flavourIds = FLAVOURS.map((f) => f.id) as [string, ...string[]];
const frostingIds = FROSTINGS.map((f) => f.id) as [string, ...string[]];

export const cartItemSchema = z.object({
  slug: z.enum(slugs),
  size: z.union([z.literal(6), z.literal(8), z.literal(10)]) satisfies z.ZodType<SizeInches>,
  flavour: z.enum(flavourIds),
  frosting: z.enum(frostingIds),
  message: z.string().trim().max(MESSAGE_MAX, `Messages can be up to ${MESSAGE_MAX} characters.`),
  qty: z.number().int().min(1).max(MAX_QTY),
});

export type CartItemInput = z.infer<typeof cartItemSchema>;

const PHONE = /^\+?[0-9 ().-]{7,20}$/;

/** Checkout fields. The minimum pickup date is checked separately against the bakery's calendar. */
export const checkoutSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(80, "Please keep your name under 80 characters."),
  phone: z
    .string()
    .trim()
    .regex(PHONE, "Please enter a phone number, e.g. +1 503 555 0142.")
    .refine((v) => v.replace(/\D/g, "").length >= 7, "Please enter a phone number, e.g. +1 503 555 0142."),
  email: z.email("Please enter a valid email address.").max(120),
  pickupDate: z.iso.date("Please choose a pickup date."),
  notes: z.string().trim().max(NOTES_MAX, `Notes can be up to ${NOTES_MAX} characters.`),
  items: z
    .array(cartItemSchema, "Your cart couldn't be read. Please refresh and try again.")
    .min(1, "Your cart is empty.")
    .max(MAX_LINES, `Orders can have up to ${MAX_LINES} cakes.`),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutField = "name" | "phone" | "email" | "pickupDate" | "notes" | "items";

export type PricedLine = CartItemInput & { name: string; unitPrice: number; lineTotal: number };

/** Prices each line from the catalogue (never from the browser). */
export function priceLines(items: CartItemInput[]): { lines: PricedLine[]; total: number } {
  const lines = items.map((item) => {
    const cake = getCake(item.slug)!;
    const unitPrice = priceFor(cake, { ...item, date: "" }).total;
    return { ...item, name: cake.name, unitPrice, lineTotal: unitPrice * item.qty };
  });
  return { lines, total: lines.reduce((sum, l) => sum + l.lineTotal, 0) };
}

export function optionName(kind: "flavour" | "frosting", id: string): string {
  const list = kind === "flavour" ? FLAVOURS : FROSTINGS;
  return list.find((o) => o.id === id)?.name ?? id;
}

export type CheckoutState =
  | { status: "idle" }
  | {
      status: "error";
      formError?: string;
      fieldErrors: Partial<Record<CheckoutField, string>>;
    }
  | { status: "ok"; orderNumber: string; orderPath: string };

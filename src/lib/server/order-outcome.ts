import "server-only";
import { cookies } from "next/headers";
import { hmac, safeEqual } from "@/lib/server/order-token";

/**
 * "Already used" protection without a database.
 *
 * After the bakery confirms or declines an order, the outcome is remembered in
 * a signed, HttpOnly cookie on that device ("fw_outcomes": order number ->
 * outcome + time, HMAC-signed with ORDER_SECRET so it can't be forged). Opening
 * the accept or decline link again on the same device shows a clear "already
 * confirmed / declined" error. Other devices can't see this cookie, which is
 * the limit of stateless storage. See the README.
 */

export type Outcome = { action: "confirmed" | "declined"; at: number };

const COOKIE = "fw_outcomes";
const MAX_ENTRIES = 30;

type Outcomes = Record<string, Outcome>;

function decode(raw: string | undefined): Outcomes {
  if (!raw) return {};
  const [data, sig] = raw.split(".");
  if (!data || !sig) return {};
  try {
    if (!safeEqual(sig, hmac(`fw1.outcomes.${data}`))) return {};
    const parsed = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as Outcomes;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function getOutcome(orderNumber: string): Promise<Outcome | null> {
  const store = await cookies();
  return decode(store.get(COOKIE)?.value)[orderNumber] ?? null;
}

/** Remember an outcome on this device. Only callable from a Server Action. */
export async function rememberOutcome(orderNumber: string, action: Outcome["action"]): Promise<void> {
  const store = await cookies();
  const outcomes = decode(store.get(COOKIE)?.value);
  outcomes[orderNumber] = { action, at: Math.floor(Date.now() / 1000) };
  const recent = Object.fromEntries(
    Object.entries(outcomes)
      .sort((a, b) => b[1].at - a[1].at)
      .slice(0, MAX_ENTRIES),
  );
  const data = Buffer.from(JSON.stringify(recent), "utf8").toString("base64url");
  store.set(COOKIE, `${data}.${hmac(`fw1.outcomes.${data}`)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/order",
    maxAge: 60 * 60 * 24 * 90,
  });
}

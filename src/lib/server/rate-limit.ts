import "server-only";
import { cookies, headers } from "next/headers";
import { hmac, safeEqual } from "@/lib/server/order-token";

/**
 * Best-effort rate limit for order requests, without a database.
 *
 * Two independent checks, each a sliding window of ORDER_LIMIT orders per WINDOW_MS:
 * 1. Per client IP, kept in this server instance's memory. On serverless (Vercel) each
 *    instance has its own memory and instances come and go, so this limit is per
 *    instance, not global.
 * 2. Per browser, in a signed HttpOnly cookie (HMAC with ORDER_SECRET) that lists the
 *    times of recent orders. It works across instances, but clearing cookies resets it.
 *
 * Neither is a hard guarantee; together they stop casual repeat submissions and
 * simple scripts. A shared store (e.g. KV) would be needed for a strict global limit.
 */

export const ORDER_LIMIT = 3;
export const WINDOW_MS = 10 * 60 * 1000;
const COOKIE = "fw_rl";
const MAX_TRACKED_IPS = 5000;

const byIp = new Map<string, number[]>();

const recent = (times: number[], now: number) => times.filter((t) => now - t < WINDOW_MS);

/** The client IP as reported by the platform (Vercel sets x-forwarded-for; locally it's whatever the proxy sends). */
async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown";
}

async function readCookie(): Promise<number[]> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return [];
  const [data, sig] = raw.split(".");
  try {
    if (!data || !sig || !safeEqual(sig, hmac(`fw1.rl.${data}`))) return [];
    const times = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    return Array.isArray(times) ? times.filter((t): t is number => typeof t === "number") : [];
  } catch {
    return [];
  }
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterMinutes: number };

/** Check both limits without recording anything. */
export async function checkOrderRateLimit(now = Date.now()): Promise<RateLimitResult> {
  const ipTimes = recent(byIp.get(await clientIp()) ?? [], now);
  const cookieTimes = recent(await readCookie(), now);
  const times = ipTimes.length >= ORDER_LIMIT ? ipTimes : cookieTimes.length >= ORDER_LIMIT ? cookieTimes : null;
  if (!times) return { ok: true };
  const oldest = Math.min(...times);
  return { ok: false, retryAfterMinutes: Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 60000)) };
}

/** Record one accepted order request for this IP and browser. Call only from a Server Action. */
export async function recordOrder(now = Date.now()): Promise<void> {
  const ip = await clientIp();
  byIp.set(ip, [...recent(byIp.get(ip) ?? [], now), now]);
  if (byIp.size > MAX_TRACKED_IPS) {
    for (const [key, times] of byIp) if (recent(times, now).length === 0) byIp.delete(key);
    while (byIp.size > MAX_TRACKED_IPS) byIp.delete(byIp.keys().next().value as string);
  }

  const times = [...recent(await readCookie(), now), now].slice(-ORDER_LIMIT * 2);
  const data = Buffer.from(JSON.stringify(times), "utf8").toString("base64url");
  (await cookies()).set(COOKIE, `${data}.${hmac(`fw1.rl.${data}`)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.ceil(WINDOW_MS / 1000),
  });
}

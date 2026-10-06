import "server-only";
import { headers } from "next/headers";

/**
 * Absolute base URL for links in emails, in order of preference:
 * 1. SITE_URL, if set (e.g. a custom domain).
 * 2. On Vercel production: VERCEL_PROJECT_PRODUCTION_URL.
 * 3. On Vercel previews: VERCEL_BRANCH_URL, then VERCEL_URL.
 * 4. Locally: the request's Host / X-Forwarded-Proto headers.
 */
export async function baseUrl(): Promise<string> {
  const explicit = process.env.SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  const vercelHost = process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL;
  if (vercelHost) return `https://${vercelHost}`;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const local = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
  const proto = h.get("x-forwarded-proto") ?? (local ? "http" : "https");
  return `${proto}://${host}`;
}

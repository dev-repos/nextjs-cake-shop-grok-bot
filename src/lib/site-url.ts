/**
 * Public, canonical site URL used in structured data and /llms.txt.
 * SITE_URL wins; otherwise the Vercel production domain; otherwise the live site.
 * Read at build time for static pages, so previews also point at production.
 */
export const PRODUCTION_URL = "https://nextjs-cake-shop-grok-bot.vercel.app";

export function publicSiteUrl(): string {
  const explicit = process.env.SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return PRODUCTION_URL;
}

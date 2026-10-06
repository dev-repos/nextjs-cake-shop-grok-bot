# nextjs-cake-shop-grok-bot
Frostwell Cakes: a mobile-first Next.js custom-cake shop built by Grok Bot from GitHub issues, driven from a phone, deployed to Vercel (AI System Design Deep Dive tutorial)

**Live site:** https://nextjs-cake-shop-grok-bot.vercel.app

## Deployment

The site is hosted on [Vercel](https://vercel.com) as the `nextjs-cake-shop-grok-bot` project, linked to this GitHub repo:

- **Production** deploys automatically from `main` to https://nextjs-cake-shop-grok-bot.vercel.app.
- **Preview** deployments are created automatically for every pull request; Vercel posts the preview link on the PR.
- The build needs no secrets. At runtime, order requests need `ORDER_SECRET` (set on Vercel for Production and Preview). Gmail sending is optional; without `GMAIL_USER` / `GMAIL_APP_PASSWORD` the emails are written to the Vercel runtime logs. All variables are documented in [`.env.example`](.env.example).

## Orders (no database, no online payment)

- The cart is saved in the browser (`localStorage`).
- Checkout submits a **Server Action** that validates everything with **Zod**, prices the cakes from the catalogue on the server, and returns an order number like `FW-7KQ2MX`.
- The order lives in **signed links**: the order is compact JSON (deflated, base64url) in `?d=`, and `?sig=` is an HMAC-SHA256 with `ORDER_SECRET` over the purpose (`view`, `confirmed`, `accept` or `decline`), the order number and the data. A view link can't be used to accept or decline, and a link can't be moved to another order.
- **nodemailer** sends two emails through Gmail: to `BAKERY_EMAIL` with signed Accept / Decline links, and to the customer with a link to their order page. Without Gmail variables the emails are logged instead.
- **Accept** (`/order/<number>/accept`) shows the order and one button, "Confirm this order". Confirming emails the customer that the order is confirmed, with a link to their order page (now showing "Confirmed"), and that a PayPal invoice in US dollars is on its way.
- **Decline** (`/order/<number>/decline`) asks for a short reason and emails the customer a polite "we can't make this one", with Reply-To set to the bakery.
- **PayPal** is a stub (`src/lib/server/paypal.ts`): it logs the PayPal Invoicing API v2 calls it would make, `POST /v2/invoicing/invoices` with the full draft in USD and then `POST /v2/invoicing/invoices/{id}/send`. It makes no network calls and needs no credentials.
- **Bad links**: a tampered link, a link for another order, or an accept/decline link that is older than 30 days or past the pickup date shows a clear error.

### "Already used" without a database

True one-time links need somewhere to record that a link was used, and this site has no database. What it does instead:

- After confirming or declining, the browser that did it gets a signed, HttpOnly cookie (`fw_outcomes`, HMAC with `ORDER_SECRET`). Opening the accept or decline link again on that device, or trying to decline an order already confirmed there (or the other way round), shows "This order was already confirmed/declined" and sends nothing.
- Accept and decline links expire 30 days after the order, or once the pickup date has passed.
- Emails have a fixed `Message-ID` per order and outcome, and the PayPal call uses the order number as `invoice_number` and in the `PayPal-Request-Id` idempotency header, so a real PayPal integration would refuse a duplicate invoice.

**Limitation:** a link reused on a *different* device or browser (or after clearing cookies) within those 30 days can't be detected and would send the email again. Making links truly single-use needs a small datastore (for example Vercel Edge Config, KV or a database) to record used order numbers.

Local development: copy `.env.example` to `.env.local` and set `ORDER_SECRET` (in `next dev` an insecure development-only key is used with a warning if it's missing).

## Friendly to browser-using AI agents

The site is built so an AI agent driving a browser can order a cake the same way a person does (no MCP, no extra APIs):

- Semantic HTML: one `h1` per page, `header`, `nav`, `main`, `footer`, real links and buttons.
- Every field has a visible label with the right `type`, `inputmode` and `autocomplete`; errors are text next to the field.
- Buttons say what they do, e.g. "Add 8-inch Pistachio Rose to cart", "Quantity of Pistachio Rose, 8 inch", "Remove Pistachio Rose, 8 inch from cart". No hover-only, drag-only or icon-only controls, and no popups.
- Prices, sizes, lead time, the order number and the order status are plain text.
- schema.org JSON-LD: `Bakery` on every page and a `Product` with an `AggregateOffer` (one `Offer` per size, in USD) on each cake page.
- [`/llms.txt`](https://nextjs-cake-shop-grok-bot.vercel.app/llms.txt) explains the shop, prices, lead time, the ordering steps and the customiser URL parameters. It is generated from the catalogue and prerendered as a static file at build time.

### Spam protection (no CAPTCHA)

- **Honeypot:** the checkout form has a hidden `website` field (off-screen, `inert`, `aria-hidden`, `tabindex="-1"`, `autocomplete="off"`, labelled "Leave this field empty"). People and accessibility-tree based agents never see it. If it's filled in, the request is quietly dropped with a neutral message and no emails are sent.
- **Rate limit:** at most 3 order requests per 10 minutes, checked two ways: per client IP in the server's memory, and per browser in a signed HttpOnly cookie. This is best-effort. On Vercel each serverless instance has its own memory, so the IP limit is per instance, and clearing cookies resets the browser limit. A strict global limit would need a shared store such as KV.

## Tests

```bash
npx playwright install chromium   # once
npm run test:e2e                  # builds, starts a local production server and runs tests/
```

The tests run at 390 px against `next start` with a random throwaway `ORDER_SECRET` and empty Gmail variables, so emails are only logged (to `.playwright/server.log`). `tests/order-flow.spec.ts` drives the whole order flow using only `getByRole` and `getByLabel`, runs an axe accessibility check on every page (no serious or critical violations allowed), and tests the honeypot and the rate limit. `tests/structured-data.spec.ts` checks the JSON-LD and `/llms.txt`.

## Run it locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

Built with Next.js (App Router), TypeScript and Tailwind CSS. Pages: `/` (landing), `/services`, `/cakes` (catalogue), `/cakes/<slug>` (customiser; choices are kept in the URL), `/cart`, `/checkout`, `/order/<number>` (signed order page) `/order/<number>/accept` / `/decline` (bakery links) and `/llms.txt`.
Every image the site needs is listed with its generation prompt, file, size and alt text in
[`images/prompts.json`](images/prompts.json). The images were generated with Grok's built-in image generation
(no API keys or image scripts in this repo) and live in `public/images` as WebP files sized for phones.
They are rendered with `next/image` through `src/components/SiteImage.tsx`.

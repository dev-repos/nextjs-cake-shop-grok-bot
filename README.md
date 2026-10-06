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
- The order lives in **signed links**: the order is compact JSON (deflated, base64url) in `?d=`, and `?sig=` is an HMAC-SHA256 with `ORDER_SECRET` over the purpose (`view`, `accept` or `decline`), the order number and the data. A view link can't be used to accept or decline, and a link can't be moved to another order.
- **nodemailer** sends two emails through Gmail: to `BAKERY_EMAIL` with signed Accept / Decline links, and to the customer with a link to their order page. Without Gmail variables the emails are logged instead.

Local development: copy `.env.example` to `.env.local` and set `ORDER_SECRET` (in `next dev` an insecure development-only key is used with a warning if it's missing).

## Run it locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

Built with Next.js (App Router), TypeScript and Tailwind CSS. Pages: `/` (landing), `/services`, `/cakes` (catalogue), `/cakes/<slug>` (customiser; choices are kept in the URL), `/cart`, `/checkout` and `/order/<number>` (signed order page).
Every image the site needs is listed with its generation prompt, file, size and alt text in
[`images/prompts.json`](images/prompts.json). The images were generated with Grok's built-in image generation
(no API keys or image scripts in this repo) and live in `public/images` as WebP files sized for phones.
They are rendered with `next/image` through `src/components/SiteImage.tsx`.

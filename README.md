# nextjs-cake-shop-grok-bot
Frostwell Cakes: a mobile-first Next.js custom-cake shop built by Grok Bot from GitHub issues, driven from a phone, deployed to Vercel (AI System Design Deep Dive tutorial)

**Live site:** https://nextjs-cake-shop-grok-bot.vercel.app

## Deployment

The site is hosted on [Vercel](https://vercel.com) as the `nextjs-cake-shop-grok-bot` project, linked to this GitHub repo:

- **Production** deploys automatically from `main` to https://nextjs-cake-shop-grok-bot.vercel.app.
- **Preview** deployments are created automatically for every pull request; Vercel posts the preview link on the PR.
- The build needs no secrets or environment variables. If one is ever added, document it in `.env.example` only.

## Run it locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

Built with Next.js (App Router), TypeScript and Tailwind CSS. Pages: `/` (landing) and `/services`.
Every image the site needs is listed with its generation prompt, file, size and alt text in
[`images/prompts.json`](images/prompts.json). The images were generated with Grok's built-in image generation
(no API keys or image scripts in this repo) and live in `public/images` as WebP files sized for phones.
They are rendered with `next/image` through `src/components/SiteImage.tsx`.

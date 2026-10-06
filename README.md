# nextjs-cake-shop-grok-bot
Frostwell Cakes: a mobile-first Next.js custom-cake shop built by Grok Bot from GitHub issues, driven from a phone, deployed to Vercel (AI System Design Deep Dive tutorial)

## Run it locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

Built with Next.js (App Router), TypeScript and Tailwind CSS. Pages: `/` (landing) and `/services`.
Every image the site needs is listed with a generation prompt in [`images/prompts.json`](images/prompts.json);
until those are generated the pages show warm placeholder panels.

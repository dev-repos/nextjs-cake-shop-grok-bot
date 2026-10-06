import { expect, test } from "@playwright/test";
import { cakes, MIN_LEAD_DAYS, SIZES } from "../src/lib/cakes";

/* Structured data and /llms.txt, checked from the raw HTML/text that crawlers and agents receive. */

type Thing = Record<string, unknown> & { "@type": string };

function jsonLd(html: string): Thing[] {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
}

const pages = ["/", "/services", "/cakes", "/cart", "/checkout", ...cakes.map((c) => `/cakes/${c.slug}`)];

test("every page has one Bakery JSON-LD block", async ({ request }) => {
  for (const path of pages) {
    const data = jsonLd(await (await request.get(path)).text());
    const bakeries = data.filter((d) => d["@type"] === "Bakery");
    expect(bakeries, path).toHaveLength(1);
    const bakery = bakeries[0];
    expect(bakery["@context"]).toBe("https://schema.org");
    expect(bakery.name).toBe("Frostwell Cakes");
    expect(bakery.address).toMatchObject({ "@type": "PostalAddress", addressLocality: "Portland", addressRegion: "OR", addressCountry: "US" });
    expect(bakery.email).toBe("hello@frostwellcakes.example");
    expect(bakery.url).toMatch(/^https:\/\//);
    expect(bakery).not.toHaveProperty("aggregateRating");
  }
});

test("each cake page has a Product with one USD Offer per size", async ({ request }) => {
  for (const cake of cakes) {
    const data = jsonLd(await (await request.get(`/cakes/${cake.slug}`)).text());
    const product = data.find((d) => d["@type"] === "Product") as Thing;
    expect(product, cake.slug).toBeTruthy();
    expect(product.name).toBe(cake.name);
    const offers = product.offers as { "@type": string; priceCurrency: string; lowPrice: number; highPrice: number; offers: { price: number; priceCurrency: string; availability: string }[] };
    expect(offers["@type"]).toBe("AggregateOffer");
    expect(offers.priceCurrency).toBe("USD");
    expect(offers.lowPrice).toBe(cake.prices[6]);
    expect(offers.highPrice).toBe(cake.prices[10]);
    expect(offers.offers.map((o) => o.price)).toEqual(SIZES.map((s) => cake.prices[s.inches]));
    for (const offer of offers.offers) {
      expect(offer.priceCurrency).toBe("USD");
      expect(offer.availability).toBe("https://schema.org/MadeToOrder");
    }
    expect(product).not.toHaveProperty("aggregateRating");
    expect(product).not.toHaveProperty("review");
  }
});

test("/llms.txt explains the shop, prices and ordering", async ({ request }) => {
  const response = await request.get("/llms.txt");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/plain");
  const text = await response.text();
  expect(text).toMatch(/^# Frostwell Cakes/);
  expect(text).toContain(`at least ${MIN_LEAD_DAYS} days`);
  expect(text).toContain("PayPal invoice");
  expect(text).toContain("Awaiting confirmation");
  for (const cake of cakes) {
    expect(text).toContain(`${cake.name}](`);
    for (const size of SIZES) expect(text).toContain(`${size.inches} inch $${cake.prices[size.inches]}`);
  }
});

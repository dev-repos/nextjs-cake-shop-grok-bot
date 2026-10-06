import prompts from "../../images/prompts.json";
import { type Cake, MIN_LEAD_DAYS, SIZES } from "@/lib/cakes";
import { site } from "@/lib/site";
import { publicSiteUrl } from "@/lib/site-url";

/** schema.org JSON-LD for the shop and its cakes. Only facts that are also shown on the site. */

const imageUrl = (id: string) => {
  const file = prompts.images.find((image) => image.id === id)?.file ?? "";
  return publicSiteUrl() + file.replace(/^public/, "");
};

export function bakeryJsonLd() {
  const url = publicSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": `${url}/#bakery`,
    name: site.name,
    description: `${site.tagline} in ${site.city}. Every order is confirmed by email and paid by PayPal invoice.`,
    url,
    email: site.email,
    image: imageUrl("hero-cake"),
    priceRange: "$$",
    currenciesAccepted: "USD",
    paymentAccepted: "PayPal invoice",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Portland",
      addressRegion: "OR",
      addressCountry: "US",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
  };
}

export function cakeJsonLd(cake: Cake) {
  const url = `${publicSiteUrl()}/cakes/${cake.slug}`;
  const prices = SIZES.map((size) => cake.prices[size.inches]);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: cake.name,
    description: cake.details,
    image: imageUrl(cake.imageId),
    url,
    sku: cake.slug,
    category: "Custom cakes",
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: SIZES.length,
      offers: SIZES.map((size) => ({
        "@type": "Offer",
        name: `${size.inches} inch (${size.serves.toLowerCase()})`,
        sku: `${cake.slug}-${size.inches}in`,
        price: cake.prices[size.inches],
        priceCurrency: "USD",
        availability: "https://schema.org/MadeToOrder",
        url: `${url}?size=${size.inches}`,
        seller: { "@id": `${publicSiteUrl()}/#bakery` },
        deliveryLeadTime: { "@type": "QuantitativeValue", minValue: MIN_LEAD_DAYS, unitCode: "DAY" },
      })),
    },
  };
}

/** Serialise for a <script type="application/ld+json">, escaping "<" so it can't close the tag. */
export function jsonLdString(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

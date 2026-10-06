import { cakes, FLAVOURS, FROSTINGS, MESSAGE_MAX, MIN_LEAD_DAYS, SIZES } from "@/lib/cakes";
import { services, site, usd } from "@/lib/site";
import { publicSiteUrl } from "@/lib/site-url";

// Prerendered at build time into a static text file (no runtime code), generated from the catalogue so it stays in sync.
export const dynamic = "force-static";

export function GET() {
  const url = publicSiteUrl();
  const options = (list: typeof FLAVOURS) =>
    list.map((o) => `\`${o.id}\` (${o.name}${o.surcharge ? `, +${usd(o.surcharge)} unless it's the cake's signature` : ""})`).join(", ");

  const text = `# ${site.name}

> ${site.name} is a made-up custom-cake bakery in ${site.city}. Customers design a cake on this website, send an order request, and the bakery confirms it by email. Payment is by PayPal invoice after confirmation. There is no online payment, no account and no API: order through the web pages, like a person would.

All prices are in US dollars (USD). Pickup only, from our ${site.city} kitchen, ${site.hours}.
Lead time: order at least ${MIN_LEAD_DAYS} days before the pickup date.

## How to order

1. Open a cake page from ${url}/cakes and choose the size, flavour, frosting, an optional message (up to ${MESSAGE_MAX} characters) and a pickup date.
2. Press the "Add … to cart" button (for example "Add 8-inch Pistachio Rose to cart"). You can add several cakes; the cart is saved in this browser.
3. Open the cart at ${url}/cart to change quantities, then press "Continue to checkout".
4. On ${url}/checkout fill in Name, Phone, Email, Pickup date and optional Notes, then press "Send order request".
5. You land on your order page, which shows the order number (like FW-7KQ2MX) and the status "Awaiting confirmation". The customer also gets an email with this link.
6. The bakery confirms or declines by email. When confirmed, the order page link in that email shows "Confirmed" and a PayPal invoice in US dollars follows. Nothing is paid on this website.

## Cakes and prices

${cakes
  .map(
    (cake) =>
      `- [${cake.name}](${url}/cakes/${cake.slug}): ${cake.description} ${SIZES.map((s) => `${s.inches} inch ${usd(cake.prices[s.inches])}`).join(", ")}.`,
  )
  .join("\n")}

Sizes: ${SIZES.map((s) => `${s.inches} inch (${s.serves.toLowerCase()})`).join(", ")}.

## Customiser URL parameters

A cake page can be opened with choices already filled in, for example:
${url}/cakes/pistachio-rose?size=8&flavour=pistachio&frosting=vanilla-buttercream&message=Happy%20birthday&date=YYYY-MM-DD

- \`size\`: ${SIZES.map((s) => `\`${s.inches}\``).join(", ")}
- \`flavour\`: ${options(FLAVOURS)}
- \`frosting\`: ${options(FROSTINGS)}
- \`message\`: text on top of the cake, up to ${MESSAGE_MAX} characters (optional)
- \`date\`: pickup date as YYYY-MM-DD, at least ${MIN_LEAD_DAYS} days ahead

Unknown values fall back to the cake's defaults. Prices are always calculated by the bakery, not taken from the URL.

## Other services (quoted by email)

${services.map((s) => `- ${s.name}: from ${usd(s.from)}${s.unit ? ` ${s.unit}` : ""}. ${s.summary}`).join("\n")}

See ${url}/services.

## Pages

- [Home](${url}/)
- [All cakes](${url}/cakes)
- [Services and prices](${url}/services)
- [Cart](${url}/cart)
- [Checkout](${url}/checkout)

## Contact

Email ${site.email}. Pickup hours ${site.hours}, ${site.city}.

## Notes for automated agents

- Use the visible labels and button names; every field has a label and every button says what it does.
- Please don't send test or bulk orders: each order request emails a real bakery. Order requests are rate limited.
`;

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

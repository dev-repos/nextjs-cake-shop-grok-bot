export const site = {
  name: "Frostwell Cakes",
  tagline: "Custom cakes, baked to order",
  email: "hello@frostwellcakes.example",
  city: "Portland, Oregon",
  hours: "Tue–Sat, 9am–5pm",
};

/** Format a whole-dollar amount as US dollars, e.g. 65 -> "$65". */
export function usd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const orderSteps = [
  {
    title: "You design your cake",
    body: "Pick a cake, choose the size, flavour and frosting, and add a message on top. Tell us your pickup date.",
  },
  {
    title: "We confirm it by email",
    body: "A real baker reads every request and emails you within one working day to confirm the details and the price.",
  },
  {
    title: "You pay by PayPal invoice",
    body: "Once you're happy, we send a PayPal invoice. No online checkout and nothing to pay until your order is confirmed.",
  },
];

export const reviews = [
  {
    quote:
      "The raspberry chocolate torte was the star of my daughter's birthday. Ordering was easy and the email confirmation put my mind at rest.",
    name: "Priya S.",
    occasion: "Birthday",
  },
  {
    quote:
      "Our wedding cake looked exactly like we pictured and tasted even better. Guests are still asking where it came from.",
    name: "Daniel & Maya R.",
    occasion: "Wedding",
  },
  {
    quote:
      "We order cupcakes for every team launch. Always on time, always beautiful, and paying by PayPal invoice is simple for our finance team.",
    name: "Jordan L.",
    occasion: "Corporate",
  },
];

export type Service = {
  slug: string;
  name: string;
  summary: string;
  included: string[];
  from: number;
  unit?: string;
  imageId: string;
};

export const services: Service[] = [
  {
    slug: "birthday",
    name: "Birthday cakes",
    summary: "A cake made around the person you're celebrating, from first birthdays to ninetieths.",
    included: [
      "6, 8 or 10 inch round cake (serves 8–30)",
      "Your choice of flavour, filling and frosting",
      "Hand-piped message on top, up to 40 characters",
      "Candles and a sturdy gift box",
    ],
    from: 65,
    imageId: "service-birthday",
  },
  {
    slug: "wedding",
    name: "Wedding cakes",
    summary: "Tiered showpiece cakes designed with you, down to the last sugar flower.",
    included: [
      "Design consultation and a tasting box for two",
      "Two to four tiers (serves 50–150)",
      "Fresh or sugar flowers to match your colours",
      "Delivery and set-up at your venue",
    ],
    from: 450,
    imageId: "service-wedding",
  },
  {
    slug: "corporate",
    name: "Corporate cakes",
    summary: "Celebration cakes for launches, milestones and team gatherings.",
    included: [
      "Sheet or tiered cakes (serves 20–100)",
      "Colours matched to your brand palette",
      "Individually boxed slices on request",
      "One PayPal invoice for easy expensing",
    ],
    from: 120,
    imageId: "service-corporate",
  },
  {
    slug: "cupcakes",
    name: "Cupcakes",
    summary: "Swirled, topped and boxed by the dozen, in up to three flavours.",
    included: [
      "A dozen cupcakes, up to three flavours",
      "Tall piped buttercream swirls",
      "Toppers such as fresh fruit, chocolate or sprinkles",
      "Gift box with a window lid",
    ],
    from: 36,
    unit: "per dozen",
    imageId: "service-cupcakes",
  },
  {
    slug: "dessert-tables",
    name: "Dessert tables",
    summary: "A styled spread of sweets for parties, showers and events.",
    included: [
      "Centrepiece cake plus four dessert types",
      "Macarons, mini tarts, cake pops or mousse cups",
      "Stands, linen and styling in your colours",
      "Set-up and pack-down for up to 50 guests",
    ],
    from: 350,
    imageId: "service-dessert-table",
  },
];

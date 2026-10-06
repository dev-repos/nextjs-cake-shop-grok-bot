/**
 * Cake catalogue and customiser pricing. Pure data and helpers, safe to use
 * from both Server and Client Components.
 */

export const SIZES = [
  { inches: 6, serves: "Serves 8–10" },
  { inches: 8, serves: "Serves 14–18" },
  { inches: 10, serves: "Serves 24–30" },
] as const;

export type SizeInches = (typeof SIZES)[number]["inches"];

export type Option = {
  id: string;
  name: string;
  /** Extra cost in US dollars, waived when it is the cake's signature choice. */
  surcharge: number;
};

export const FLAVOURS: Option[] = [
  { id: "vanilla-bean", name: "Vanilla bean", surcharge: 0 },
  { id: "dark-chocolate", name: "Dark chocolate", surcharge: 0 },
  { id: "red-velvet", name: "Red velvet", surcharge: 0 },
  { id: "lemon", name: "Lemon", surcharge: 0 },
  { id: "salted-caramel", name: "Salted caramel", surcharge: 6 },
  { id: "pistachio", name: "Pistachio", surcharge: 8 },
];

export const FROSTINGS: Option[] = [
  { id: "vanilla-buttercream", name: "Vanilla buttercream", surcharge: 0 },
  { id: "chocolate-buttercream", name: "Chocolate buttercream", surcharge: 0 },
  { id: "cream-cheese", name: "Cream cheese", surcharge: 0 },
  { id: "raspberry-buttercream", name: "Raspberry buttercream", surcharge: 0 },
  { id: "caramel-buttercream", name: "Salted caramel buttercream", surcharge: 6 },
  { id: "mirror-glaze", name: "Chocolate mirror glaze", surcharge: 10 },
];

export const MESSAGE_MAX = 40;
export const MIN_LEAD_DAYS = 3;

export type Cake = {
  slug: string;
  name: string;
  description: string;
  details: string;
  imageId: string;
  /** Price in US dollars for each size. */
  prices: Record<SizeInches, number>;
  signatureFlavour: string;
  signatureFrosting: string;
};

export const cakes: Cake[] = [
  {
    slug: "raspberry-chocolate-torte",
    name: "Raspberry Chocolate Torte",
    description: "Dark chocolate sponge, raspberry jam and a glossy mirror glaze.",
    details:
      "Our best seller: rich dark chocolate sponge layered with tart raspberry jam, finished with a mirror glaze and a crown of fresh raspberries.",
    imageId: "featured-raspberry-chocolate-torte",
    prices: { 6: 58, 8: 78, 10: 98 },
    signatureFlavour: "dark-chocolate",
    signatureFrosting: "mirror-glaze",
  },
  {
    slug: "vanilla-bean-berries",
    name: "Vanilla Bean & Berries",
    description: "Light vanilla layers, whipped cream and a pile of summer fruit.",
    details:
      "Soft vanilla bean sponge with whipped vanilla cream and berry compote, piled high with strawberries, raspberries and blueberries.",
    imageId: "featured-vanilla-berry",
    prices: { 6: 52, 8: 72, 10: 92 },
    signatureFlavour: "vanilla-bean",
    signatureFrosting: "vanilla-buttercream",
  },
  {
    slug: "salted-caramel-drip",
    name: "Salted Caramel Drip",
    description: "Milk chocolate frosting, salted caramel drip and caramel brittle.",
    details:
      "Chocolate sponge under a salted caramel buttercream, finished with a glossy caramel drip, caramel shards and chocolate truffles.",
    imageId: "featured-salted-caramel-drip",
    prices: { 6: 60, 8: 80, 10: 100 },
    signatureFlavour: "dark-chocolate",
    signatureFrosting: "caramel-buttercream",
  },
  {
    slug: "lemon-elderflower",
    name: "Lemon Elderflower",
    description: "Zesty lemon sponge, elderflower cream and edible flowers.",
    details:
      "Bright lemon sponge with elderflower-scented cream, covered in ivory buttercream and finished with edible flowers and candied lemon.",
    imageId: "featured-lemon-elderflower",
    prices: { 6: 55, 8: 75, 10: 95 },
    signatureFlavour: "lemon",
    signatureFrosting: "vanilla-buttercream",
  },
  {
    slug: "pistachio-rose",
    name: "Pistachio Rose",
    description: "Pistachio sponge and buttercream with rose petals and raspberries.",
    details:
      "Nutty pistachio sponge and pale green pistachio buttercream, scattered with chopped pistachios, dried rose petals and fresh raspberries.",
    imageId: "cake-pistachio-rose",
    prices: { 6: 62, 8: 82, 10: 104 },
    signatureFlavour: "pistachio",
    signatureFrosting: "vanilla-buttercream",
  },
  {
    slug: "classic-red-velvet",
    name: "Classic Red Velvet",
    description: "Red velvet layers with tangy cream cheese frosting.",
    details:
      "Three tender red velvet layers sandwiched with tangy cream cheese frosting, edged with red velvet crumbs and topped with piped rosettes and raspberries.",
    imageId: "cake-red-velvet",
    prices: { 6: 54, 8: 74, 10: 94 },
    signatureFlavour: "red-velvet",
    signatureFrosting: "cream-cheese",
  },
];

export function getCake(slug: string): Cake | undefined {
  return cakes.find((cake) => cake.slug === slug);
}

export function fromPrice(cake: Cake): number {
  return cake.prices[6];
}

/** Surcharge for an option on this cake (signature choices are included). */
export function surchargeFor(option: Option, signatureId: string): number {
  return option.id === signatureId ? 0 : option.surcharge;
}

export type Choices = {
  size: SizeInches;
  flavour: string;
  frosting: string;
  message: string;
  /** Raw pickup date from the URL, YYYY-MM-DD, or "" if none or malformed. */
  date: string;
};

type ParamReader = { get(name: string): string | null };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/**
 * Read choices from URL search params. Unknown or malformed values fall back
 * to the cake's defaults; the message is trimmed to MESSAGE_MAX characters.
 */
export function parseChoices(cake: Cake, params: ParamReader): Choices {
  const sizeParam = Number(params.get("size"));
  const size = (SIZES.find((s) => s.inches === sizeParam)?.inches ?? 6) as SizeInches;
  const flavourParam = params.get("flavour") ?? "";
  const frostingParam = params.get("frosting") ?? "";
  const dateParam = params.get("date") ?? "";
  return {
    size,
    flavour: FLAVOURS.some((f) => f.id === flavourParam) ? flavourParam : cake.signatureFlavour,
    frosting: FROSTINGS.some((f) => f.id === frostingParam)
      ? frostingParam
      : cake.signatureFrosting,
    message: (params.get("message") ?? "").slice(0, MESSAGE_MAX),
    date: isRealDate(dateParam) ? dateParam : "",
  };
}

/** Build the query string for a set of choices (empty message/date are omitted). */
export function choicesToQuery(choices: Choices): string {
  const query = new URLSearchParams();
  query.set("size", String(choices.size));
  query.set("flavour", choices.flavour);
  query.set("frosting", choices.frosting);
  if (choices.message) query.set("message", choices.message);
  if (choices.date) query.set("date", choices.date);
  return query.toString();
}

export type PriceBreakdown = {
  base: number;
  flavour: number;
  frosting: number;
  total: number;
};

export function priceFor(cake: Cake, choices: Choices): PriceBreakdown {
  const flavour = FLAVOURS.find((f) => f.id === choices.flavour);
  const frosting = FROSTINGS.find((f) => f.id === choices.frosting);
  const base = cake.prices[choices.size];
  const flavourCost = flavour ? surchargeFor(flavour, cake.signatureFlavour) : 0;
  const frostingCost = frosting ? surchargeFor(frosting, cake.signatureFrosting) : 0;
  return { base, flavour: flavourCost, frosting: frostingCost, total: base + flavourCost + frostingCost };
}

/** Local calendar date as YYYY-MM-DD, offset by a number of days. */
export function localIsoDate(from: Date, addDays = 0): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + addDays);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Human-friendly date, e.g. "Fri, Oct 9, 2026". */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

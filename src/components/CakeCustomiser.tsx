"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import {
  type Cake,
  type Choices,
  choicesToQuery,
  FLAVOURS,
  formatDate,
  FROSTINGS,
  getCake,
  localIsoDate,
  MESSAGE_MAX,
  MIN_LEAD_DAYS,
  type Option,
  parseChoices,
  priceFor,
  SIZES,
  type SizeInches,
  surchargeFor,
} from "@/lib/cakes";
import { addToCart as addLineToCart } from "@/lib/cart";
import { usd } from "@/lib/site";

const noopSubscribe = () => () => {};

/** Earliest pickup date (today + MIN_LEAD_DAYS), computed in the browser only. */
function useMinPickupDate(): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => localIsoDate(new Date(), MIN_LEAD_DAYS),
    () => "",
  );
}

export function CakeCustomiser({ slug }: { slug: string }) {
  const cake = getCake(slug) as Cake;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [choices, setChoices] = useState<Choices>(() => parseChoices(cake, searchParams));
  const [notice, setNotice] = useState("");
  const [added, setAdded] = useState(false);
  const minDate = useMinPickupDate();
  const ids = { message: useId(), date: useId(), counter: useId(), dateHelp: useId() };

  // Keep the URL in sync with the choices so the design survives reloads and can
  // be shared. This also tidies up unknown or malformed values from the URL.
  useEffect(() => {
    const query = choicesToQuery(choices);
    if (query !== window.location.search.slice(1)) {
      window.history.replaceState(null, "", `${pathname}?${query}`);
    }
  }, [choices, pathname]);

  const update = (patch: Partial<Choices>) => {
    setNotice("");
    setAdded(false);
    setChoices((current) => ({ ...current, ...patch }));
  };

  const price = priceFor(cake, choices);
  const dateTooEarly = Boolean(choices.date && minDate && choices.date < minDate);
  const dateError = dateTooEarly
    ? `Pickup needs at least ${MIN_LEAD_DAYS} days' notice. The earliest date is ${formatDate(minDate)}.`
    : "";
  const flavour = FLAVOURS.find((f) => f.id === choices.flavour) as Option;
  // A specific, self-describing button name, e.g. "Add 8-inch Pistachio Rose to cart".
  const addLabel = `Add ${choices.size}-inch ${cake.name} to cart`;
  const frosting = FROSTINGS.find((f) => f.id === choices.frosting) as Option;

  const addToCart = () => {
    if (!choices.date) {
      setNotice("Choose a pickup date first.");
      document.getElementById(ids.date)?.focus();
      return;
    }
    if (dateTooEarly) {
      setNotice(dateError);
      document.getElementById(ids.date)?.focus();
      return;
    }
    addLineToCart(cake.slug, choices);
    setNotice("");
    setAdded(true);
  };

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <Fieldset legend="Size">
        <div className="grid grid-cols-3 gap-2.5">
          {SIZES.map((size) => (
            <ChoiceCard
              key={size.inches}
              name="size"
              value={String(size.inches)}
              checked={choices.size === size.inches}
              onChange={() => update({ size: size.inches as SizeInches })}
              title={`${size.inches} inch`}
              subtitle={size.serves}
              aside={usd(cake.prices[size.inches])}
            />
          ))}
        </div>
      </Fieldset>

      <Fieldset legend="Flavour" hint="The sponge inside your cake.">
        <OptionGrid
          name="flavour"
          options={FLAVOURS}
          selected={choices.flavour}
          signature={cake.signatureFlavour}
          onChange={(id) => update({ flavour: id })}
        />
      </Fieldset>

      <Fieldset legend="Frosting" hint="What covers and fills your cake.">
        <OptionGrid
          name="frosting"
          options={FROSTINGS}
          selected={choices.frosting}
          signature={cake.signatureFrosting}
          onChange={(id) => update({ frosting: id })}
        />
      </Fieldset>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-cocoa-900/5">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={ids.message} className="text-lg font-semibold text-cocoa-900">
            Message on top <span className="text-sm font-normal text-cocoa-500">(optional)</span>
          </label>
          <span
            id={ids.counter}
            aria-live="polite"
            className={`text-sm tabular-nums ${
              choices.message.length >= MESSAGE_MAX ? "font-semibold text-raspberry-700" : "text-cocoa-500"
            }`}
          >
            {choices.message.length}/{MESSAGE_MAX}
          </span>
        </div>
        <input
          id={ids.message}
          type="text"
          autoComplete="off"
          autoCapitalize="sentences"
          enterKeyHint="done"
          value={choices.message}
          maxLength={MESSAGE_MAX}
          onChange={(event) => update({ message: event.target.value.slice(0, MESSAGE_MAX) })}
          aria-describedby={ids.counter}
          placeholder="Happy birthday, Sam!"
          className="mt-3 block min-h-12 w-full rounded-2xl border border-cocoa-900/20 bg-cream-50 px-4 text-base text-cocoa-900 placeholder:text-cocoa-500/70 focus:border-raspberry-600 focus:outline-2 focus:outline-offset-1 focus:outline-raspberry-600"
        />
        <p className="mt-2 text-sm text-cocoa-500">Hand-piped in chocolate, up to {MESSAGE_MAX} characters.</p>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-cocoa-900/5">
        <label htmlFor={ids.date} className="text-lg font-semibold text-cocoa-900">
          Pickup date
        </label>
        <input
          id={ids.date}
          type="date"
          value={choices.date}
          min={minDate || undefined}
          required
          onChange={(event) => update({ date: event.target.value })}
          aria-invalid={dateTooEarly || undefined}
          aria-describedby={ids.dateHelp}
          className={`mt-3 block min-h-12 w-full rounded-2xl border bg-cream-50 px-4 text-base text-cocoa-900 focus:outline-2 focus:outline-offset-1 focus:outline-raspberry-600 ${
            dateTooEarly ? "border-raspberry-600" : "border-cocoa-900/20"
          }`}
        />
        <p
          id={ids.dateHelp}
          className={`mt-2 text-sm ${dateTooEarly ? "font-medium text-raspberry-700" : "text-cocoa-500"}`}
        >
          {dateError ||
            (minDate
              ? `We need ${MIN_LEAD_DAYS} days to bake. The earliest pickup is ${formatDate(minDate)}.`
              : `We need ${MIN_LEAD_DAYS} days to bake.`)}
        </p>
      </section>

      <section
        aria-labelledby="price-heading"
        className="rounded-3xl bg-cocoa-900 p-5 text-cream-50 shadow-sm lg:sticky lg:top-20"
      >
        <h2 id="price-heading" className="text-lg font-semibold">
          Your cake
        </h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label={`${cake.name}, ${choices.size} inch`} value={usd(price.base)} />
          <Row label={`${flavour.name} sponge`} value={price.flavour ? `+${usd(price.flavour)}` : "Included"} />
          <Row label={frosting.name} value={price.frosting ? `+${usd(price.frosting)}` : "Included"} />
          <Row
            label={choices.message ? `Message: “${choices.message}”` : "No message"}
            value="Included"
          />
          <Row
            label={
              choices.date && !dateTooEarly ? `Pickup ${formatDate(choices.date)}` : "Pickup date not set"
            }
            value=""
          />
        </dl>
        <div className="mt-4 flex items-baseline justify-between border-t border-cream-50/15 pt-4">
          <span className="font-semibold">Total</span>
          <span className="font-display text-3xl font-semibold" aria-live="polite">
            {usd(price.total)}
          </span>
        </div>
        <p className="mt-1 text-xs text-cream-200/70">
          Confirmed by email, then paid by PayPal invoice. No payment now.
        </p>
        <div className="mt-4 hidden lg:block">
          <AddToCartButton onClick={addToCart} label={addLabel} />
          <Notice text={notice} added={added} tone="dark" />
        </div>
      </section>

      {/* Phone: sticky bar at the bottom of the screen. It sits in the page flow,
          so it never covers the footer or the last field. */}
      <div className="sticky bottom-0 z-10 -mx-5 border-t border-cocoa-900/10 bg-cream-50/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(44,26,17,0.25)] backdrop-blur lg:hidden">
        <Notice text={notice} added={added} tone="light" />
        <div className="mb-2 flex items-baseline justify-between gap-4">
          <p className="min-w-0 text-sm text-cocoa-700">
            {choices.size} inch · {flavour.name} · {frosting.name}
          </p>
          <p className="shrink-0 font-display text-2xl font-semibold text-cocoa-900">{usd(price.total)}</p>
        </div>
        <AddToCartButton onClick={addToCart} label={addLabel} />
      </div>
    </div>
  );
}

function Fieldset({
  legend,
  hint,
  children,
}: {
  legend: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-cocoa-900/5">
      <legend className="float-left w-full text-lg font-semibold text-cocoa-900">{legend}</legend>
      {hint ? <p className="clear-left pt-0.5 text-sm text-cocoa-500">{hint}</p> : null}
      <div className="clear-left pt-3">{children}</div>
    </fieldset>
  );
}

function OptionGrid({
  name,
  options,
  selected,
  signature,
  onChange,
}: {
  name: string;
  options: Option[];
  selected: string;
  signature: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {options.map((option) => {
        const extra = surchargeFor(option, signature);
        return (
          <ChoiceCard
            key={option.id}
            name={name}
            value={option.id}
            checked={selected === option.id}
            onChange={() => onChange(option.id)}
            title={option.name}
            subtitle={option.id === signature ? "Signature" : undefined}
            aside={extra ? `+${usd(extra)}` : "Included"}
          />
        );
      })}
    </div>
  );
}

function ChoiceCard({
  name,
  value,
  checked,
  onChange,
  title,
  subtitle,
  aside,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  subtitle?: string;
  aside: string;
}) {
  return (
    <label className="relative flex min-h-16 cursor-pointer flex-col justify-between rounded-2xl border border-cocoa-900/15 bg-cream-50 p-3 text-cocoa-900 transition hover:border-raspberry-600/60 has-checked:border-raspberry-600 has-checked:bg-raspberry-100 has-checked:ring-1 has-checked:ring-raspberry-600 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-raspberry-600">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        // A clean name for assistive tech and browser agents, e.g. "8 inch, Serves 14–18, $82".
        aria-label={[title, subtitle, aside].filter(Boolean).join(", ")}
        // The (transparent) radio covers the whole card, so a click or tap anywhere on the card,
        // including one aimed at the radio's own position by a browser agent, lands on the radio itself.
        className="absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none rounded-2xl opacity-0"
      />
      <span className="text-sm leading-snug font-semibold">{title}</span>
      {subtitle ? (
        // Word joiner after the dash keeps ranges like "14–18" on one line.
        <span className="text-xs text-cocoa-500">{subtitle.replace("–", "–\u2060")}</span>
      ) : null}
      <span
        className={`mt-1 text-sm ${aside.startsWith("+") || aside.startsWith("$") ? "font-semibold text-raspberry-700" : "text-cocoa-500"}`}
      >
        {aside}
      </span>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="min-w-0 [overflow-wrap:anywhere] text-cream-200/85">{label}</dt>
      <dd className="shrink-0 font-medium">{value}</dd>
    </div>
  );
}

function AddToCartButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-12 w-full items-center justify-center rounded-full bg-raspberry-600 px-6 py-2 text-center leading-snug font-semibold text-white shadow-lg shadow-raspberry-600/25 transition hover:bg-raspberry-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-raspberry-600"
    >
      {label}
    </button>
  );
}

function Notice({ text, added, tone }: { text: string; added: boolean; tone: "light" | "dark" }) {
  const visible = Boolean(text) || added;
  return (
    <p
      role="status"
      aria-live="polite"
      className={
        visible
          ? `mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-2xl px-3 py-2 text-sm ${
              tone === "dark" ? "mt-3 bg-cream-50/10 text-cream-50" : "bg-raspberry-100 text-raspberry-700"
            }`
          : "sr-only"
      }
    >
      {added ? (
        <>
          <span className="font-medium">Added to your cart.</span>
          <Link href="/cart" className="font-semibold underline underline-offset-2">
            View cart →
          </Link>
        </>
      ) : (
        text
      )}
    </p>
  );
}

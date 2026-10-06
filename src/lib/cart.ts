"use client";

/**
 * Cart saved on the device (localStorage). Read through useSyncExternalStore so
 * the server render and first client render agree (the cart is `null` until
 * the browser has loaded it), and kept in sync across tabs.
 */
import { useSyncExternalStore } from "react";
import { type Choices, choicesToQuery, getCake, parseChoices, priceFor } from "@/lib/cakes";
import { MAX_LINES, MAX_QTY } from "@/lib/order-config";

const STORAGE_KEY = "frostwell-cart-v1";

export type CartLine = {
  /** Same cake + options = same line. */
  id: string;
  slug: string;
  choices: Choices;
  qty: number;
};

type StoredLine = { slug: string; choices: Partial<Record<keyof Choices, unknown>>; qty: number };

const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedLines: CartLine[] = EMPTY;

function lineId(slug: string, choices: Choices): string {
  return `${slug}?${choicesToQuery({ ...choices, date: "" })}`;
}

/** Rebuild lines from storage, dropping anything that isn't a valid cake/option. */
function sanitize(raw: string | null): CartLine[] {
  if (!raw) return EMPTY;
  try {
    const stored = JSON.parse(raw) as StoredLine[];
    if (!Array.isArray(stored)) return EMPTY;
    const lines: CartLine[] = [];
    for (const item of stored.slice(0, MAX_LINES)) {
      const cake = item && typeof item.slug === "string" ? getCake(item.slug) : undefined;
      if (!cake) continue;
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(item.choices ?? {})) {
        if (typeof value === "string" || typeof value === "number") params.set(key, String(value));
      }
      const choices = parseChoices(cake, params);
      const qty = Math.min(MAX_QTY, Math.max(1, Math.floor(Number(item.qty)) || 1));
      lines.push({ id: lineId(cake.slug, choices), slug: cake.slug, choices, qty });
    }
    return lines;
  } catch {
    return EMPTY;
  }
}

function read(): CartLine[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedLines = sanitize(raw);
  }
  return cachedLines;
}

function write(lines: CartLine[]) {
  const stored: StoredLine[] = lines.map(({ slug, choices, qty }) => ({ slug, choices, qty }));
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage full or blocked (e.g. some private modes): keep working in memory.
    cachedRaw = JSON.stringify(stored);
    cachedLines = lines;
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The cart lines, or `null` before the browser has loaded the cart. */
export function useCart(): CartLine[] | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function addToCart(slug: string, choices: Choices, qty = 1) {
  const lines = read();
  const id = lineId(slug, choices);
  const existing = lines.find((line) => line.id === id);
  if (existing) {
    write(
      lines.map((line) =>
        line.id === id
          ? { ...line, choices, qty: Math.min(MAX_QTY, line.qty + qty) }
          : line,
      ),
    );
  } else {
    write([...lines, { id, slug, choices, qty }].slice(-MAX_LINES));
  }
}

export function setQuantity(id: string, qty: number) {
  write(read().map((line) => (line.id === id ? { ...line, qty: Math.min(MAX_QTY, Math.max(1, qty)) } : line)));
}

export function removeFromCart(id: string) {
  write(read().filter((line) => line.id !== id));
}

export function clearCart() {
  write([]);
}

export function lineUnitPrice(line: CartLine): number {
  const cake = getCake(line.slug);
  return cake ? priceFor(cake, line.choices).total : 0;
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + lineUnitPrice(line) * line.qty, 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

export function customiseHref(line: CartLine): string {
  return `/cakes/${line.slug}?${choicesToQuery(line.choices)}`;
}

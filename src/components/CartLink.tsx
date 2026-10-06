"use client";

import Link from "next/link";
import { cartCount, useCart } from "@/lib/cart";

/** Header cart link with a visible text label and the item count as plain text. */
export function CartLink() {
  const lines = useCart();
  const count = lines ? cartCount(lines) : 0;

  return (
    <Link
      href="/cart"
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-cocoa-800 max-[359px]:gap-1 max-[359px]:px-1.5 hover:bg-cream-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-raspberry-600 sm:px-3"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="hidden h-5 w-5 sm:block" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z" />
        <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
      </svg>
      <span>Cart</span>
      {count > 0 ? (
        <span className="rounded-full bg-raspberry-600 px-2 font-semibold max-[359px]:px-1.5 text-white tabular-nums">
          {count}
          <span className="sr-only">{count === 1 ? " item" : " items"}</span>
        </span>
      ) : null}
    </Link>
  );
}

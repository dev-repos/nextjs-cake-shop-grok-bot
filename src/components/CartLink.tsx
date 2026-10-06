"use client";

import Link from "next/link";
import { cartCount, useCart } from "@/lib/cart";

export function CartLink() {
  const lines = useCart();
  const count = lines ? cartCount(lines) : 0;
  const label = count === 1 ? "Cart, 1 item" : `Cart, ${count} items`;

  return (
    <Link
      href="/cart"
      aria-label={lines ? label : "Cart"}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-cocoa-800 hover:bg-cream-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-raspberry-600"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z" />
        <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
      </svg>
      {/* Decorative badge: the count is already in the link's aria-label. */}
      {count > 0 ? (
        <span aria-hidden="true" className="absolute top-0 right-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-raspberry-600 px-1 text-[11px] font-bold text-white tabular-nums">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

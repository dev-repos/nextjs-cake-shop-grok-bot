"use client";

import Link from "next/link";
import { CartLines } from "@/components/CartLines";
import { cartCount, cartTotal, useCart } from "@/lib/cart";
import { NO_PAYMENT_NOTE } from "@/lib/order-config";
import { usd } from "@/lib/site";

export function CartView() {
  const lines = useCart();

  if (lines === null) {
    return <div aria-hidden="true" className="mt-6 h-48 animate-pulse rounded-3xl bg-cream-100" />;
  }

  if (lines.length === 0) {
    return (
      <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-cocoa-900/5">
        <p className="text-lg font-semibold text-cocoa-900">Your cart is empty</p>
        <p className="mt-1 text-cocoa-700">Pick a cake and make it your own.</p>
        <Link
          href="/cakes"
          className="mt-5 inline-flex min-h-12 items-center rounded-full bg-raspberry-600 px-6 font-semibold text-white hover:bg-raspberry-700"
        >
          Browse cakes
        </Link>
      </div>
    );
  }

  const count = cartCount(lines);
  const total = cartTotal(lines);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
      <section aria-label="Cakes in your cart" className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-cocoa-900/5">
        <CartLines lines={lines} editable />
      </section>
      <aside className="rounded-3xl bg-cocoa-900 p-5 text-cream-50 lg:sticky lg:top-20">
        <h2 className="text-lg font-semibold">Summary</h2>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-cream-200/85">
            {count} {count === 1 ? "cake" : "cakes"}
          </span>
          <span className="font-display text-3xl font-semibold tabular-nums">{usd(total)}</span>
        </div>
        <p className="mt-2 text-sm text-cream-200/80">{NO_PAYMENT_NOTE}</p>
        <Link
          href="/checkout"
          className="mt-5 flex min-h-12 items-center justify-center rounded-full bg-raspberry-600 px-6 font-semibold text-white hover:bg-raspberry-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-raspberry-300"
        >
          Continue to checkout
        </Link>
        <Link href="/cakes" className="mt-3 block text-center text-sm text-cream-200/85 hover:underline">
          Add another cake
        </Link>
      </aside>
    </div>
  );
}

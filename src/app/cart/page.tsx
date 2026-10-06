import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-8 pb-14 md:pt-12 md:pb-20">
      <h1 className="font-display text-4xl font-semibold text-cocoa-900">Your cart</h1>
      <CartView />
    </div>
  );
}

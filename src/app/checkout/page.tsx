import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-8 pb-14 md:pt-12 md:pb-20">
      <h1 className="font-display text-4xl font-semibold text-cocoa-900">Order request</h1>
      <p className="mt-2 max-w-xl text-cocoa-700">
        Tell us who you are and when you&apos;d like to pick up. A baker will check your request and email you.
      </p>
      <CheckoutForm />
    </div>
  );
}

import type { Metadata } from "next";
import { OrderLinkError, OrderSummary } from "@/components/OrderSummary";
import { verifyOrderLink } from "@/lib/server/order-token";

export const metadata: Metadata = {
  title: "Accept order",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/**
 * Bakery's accept link. The signature is checked here; the accept flow itself
 * arrives in step 6.
 */
export default async function AcceptPage({ params, searchParams }: PageProps<"/order/[number]/accept">) {
  const { number } = await params;
  const query = await searchParams;
  const result = verifyOrderLink("accept", number, first(query.d), first(query.sig));

  return (
    <div className="mx-auto max-w-3xl px-5 pt-8 pb-14 md:pt-12 md:pb-20">
      <p className="text-sm font-medium text-cocoa-500">For the bakery</p>
      <h1 className="font-display text-4xl font-semibold text-cocoa-900">Accept order{result.ok ? ` ${result.order.n}` : ""}</h1>
      {!result.ok ? (
        <OrderLinkError reason={result.reason} />
      ) : (
        <>
          <p role="status" className="mt-4 rounded-2xl bg-cream-100 p-4 text-cocoa-800">
            <strong>Link verified.</strong> This is the signed accept link for order {result.order.n}. The{" "}
            “Confirm this order” step is coming in the next update (step 6).
          </p>
          <div className="mt-6">
            <OrderSummary order={result.order} />
          </div>
        </>
      )}
    </div>
  );
}

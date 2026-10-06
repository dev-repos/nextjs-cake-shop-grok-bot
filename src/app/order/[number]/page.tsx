import type { Metadata } from "next";
import Link from "next/link";
import { OrderLinkError, OrderSummary } from "@/components/OrderSummary";
import { formatDate } from "@/lib/cakes";
import { NO_PAYMENT_NOTE } from "@/lib/order-config";
import { verifyOrderLink } from "@/lib/server/order-token";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function OrderPage({ params, searchParams }: PageProps<"/order/[number]">) {
  const { number } = await params;
  const query = await searchParams;
  const result = verifyOrderLink("view", number, first(query.d), first(query.sig));

  return (
    <div className="mx-auto max-w-3xl px-5 pt-8 pb-14 md:pt-12 md:pb-20">
      <p className="text-sm font-medium text-cocoa-500">Order request</p>
      <h1 className="font-display text-4xl font-semibold text-cocoa-900">{result.ok ? result.order.n : "Order"}</h1>
      {!result.ok ? (
        <OrderLinkError reason={result.reason} />
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900 ring-1 ring-amber-300">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-amber-500" />
              Awaiting confirmation
            </span>
            <span className="text-sm text-cocoa-700">Pickup {formatDate(result.order.d)}</span>
          </div>
          <p className="mt-4 text-cocoa-700">
            Thanks, {result.order.c.n}! We&apos;ve got your request and emailed you a copy. Keep this page&apos;s link: it&apos;s
            your order page.
          </p>

          <section aria-labelledby="next-steps" className="mt-6 rounded-3xl bg-cocoa-900 p-5 text-cream-50">
            <h2 id="next-steps" className="text-lg font-semibold">
              What happens next
            </h2>
            <ol className="mt-3 space-y-3">
              {[
                ["We check your request", "A baker reviews your cakes and pickup date, usually within one working day."],
                ["We confirm by email", "You'll get an email when your order is confirmed, or if we need to change anything."],
                ["You pay by PayPal invoice", NO_PAYMENT_NOTE],
                ["You pick up your cake", `Collect it from our Portland kitchen on ${formatDate(result.order.d)}.`],
              ].map(([title, body], index) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream-50 font-display text-sm font-semibold text-cocoa-900">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-cream-200/85">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-6">
            <OrderSummary order={result.order} />
          </div>
          <p className="mt-6 text-sm text-cocoa-700">
            Questions? Reply to your confirmation email or write to hello@frostwellcakes.example.{" "}
            <Link href="/cakes" className="font-medium text-raspberry-700 hover:underline">
              Browse more cakes
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

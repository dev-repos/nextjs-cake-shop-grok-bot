import type { Metadata } from "next";
import { DeclineOrderForm } from "@/components/DecisionForms";
import { formatDateTime, OrderLinkError, OrderSummary } from "@/components/OrderSummary";
import { mailerMode } from "@/lib/server/email";
import { loadDecisionPage } from "@/lib/server/decision-page";

export const metadata: Metadata = {
  title: "Decline order",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/** Bakery's signed decline link: a short reason, then "Decline this order". */
export default async function DeclinePage({ params, searchParams }: PageProps<"/order/[number]/decline">) {
  const { number } = await params;
  const page = await loadDecisionPage("decline", number, await searchParams);
  const order = page.order;

  return (
    <div className="mx-auto max-w-3xl px-5 pt-8 pb-14 md:pt-12 md:pb-20">
      <p className="text-sm font-medium text-cocoa-500">For the bakery</p>
      <h1 className="font-display text-4xl font-semibold text-cocoa-900">Decline order{order ? <> <span className="whitespace-nowrap">{order.n}</span></> : null}</h1>

      {page.kind === "error" ? <OrderLinkError reason={page.reason} at={page.at} /> : null}

      {page.kind === "done" ? (
        <div role="status" className="mt-6 rounded-3xl border border-cocoa-900/15 bg-cream-100 p-6 text-cocoa-900">
          <p className="text-lg font-semibold">Order {page.order.n} is declined</p>
          <p className="mt-1">
            We emailed {page.order.c.n} ({page.order.c.e}) a polite note with your reason. Replies go to the bakery
            inbox. Declined {formatDateTime(page.outcome.at)}.
          </p>
        </div>
      ) : null}

      {page.kind === "ready" ? (
        <section aria-labelledby="decline-h" className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-cocoa-900/5">
          <h2 id="decline-h" className="text-lg font-semibold text-cocoa-900">
            Can&apos;t make this one?
          </h2>
          <p className="mt-1 mb-4 text-cocoa-700">
            We&apos;ll email {page.order.c.n} a polite &ldquo;we can&apos;t make this one&rdquo; with your reason. No payment
            was taken, and their replies come to the bakery.
          </p>
          {mailerMode() === "log" ? (
            <p className="mb-4 text-sm text-cocoa-500">Email is in log mode on this server: messages are printed to the server log.</p>
          ) : null}
          <DeclineOrderForm number={page.order.n} d={page.d} sig={page.sig} />
        </section>
      ) : null}

      {order ? (
        <div className="mt-6">
          <OrderSummary order={order} />
        </div>
      ) : null}
    </div>
  );
}

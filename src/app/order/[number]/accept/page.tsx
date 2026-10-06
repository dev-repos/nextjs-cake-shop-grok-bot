import type { Metadata } from "next";
import { ConfirmOrderForm } from "@/components/DecisionForms";
import { formatDateTime, OrderLinkError, OrderSummary } from "@/components/OrderSummary";
import { formatDate } from "@/lib/cakes";
import { mailerMode } from "@/lib/server/email";
import { loadDecisionPage } from "@/lib/server/decision-page";
import { usd } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accept order",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/** Bakery's signed accept link: one button, "Confirm this order". */
export default async function AcceptPage({ params, searchParams }: PageProps<"/order/[number]/accept">) {
  const { number } = await params;
  const page = await loadDecisionPage("accept", number, await searchParams);
  const order = page.order;

  return (
    <div className="mx-auto max-w-3xl px-5 pt-8 pb-14 md:pt-12 md:pb-20">
      <p className="text-sm font-medium text-cocoa-500">For the bakery</p>
      <h1 className="font-display text-4xl font-semibold text-cocoa-900">Accept order{order ? <> <span className="whitespace-nowrap">{order.n}</span></> : null}</h1>

      {page.kind === "error" ? <OrderLinkError reason={page.reason} at={page.at} /> : null}

      {page.kind === "done" ? (
        <div role="status" className="mt-6 rounded-3xl border border-emerald-700/30 bg-emerald-50 p-6 text-emerald-900">
          <p className="text-lg font-semibold">Order {page.order.n} is confirmed</p>
          <p className="mt-1">
            We emailed {page.order.c.n} ({page.order.c.e}) with their order link and told them a PayPal invoice for{" "}
            {usd(page.order.s)} (USD) is on its way. Confirmed {formatDateTime(page.outcome.at)}.
          </p>
          <p className="mt-2 text-sm">
            PayPal invoicing is a stub for now: the invoice it would create is written to the server log, and no
            invoice is actually sent.
          </p>
        </div>
      ) : null}

      {page.kind === "ready" ? (
        <section aria-labelledby="confirm-h" className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-cocoa-900/5">
          <h2 id="confirm-h" className="text-lg font-semibold text-cocoa-900">
            Can we make this?
          </h2>
          <p className="mt-1 text-cocoa-700">
            Confirming emails {page.order.c.n} that the order is confirmed for pickup on {formatDate(page.order.d)}, with
            their order link, and tells them a PayPal invoice for {usd(page.order.s)} (USD) is on its way.
          </p>
          {mailerMode() === "log" ? (
            <p className="mt-2 text-sm text-cocoa-500">Email is in log mode on this server: messages are printed to the server log.</p>
          ) : null}
          <div className="mt-5">
            <ConfirmOrderForm number={page.order.n} d={page.d} sig={page.sig} />
          </div>
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

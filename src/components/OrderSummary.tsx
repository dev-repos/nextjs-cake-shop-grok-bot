import { formatDate, getCake } from "@/lib/cakes";
import { optionName } from "@/lib/order";
import type { OrderPayload } from "@/lib/server/order-token";
import { usd } from "@/lib/site";

/** Read-only order summary rendered from a verified signed link. */
export function OrderSummary({ order, showContact = true }: { order: OrderPayload; showContact?: boolean }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-cocoa-900/5">
      <h2 className="text-lg font-semibold text-cocoa-900">Order summary</h2>
      <ul className="mt-3 divide-y divide-cocoa-900/10">
        {order.i.map(([slug, size, flavour, frosting, message, qty, unit], index) => (
          <li key={index} className="flex justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="font-semibold text-cocoa-900">
                {qty} × {getCake(slug)?.name ?? slug}
              </p>
              <p className="text-sm [overflow-wrap:anywhere] text-cocoa-700">
                {size} inch · {optionName("flavour", flavour)} · {optionName("frosting", frosting)}
                {message ? <> · “{message}”</> : null}
              </p>
              <p className="text-xs text-cocoa-500">{usd(unit)} each</p>
            </div>
            <p className="shrink-0 font-semibold text-cocoa-900 tabular-nums">{usd(unit * qty)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-baseline justify-between border-t border-cocoa-900/10 pt-4">
        <span className="font-semibold text-cocoa-900">Total</span>
        <span className="font-display text-3xl font-semibold text-cocoa-900 tabular-nums">{usd(order.s)}</span>
      </div>
      <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        <Detail label="Pickup">{formatDate(order.d)}, Frostwell Cakes, Portland</Detail>
        <Detail label="Requested">
          {new Date(order.t * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "America/Los_Angeles",
          })}
        </Detail>
        {showContact ? (
          <>
            <Detail label="Name">{order.c.n}</Detail>
            <Detail label="Phone">{order.c.p}</Detail>
            <Detail label="Email">{order.c.e}</Detail>
          </>
        ) : null}
        <Detail label="Notes" wide>
          {order.x || "None"}
        </Detail>
      </dl>
    </div>
  );
}

function Detail({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-xs font-semibold tracking-wide text-cocoa-500 uppercase">{label}</dt>
      <dd className="mt-0.5 [overflow-wrap:anywhere] whitespace-pre-line text-cocoa-900">{children}</dd>
    </div>
  );
}

export function OrderLinkError({ reason }: { reason: "invalid" | "config" }) {
  return (
    <div role="alert" className="mt-6 rounded-3xl border border-raspberry-600/30 bg-raspberry-100 p-6 text-raspberry-700">
      {reason === "config" ? (
        <>
          <p className="text-lg font-semibold">Order pages are temporarily unavailable</p>
          <p className="mt-1">The site isn&apos;t fully set up yet. Please email hello@frostwellcakes.example.</p>
        </>
      ) : (
        <>
          <p className="text-lg font-semibold">This order link isn&apos;t valid</p>
          <p className="mt-1">
            It may have been changed or copied incompletely. Please use the exact link from your email, or reply to that
            email and we&apos;ll help.
          </p>
        </>
      )}
    </div>
  );
}

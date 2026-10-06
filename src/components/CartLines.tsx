"use client";

import Link from "next/link";
import { SiteImage } from "@/components/SiteImage";
import { formatDate, FLAVOURS, FROSTINGS, getCake } from "@/lib/cakes";
import { type CartLine, customiseHref, lineUnitPrice, removeFromCart, setQuantity } from "@/lib/cart";
import { MAX_QTY } from "@/lib/order-config";
import { usd } from "@/lib/site";

const name = (list: { id: string; name: string }[], id: string) => list.find((o) => o.id === id)?.name ?? id;

/** Cart lines with quantity controls (editable) or a compact read-only list. */
export function CartLines({ lines, editable }: { lines: CartLine[]; editable: boolean }) {
  return (
    <ul className="divide-y divide-cocoa-900/10">
      {lines.map((line) => {
        const cake = getCake(line.slug)!;
        const unit = lineUnitPrice(line);
        const c = line.choices;
        const label = `${cake.name}, ${c.size} inch`;
        // On the cart page the lines sit right under the h1; in checkout they're under "Your cakes" (h2).
        const Heading = editable ? "h2" : "h3";
        return (
          <li key={line.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <SiteImage
              id={cake.imageId}
              sizes={editable ? "112px" : "72px"}
              className={`${editable ? "w-24 sm:w-28" : "w-[72px]"} aspect-[4/3] h-auto shrink-0 self-start rounded-2xl`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <Heading className="font-semibold text-cocoa-900">
                  {editable ? (
                    <Link href={customiseHref(line)} className="-my-2.5 inline-flex min-h-11 items-center hover:underline">
                      {cake.name}
                    </Link>
                  ) : (
                    <>
                      {line.qty} × {cake.name}
                    </>
                  )}
                </Heading>
                <p className="shrink-0 font-semibold text-cocoa-900 tabular-nums">{usd(unit * line.qty)}</p>
              </div>
              <p className="mt-0.5 text-sm [overflow-wrap:anywhere] text-cocoa-700">
                {c.size} inch · {name(FLAVOURS, c.flavour)} · {name(FROSTINGS, c.frosting)}
                {c.message ? <> · “{c.message}”</> : null}
              </p>
              {editable ? (
                <>
                  {c.date ? (
                    <p className="text-xs text-cocoa-500">Requested pickup {formatDate(c.date)}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <label className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 font-medium text-cocoa-800">
                      Quantity<span className="sr-only"> of {label}</span>
                      <select
                        value={line.qty}
                        onChange={(event) => setQuantity(line.id, Number(event.target.value))}
                        className="min-h-11 rounded-full border border-cocoa-900/20 bg-white pr-8 pl-4 text-base font-semibold text-cocoa-900 tabular-nums focus-visible:outline-2 focus-visible:outline-raspberry-600"
                      >
                        {Array.from({ length: MAX_QTY }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <span className="text-xs text-cocoa-500">{usd(unit)} each</span>
                    <span className="ml-auto flex gap-1 text-sm">
                      <Link href={customiseHref(line)} className="inline-flex min-h-11 min-w-11 items-center justify-center px-1 font-medium text-raspberry-700 hover:underline">
                        Edit<span className="sr-only"> {label}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromCart(line.id)}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center px-1 font-medium text-cocoa-700 hover:underline focus-visible:outline-2 focus-visible:outline-raspberry-600"
                      >
                        Remove<span className="sr-only"> {label} from cart</span>
                      </button>
                    </span>
                  </div>
                </>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

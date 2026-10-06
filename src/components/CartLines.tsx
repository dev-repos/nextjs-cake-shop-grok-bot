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
        return (
          <li key={line.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <SiteImage
              id={cake.imageId}
              sizes={editable ? "112px" : "72px"}
              className={`${editable ? "w-24 sm:w-28" : "w-[72px]"} aspect-[4/3] h-auto shrink-0 self-start rounded-2xl`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-cocoa-900">
                  {editable ? (
                    <Link href={customiseHref(line)} className="hover:underline">
                      {cake.name}
                    </Link>
                  ) : (
                    <>
                      {line.qty} × {cake.name}
                    </>
                  )}
                </h3>
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
                    <div className="inline-flex items-center rounded-full border border-cocoa-900/15 bg-white">
                      <button
                        type="button"
                        onClick={() => setQuantity(line.id, line.qty - 1)}
                        disabled={line.qty <= 1}
                        aria-label={`Decrease quantity of ${cake.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-cocoa-800 hover:bg-cream-200 focus-visible:outline-2 focus-visible:outline-raspberry-600 disabled:opacity-35"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite" aria-label={`Quantity ${line.qty}`}>
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(line.id, line.qty + 1)}
                        disabled={line.qty >= MAX_QTY}
                        aria-label={`Increase quantity of ${cake.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-cocoa-800 hover:bg-cream-200 focus-visible:outline-2 focus-visible:outline-raspberry-600 disabled:opacity-35"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-cocoa-500">{usd(unit)} each</span>
                    <span className="ml-auto flex gap-3 text-sm">
                      <Link href={customiseHref(line)} className="font-medium text-raspberry-700 hover:underline">
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromCart(line.id)}
                        className="font-medium text-cocoa-700 hover:underline focus-visible:outline-2 focus-visible:outline-raspberry-600"
                        aria-label={`Remove ${cake.name} from cart`}
                      >
                        Remove
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

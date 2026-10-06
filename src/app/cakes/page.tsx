import type { Metadata } from "next";
import Link from "next/link";
import { SiteImage } from "@/components/SiteImage";
import { cakes, fromPrice, SIZES } from "@/lib/cakes";
import { usd } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our cakes",
  description:
    "Six Frostwell cakes to make your own: choose the size, flavour, frosting and a message on top. Prices in US dollars.",
};

export default function CakesPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-cream-100 to-cream-50">
        <div className="mx-auto max-w-6xl px-5 pt-10 pb-6 md:pt-16">
          <p className="text-xs font-semibold tracking-wide text-raspberry-700 uppercase">
            Design your cake
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-cocoa-900 md:text-5xl">
            Pick a cake to make your own
          </h1>
          <p className="mt-3 max-w-xl text-lg text-cocoa-700">
            Every cake comes in {SIZES.map((s) => s.inches).join(", ").replace(/, (?=\d+$)/, " or ")}{" "}
            inch. Choose the flavour, frosting and a message on top, then pick your pickup date.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14 md:pb-20">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cakes.map((cake, index) => (
            <li key={cake.slug}>
              {/* The whole card is clickable through the title link's stretched ::after, so the link's name is just the cake name. */}
              <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-cocoa-900/5 transition hover:shadow-md has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-raspberry-600">
                <div className="overflow-hidden">
                  <SiteImage
                    id={cake.imageId}
                    preload={index === 0}
                    sizes="(min-width: 1152px) 357px, (min-width: 1024px) calc(33vw - 27px), (min-width: 640px) calc(50vw - 30px), calc(100vw - 40px)"
                    className="aspect-[4/3] h-auto w-full transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-xl font-semibold text-cocoa-900">
                    <Link href={`/cakes/${cake.slug}`} className="outline-none after:absolute after:inset-0 after:rounded-3xl">
                      {cake.name}
                    </Link>
                  </h2>
                  <p className="mt-1 flex-1 text-cocoa-700">{cake.description}</p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <p className="text-sm text-cocoa-500">
                      From{" "}
                      <span className="font-display text-2xl font-semibold text-raspberry-700">
                        {usd(fromPrice(cake))}
                      </span>
                      <span className="block text-xs">6 inch, serves 8–10</span>
                    </p>
                    <span aria-hidden="true" className="inline-flex min-h-11 items-center rounded-full bg-raspberry-600 px-5 text-sm font-semibold text-white transition group-hover:bg-raspberry-700">
                      Customise
                    </span>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

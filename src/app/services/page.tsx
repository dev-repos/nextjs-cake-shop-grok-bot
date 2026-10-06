import type { Metadata } from "next";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { services, usd } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services & prices",
  description:
    "Birthday, wedding and corporate cakes, cupcakes and dessert tables from Frostwell Cakes, with what's included and starting prices in US dollars.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-cream-100 to-cream-50">
        <div className="mx-auto max-w-6xl px-5 pt-10 pb-8 md:pt-16">
          <p className="text-xs font-semibold tracking-wide text-raspberry-700 uppercase">
            Services &amp; prices
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-cocoa-900 md:text-5xl">
            Cakes for every occasion
          </h1>
          <p className="mt-3 max-w-xl text-lg text-cocoa-700">
            Every order is made from scratch and confirmed by email before you pay by PayPal
            invoice. Prices below are starting prices in US dollars.
          </p>
          <nav aria-label="Services" className="-mx-5 mt-6 overflow-x-auto px-5">
            <ul className="flex gap-2 whitespace-nowrap">
              {services.map((service) => (
                <li key={service.slug}>
                  <a
                    href={`#${service.slug}`}
                    className="inline-block rounded-full border border-cocoa-900/15 bg-white px-4 py-2 text-sm font-medium text-cocoa-800 hover:border-raspberry-600 hover:text-raspberry-700"
                  >
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-5 pb-14 md:space-y-10 md:pb-20">
        {services.map((service, index) => (
          <article
            key={service.slug}
            id={service.slug}
            className="scroll-mt-20 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-cocoa-900/5 md:grid md:grid-cols-2"
          >
            <ImagePlaceholder
              id={service.imageId}
              className={`h-full w-full ${index % 2 === 1 ? "md:order-2" : ""}`}
            />
            <div className="flex flex-col p-6 md:p-10">
              <h2 className="font-display text-2xl font-semibold text-cocoa-900 md:text-3xl">
                {service.name}
              </h2>
              <p className="mt-2 text-cocoa-700">{service.summary}</p>
              <h3 className="mt-5 text-sm font-semibold tracking-wide text-cocoa-500 uppercase">
                What&apos;s included
              </h3>
              <ul className="mt-2 space-y-2">
                {service.included.map((item) => (
                  <li key={item} className="flex gap-2.5 text-cocoa-800">
                    <svg
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                      className="mt-0.5 h-5 w-5 flex-none text-raspberry-600"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-cocoa-900/10 pt-5 text-cocoa-500 md:mt-auto">
                Starting at{" "}
                <span className="font-display text-3xl font-semibold text-raspberry-700">
                  {usd(service.from)}
                </span>
                {service.unit ? <span className="text-cocoa-500"> {service.unit}</span> : null}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="px-5 pb-14 md:pb-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-cocoa-900 px-6 py-10 text-center text-cream-50 md:py-14">
          <h2 className="font-display text-3xl font-semibold">Not sure what you need?</h2>
          <p className="mx-auto mt-2 max-w-md text-cream-200/80">
            Start with the basics and we&apos;ll help with the rest when we confirm by email.
          </p>
          <Link
            href="/#how-it-works"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-raspberry-600 px-7 font-semibold text-white transition hover:bg-raspberry-700"
          >
            See how ordering works
          </Link>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import { SiteImage } from "@/components/SiteImage";
import { cakes, fromPrice } from "@/lib/cakes";
import { orderSteps, reviews, usd } from "@/lib/site";

const featuredCakes = cakes.slice(0, 4);

const DESIGN_HREF = "/cakes";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-cream-100 to-cream-50">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 pt-8 pb-12 md:grid-cols-2 md:gap-12 md:pt-16 md:pb-20">
          <div>
            <p className="inline-block rounded-full bg-raspberry-100 px-3 py-1 text-xs font-semibold tracking-wide text-raspberry-700 uppercase">
              Custom cakes, baked to order
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.1] font-semibold text-cocoa-900 sm:text-5xl md:text-6xl">
              The cake you picture, <span className="text-raspberry-600">baked just for you.</span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-cocoa-700">
              Choose the size, flavour, frosting and message. We confirm every detail by email,
              then you pay by PayPal invoice. No online checkout, no surprises.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href={DESIGN_HREF}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-raspberry-600 px-7 text-base font-semibold text-white shadow-lg shadow-raspberry-600/25 transition hover:bg-raspberry-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-raspberry-600"
              >
                Design your cake
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-cocoa-900/15 px-7 text-base font-semibold text-cocoa-800 transition hover:bg-cream-200"
              >
                How it works
              </Link>
            </div>
          </div>
          <SiteImage
            id="hero-cake"
            preload
            sizes="(min-width: 1152px) 532px, (min-width: 768px) calc(50vw - 44px), calc(100vw - 40px)"
            className="aspect-[4/3] h-auto w-full rounded-[2rem] shadow-xl shadow-cocoa-900/10"
          />
        </div>
      </section>

      {/* How ordering works */}
      <section id="how-it-works" className="scroll-mt-16 bg-cream-50">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
          <h2 className="font-display text-3xl font-semibold text-cocoa-900 md:text-4xl">
            How ordering works
          </h2>
          <p className="mt-2 max-w-xl text-cocoa-700">
            Three simple steps. There&apos;s no online checkout: a person confirms every order.
          </p>
          <ol className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
            {orderSteps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-3xl border border-cocoa-900/10 bg-white p-6 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cocoa-900 font-display text-lg font-semibold text-cream-50">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-cocoa-900">{step.title}</h3>
                <p className="mt-1.5 text-cocoa-700">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Featured cakes */}
      <section className="bg-cream-100">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl font-semibold text-cocoa-900 md:text-4xl">
                Featured cakes
              </h2>
              <p className="mt-2 text-cocoa-700">Our most-loved bakes, ready to make your own.</p>
            </div>
            <Link
              href="/cakes"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-raspberry-700 underline-offset-4 hover:underline"
            >
              See all six cakes →
            </Link>
          </div>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCakes.map((cake) => (
              <li key={cake.slug}>
                <article className="group relative block h-full overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-cocoa-900/5 transition hover:shadow-md has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-raspberry-600">
                  <SiteImage
                    id={cake.imageId}
                    sizes="(min-width: 1152px) 268px, (min-width: 1024px) calc(25vw - 25px), (min-width: 640px) calc(50vw - 30px), calc(100vw - 40px)"
                    className="aspect-[4/3] h-auto w-full transition duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-cocoa-900">
                      <Link href={`/cakes/${cake.slug}`} className="outline-none after:absolute after:inset-0 after:rounded-3xl">
                        {cake.name}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-cocoa-700">{cake.description}</p>
                    <p className="mt-3 flex items-center justify-between text-sm text-cocoa-500">
                      <span>
                        From{" "}
                        <span className="text-base font-semibold text-raspberry-700">
                          {usd(fromPrice(cake))}
                        </span>
                      </span>
                      <span aria-hidden="true" className="font-semibold text-raspberry-700 group-hover:underline">
                        Customise →
                      </span>
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-cream-50">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
          <h2 className="font-display text-3xl font-semibold text-cocoa-900 md:text-4xl">
            Kind words
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
            {reviews.map((review) => (
              <li key={review.name}>
                <figure className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-cocoa-900/5">
                  <p className="text-raspberry-600" aria-label="5 out of 5 stars">
                    ★★★★★
                  </p>
                  <blockquote className="mt-3 flex-1 text-cocoa-800">
                    “{review.quote}”
                  </blockquote>
                  <figcaption className="mt-4 text-sm">
                    <span className="font-semibold text-cocoa-900">{review.name}</span>
                    <span className="text-cocoa-500"> · {review.occasion}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="px-5 pb-14 md:pb-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-raspberry-600 px-6 py-10 text-center text-white md:py-14">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Got a celebration coming up?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-raspberry-100">
            Tell us what you have in mind and we&apos;ll confirm it by email.
          </p>
          <Link
            href={DESIGN_HREF}
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-cream-50 px-7 font-semibold text-raspberry-700 transition hover:bg-white"
          >
            Design your cake
          </Link>
        </div>
      </section>
    </>
  );
}

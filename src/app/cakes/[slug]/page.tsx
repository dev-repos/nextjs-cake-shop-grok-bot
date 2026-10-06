import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CakeCustomiser } from "@/components/CakeCustomiser";
import { JsonLd } from "@/components/JsonLd";
import { SiteImage } from "@/components/SiteImage";
import { cakes, fromPrice, getCake, MIN_LEAD_DAYS, SIZES } from "@/lib/cakes";
import { cakeJsonLd } from "@/lib/structured-data";
import { usd } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return cakes.map((cake) => ({ slug: cake.slug }));
}

export async function generateMetadata({ params }: PageProps<"/cakes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cake = getCake(slug);
  if (!cake) return {};
  return {
    title: `Customise the ${cake.name}`,
    description: `${cake.description} From ${usd(fromPrice(cake))}. Choose size, flavour, frosting, a message and your pickup date.`,
  };
}

export default async function CakePage({ params }: PageProps<"/cakes/[slug]">) {
  const { slug } = await params;
  const cake = getCake(slug);
  if (!cake) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 pt-4 md:pt-8 lg:pb-20">
      <JsonLd data={cakeJsonLd(cake)} />
      <nav aria-label="Breadcrumb" className="-my-1.5 text-sm text-cocoa-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/cakes" className="inline-flex min-h-11 items-center font-medium text-raspberry-700 hover:underline">
              Cakes
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-cocoa-700">
            {cake.name}
          </li>
        </ol>
      </nav>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-12">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <SiteImage
            id={cake.imageId}
            preload
            sizes="(min-width: 1152px) 490px, (min-width: 1024px) calc(45vw - 30px), calc(100vw - 40px)"
            className="aspect-[4/3] h-auto w-full rounded-3xl shadow-lg shadow-cocoa-900/10"
          />
          <h1 className="mt-5 font-display text-3xl font-semibold text-cocoa-900 md:text-4xl">
            {cake.name}
          </h1>
          <p className="mt-2 text-cocoa-700">{cake.details}</p>
          <p className="mt-3 text-sm text-cocoa-500">
            From <span className="font-semibold text-raspberry-700">{usd(fromPrice(cake))}</span> for a
            6 inch cake. We confirm every order by email and you pay by PayPal invoice.
          </p>
          <section aria-labelledby="sizes-heading" className="mt-4 rounded-2xl bg-cream-100 p-4">
            <h2 id="sizes-heading" className="font-semibold text-cocoa-900">
              Sizes and prices (US dollars)
            </h2>
            <ul className="mt-1 text-cocoa-800">
              {SIZES.map((size) => (
                <li key={size.inches} className="flex justify-between gap-3">
                  <span>
                    {size.inches} inch, {size.serves.toLowerCase()}
                  </span>
                  <span className="font-semibold tabular-nums">{usd(cake.prices[size.inches])}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-cocoa-700">
              Order at least {MIN_LEAD_DAYS} days before pickup. Some flavours and frostings add a small charge, shown
              next to each choice.
            </p>
          </section>
        </div>

        <Suspense fallback={<CustomiserFallback />}>
          <CakeCustomiser slug={cake.slug} />
        </Suspense>
      </div>
    </div>
  );
}

function CustomiserFallback() {
  return (
    <div aria-hidden="true" className="space-y-4 pb-14">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-36 animate-pulse rounded-3xl bg-cream-100" />
      ))}
    </div>
  );
}

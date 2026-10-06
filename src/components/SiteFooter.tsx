import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-cocoa-900 text-cream-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-semibold">
            Frostwell<span className="text-raspberry-300"> Cakes</span>
          </p>
          <p className="mt-2 text-sm text-cream-200/80">
            {site.tagline} in {site.city}. Every order is confirmed by email and paid by PayPal
            invoice.
          </p>
        </div>
        <nav aria-label="Footer" className="text-sm">
          <p className="font-semibold uppercase tracking-wider text-cream-200/60">Explore</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/" className="hover:text-raspberry-300">
                Home
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-raspberry-300">
                Services &amp; prices
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="hover:text-raspberry-300">
                How ordering works
              </Link>
            </li>
          </ul>
        </nav>
        <div className="text-sm">
          <p className="font-semibold uppercase tracking-wider text-cream-200/60">Say hello</p>
          <ul className="mt-3 space-y-2">
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-raspberry-300">
                {site.email}
              </a>
            </li>
            <li>Pickup: {site.hours}</li>
            <li>{site.city}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream-100/10">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-cream-200/60">
          © {new Date().getFullYear()} Frostwell Cakes. A made-up cake shop. Prices in US dollars.
        </p>
      </div>
    </footer>
  );
}

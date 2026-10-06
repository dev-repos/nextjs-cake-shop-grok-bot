import Link from "next/link";
import { CartLink } from "@/components/CartLink";
import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-cocoa-900/10 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-2 px-4 py-1.5 max-[359px]:px-3 sm:gap-x-4 sm:px-5 sm:py-2">
        <Link href="/" className="inline-flex min-h-11 items-center font-display text-lg font-semibold max-[359px]:text-base whitespace-nowrap text-cocoa-900 sm:text-xl">
          Frostwell
          {/* Narrow phones (under 400px) show just "Frostwell" so the menu fits; screen readers still hear the full name. */}
          <span className="text-raspberry-600 max-[399px]:sr-only">&nbsp;Cakes</span>
          <span className="sr-only"> – {site.tagline}</span>
        </Link>
        <nav aria-label="Main" className="ml-auto flex items-center text-sm font-medium sm:gap-1">
          <Link
            href="/"
            className="hidden min-h-11 items-center rounded-full px-3 text-cocoa-800 hover:bg-cream-200 sm:inline-flex"
          >
            Home
          </Link>
          <Link href="/cakes" className="inline-flex min-h-11 items-center rounded-full px-2 text-cocoa-800 hover:bg-cream-200 max-[359px]:px-1.5 sm:px-3">
            Cakes
          </Link>
          <Link
            href="/services"
            className="inline-flex min-h-11 items-center rounded-full px-2 text-cocoa-800 hover:bg-cream-200 max-[359px]:px-1.5 sm:px-3"
          >
            Services
          </Link>
          <CartLink />
        </nav>
      </div>
    </header>
  );
}

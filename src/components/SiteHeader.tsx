import Link from "next/link";
import { CartLink } from "@/components/CartLink";
import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-cocoa-900/10 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="font-display text-lg font-semibold whitespace-nowrap text-cocoa-900 sm:text-xl">
          Frostwell<span className="text-raspberry-600"> Cakes</span>
          <span className="sr-only"> – {site.tagline}</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-0.5 text-sm font-medium sm:gap-1">
          <Link
            href="/"
            className="hidden rounded-full px-2 py-2 sm:px-3 text-cocoa-800 hover:bg-cream-200 sm:inline-block"
          >
            Home
          </Link>
          <Link href="/cakes" className="rounded-full px-2 py-2 sm:px-3 text-cocoa-800 hover:bg-cream-200">
            Cakes
          </Link>
          <Link
            href="/services"
            className="rounded-full px-2 py-2 sm:px-3 text-cocoa-800 hover:bg-cream-200"
          >
            Services
          </Link>
          <CartLink />
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";
import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-cocoa-900/10 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="font-display text-xl font-semibold text-cocoa-900">
          Frostwell<span className="text-raspberry-600"> Cakes</span>
          <span className="sr-only"> – {site.tagline}</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm font-medium">
          <Link href="/" className="rounded-full px-3 py-2 text-cocoa-800 hover:bg-cream-200">
            Home
          </Link>
          <Link
            href="/services"
            className="rounded-full px-3 py-2 text-cocoa-800 hover:bg-cream-200"
          >
            Services
          </Link>
        </nav>
      </div>
    </header>
  );
}

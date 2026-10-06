import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Frostwell Cakes – Custom cakes, baked to order",
    template: "%s | Frostwell Cakes",
  },
  description:
    "Design your own custom cake. We confirm every order by email and you pay by PayPal invoice. Birthday, wedding and corporate cakes, cupcakes and dessert tables.",
};

export const viewport: Viewport = {
  themeColor: "#fffaf2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

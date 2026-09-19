import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cinzel, Cormorant_Garamond, Inter } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AtmosphereBackground } from "@/components/layout/AtmosphereBackground";
import { siteMetadata } from "@/lib/seo";
import "./globals.css";

/**
 * PHASE 03: the three-typeface system from styles/tokens.ts `fontFamilies`.
 * Each generates a CSS custom property (`variable`) instead of a class, so
 * Tailwind's `font-display` / `font-accent` / `font-body` utilities (wired
 * in tailwind.config.ts) can reference them via `var(--font-*)` — the same
 * variables styles/tokens.ts documents as the source of truth.
 */
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-accent",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = siteMetadata();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${cormorantGaramond.variable} ${inter.variable}`}
    >
      {/*
        bg-midnight/text-ivory here (not just in globals.css @layer base) so
        there is never a flash of unstyled white background before Tailwind's
        base layer applies — this theme is dark by design, not dark-mode-on-
        top-of-light.
      */}
      <body className="bg-midnight font-body text-ivory antialiased">
        {/*
          PHASE 04: one global, fixed, pointer-events-none decorative layer
          behind every page — see the component for why this is safe to
          mount once here rather than per-page.
        */}
        <AtmosphereBackground />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:border focus:border-antique-gold focus:bg-royal-navy focus:px-4 focus:py-2 focus:text-ivory"
        >
          Skip to main content
        </a>
        <Navbar />
        {/*
          PHASE 05: Navbar is `position: fixed`, so it takes up no space in
          flow — without this padding it would permanently cover the top
          ~64/80px of every page's content once scrolled (its background
          goes from transparent to solid). Matches Navbar's own h-16/h-20.
          A future full-bleed hero can opt out locally (e.g. a negative
          top margin) — this is just the correct site-wide default.
        */}
        <main id="main-content" className="pt-16 sm:pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

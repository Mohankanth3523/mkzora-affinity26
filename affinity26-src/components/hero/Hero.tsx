import { festivalIdentity } from "@/data/content";
import { siteBranding } from "@/data/branding";
import { SectionContainer } from "@/components/design-system/SectionContainer";
import { GoldDivider } from "@/components/design-system/GoldDivider";
import { GoldButton } from "@/components/design-system/GoldButton";
import { SecondaryButton } from "@/components/design-system/SecondaryButton";
import { StarField } from "@/components/design-system/StarField";
import { Crescent } from "@/components/design-system/Crescent";
import { Lantern } from "@/components/design-system/Lantern";
import { PalaceSilhouette } from "@/components/design-system/PalaceSilhouette";
import { BrandLogo } from "@/components/design-system/BrandLogo";
import { EventCountdown } from "@/components/countdown/EventCountdown";
import { LocationButton } from "@/components/location/LocationButton";

/**
 * Design copy, not an official fact — one of the project brief's own
 * listed examples of acceptable marketing language ("Every Talent
 * Becomes a Tale"). Kept separate from `data/content.ts`'s verbatim
 * organizer copy (`festivalIdentity`), which is what supplies every
 * other piece of text in this component.
 */
const TAGLINE = "Every Talent Becomes a Tale";

/**
 * The theme name as stated directly, repeatedly, and explicitly by the
 * project brief itself ("The official theme is ARABIAN NIGHTS") — not
 * sourced from the event brochure, but not invented either.
 */
const THEME_LABEL = "Arabian Nights";

/**
 * Phase 06 — cinematic hero.
 *
 * A pure Server Component: the six-step reveal ("stars appear → crescent
 * appears → lanterns illuminate → title reveals → supporting text
 * reveals → CTA appears") is six CSS animations (`animate-hero-1`
 * through `animate-hero-6`, defined once in tailwind.config.ts) rather
 * than JS-driven — no client-side orchestration needed, nothing to
 * hydrate, and it degrades correctly with JS disabled (CSS animations
 * don't require JS to run) and under `prefers-reduced-motion` (the
 * global rule in app/globals.css collapses every stage's duration *and*
 * delay to ~0, so reduced-motion users see everything at once
 * immediately rather than waiting through a still-staggered sequence of
 * instant pops).
 *
 * Festival dates (1, 2 & 3 October 2026) come from the official poster via
 * `festivalIdentity.dates`. No countdown is shown. No invented statistics either
 * — the only numbers here (`festivalIdentity.edition`) come straight
 * from verified source data.
 *
 * Phase 29: three official brand marks were added into the existing
 * "4. Title reveals" reveal group — no new animation stage, so the
 * six-step choreography above is unchanged. Hierarchy, smallest to
 * largest: a small College + Dhruvaas row at the very top ("top
 * institutional," per the brief), then the existing "Presented by…"
 * line, then the AFFINITY '26 event emblem itself as a dominant seal
 * ("main focal") directly above the `<h1>` wordmark — the event logo is
 * the largest brand mark anywhere on this page, on purpose. Digital
 * partners are deliberately absent from the hero — they get their own
 * section (`DigitalPartnersSection`) rather than crowding this one, per
 * the brief's "do not clutter the hero" instruction.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex min-h-screen min-h-[100svh] items-center justify-center overflow-hidden"
    >
      {/*
        Decorative visual sequence, local to the hero. The global
        AtmosphereBackground (Phase 04) already sits behind every page at
        a deliberately subtle opacity; this is a separate, more
        pronounced composition of the same design-system pieces, scoped
        to this one section, for the specific "opening scene" moment the
        brief asks for.
      */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-night-vignette" />

        {/* 1. Stars appear */}
        <div className="animate-hero-1 absolute inset-0">
          <StarField />
        </div>

        {/* A soft gold illumination behind the title — "subtle gold illumination" from the brief, not a literal light source. */}
        <div className="animate-hero-3 absolute left-1/2 top-[38%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-warm-gold/[0.10] blur-3xl sm:h-96 sm:w-96" />

        {/* 2. Crescent appears */}
        <Crescent
          size={112}
          className="animate-hero-2 absolute right-6 top-10 h-14 w-14 text-warm-gold/80 sm:right-12 sm:top-14 sm:h-20 sm:w-20 lg:right-20 lg:top-16 lg:h-28 lg:w-28"
        />

        {/* 3. Lanterns illuminate — a symmetric pair framing the title, kept small and low enough on mobile that they never sit behind the text column. */}
        <Lantern
          size={36}
          className="animate-hero-3 absolute left-4 top-20 opacity-70 sm:left-10 sm:top-24 lg:left-20"
        />
        <Lantern
          size={36}
          className="animate-hero-3 absolute right-4 top-20 opacity-70 sm:right-10 sm:top-24 lg:right-20"
        />

        {/* Geometric ornamentation — a hairline diamond frame behind the title, evoking an illuminated-manuscript border rather than a busy tiled pattern. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 200 200"
          className="animate-hero-3 absolute left-1/2 top-1/2 h-[85vmin] w-[85vmin] -translate-x-1/2 -translate-y-1/2 text-antique-gold/[0.07]"
        >
          <rect x="20" y="20" width="160" height="160" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <rect
            x="20"
            y="20"
            width="160"
            height="160"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            transform="rotate(45 100 100)"
          />
        </svg>

        {/* Distant palace horizon — larger and warmer-toned than the site-wide atmosphere version, since here it's part of the hero's own visual identity rather than ambient texture. */}
        <PalaceSilhouette
          gapColor="#070A18"
          className="absolute inset-x-0 bottom-0 h-28 w-full text-antique-gold/[0.16] sm:h-40 lg:h-56"
        />
      </div>

      <SectionContainer as="div" width="narrow" className="relative z-10 py-section-2xl text-center">
        {/* 4. Title reveals */}
        <div className="animate-hero-4">
          {/* Top institutional row — secondary to the event emblem below it, but
              raised from Phase 04's original h-10/h-12 (Phase 33: "make it big,
              clearly visible" applied sitewide) without letting it out-scale
              the event mark. */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <BrandLogo
              src={siteBranding.college.logo}
              alt={siteBranding.college.alt}
              heightClassName="h-12 sm:h-14"
              padding="sm"
            />
            <BrandLogo
              src={siteBranding.batch.logo}
              alt={siteBranding.batch.alt}
              heightClassName="h-12 sm:h-14"
              padding="sm"
            />
          </div>

          <p className="mt-4 font-accent text-lg italic text-warm-gold sm:mt-5 sm:text-xl">
            Presented by the {festivalIdentity.presentedBy}
          </p>

          {/* Main focal mark — the official event emblem, deliberately the largest
              brand mark on this page. Raised from Phase 04's h-20/h-28/h-32 in
              step with the institutional row above, keeping the same margin
              between them. */}
          <div className="mt-5 flex justify-center sm:mt-6">
            <BrandLogo
              src={siteBranding.event.logo}
              alt={siteBranding.event.alt}
              heightClassName="h-24 sm:h-32 lg:h-40"
              padding="lg"
            />
          </div>

          <h1
            id="hero-heading"
            className="mt-5 font-display text-4xl font-semibold leading-tight tracking-wide text-ivory sm:mt-6 sm:text-6xl lg:text-7xl"
          >
            {festivalIdentity.name}
          </h1>
        </div>

        {/* 5. Supporting text reveals */}
        <div className="animate-hero-5 mt-5 sm:mt-6">
          <p className="font-body text-xs uppercase tracking-[0.25em] text-desert-sand sm:text-sm sm:tracking-[0.3em]">
            {festivalIdentity.edition}
            <span aria-hidden="true" className="mx-3 text-antique-gold/60">
              &#10022;
            </span>
            {THEME_LABEL}
          </p>
          <p className="mt-4 font-display text-base font-semibold uppercase tracking-[0.22em] text-warm-gold sm:mt-5 sm:text-xl sm:tracking-[0.28em]">
            <time dateTime={`${festivalIdentity.dates.startISO}/${festivalIdentity.dates.endISO}`}>
              {festivalIdentity.dates.display}
            </time>
          </p>
          <p className="mx-auto mt-3 max-w-sm font-body text-[11px] uppercase leading-relaxed tracking-[0.12em] text-ivory/60 sm:max-w-md sm:text-xs sm:tracking-[0.18em]">
            {festivalIdentity.institution}
          </p>

          <div className="mt-6 flex justify-center sm:mt-8">
            <GoldDivider />
          </div>

          <p className="mt-6 font-accent text-xl italic text-ivory sm:mt-8 sm:text-2xl lg:text-3xl">
            {TAGLINE}
          </p>

          {/* Live countdown to 1 October 2026, 00:00 IST — deliberately compact and below the branding so it supports, not competes with, the AFFINITY '26 emblem/wordmark. */}
          <EventCountdown className="mt-8 sm:mt-10" />
        </div>

        {/* 6. CTA appears */}
        <div className="animate-hero-6 mt-8 flex flex-col items-center gap-4 sm:mt-10 sm:flex-row sm:justify-center">
          <GoldButton href="/register" fullWidth className="sm:w-auto">
            Register Now
          </GoldButton>
          <SecondaryButton href="/events" fullWidth className="sm:w-auto">
            Explore Events
          </SecondaryButton>
        </div>

        <div className="animate-hero-6 mt-4 flex justify-center">
          <LocationButton />
        </div>
      </SectionContainer>
    </section>
  );
}

import {
  GeometricBand,
  GoldButton,
  GoldDivider,
  Lantern,
  OrnamentalFrame,
  PalaceSilhouette,
  ScrollReveal,
  SectionContainer,
  StarField,
} from "@/components/design-system";
import { eventCounts } from "@/data/events";

/**
 * The landing page's Events teaser. Replaces the Phase 02 placeholder
 * that used to sit here — a bare `<h2>`/`<p>`/plain-text `<Link>` with no
 * container, no responsive classes, and none of the design-system
 * components every other landing-page section now uses (same gap Theme
 * had, and Cause had before its Phase 24 fix — see
 * `docs/phase-25-events-teaser-notes.md`).
 *
 * Every number here is `eventCounts` (`data/events/index.ts`), a plain
 * `.length` count of the real event records — nothing here is a
 * fabricated or rounded figure. Culturals combines the onstage + offstage
 * cultural categories, matching `lib/events/eventGroups.ts`'s
 * `EVENT_GROUP_CATEGORIES` grouping exactly, just summed into a count
 * instead of used as a filter.
 *
 * Phase 39 (remove Online Events completely): the old three-way Sports/
 * Culturals/Online split replaced its "Online" tile (online-cultural +
 * online-esports combined) with an "Esports" tile — the Online Events
 * *category* (online-cultural) is gone from `allEvents`/`eventCounts`
 * entirely, per that phase's brief, but the 4 online-esports events
 * (E-Football, FIFA, PUBG, Free Fire) are still real, visible,
 * direct-contact events on this site, so this landing-page stat still
 * accounts for them under their own honest label rather than silently
 * dropping to a two-tile layout. See
 * docs/phase-39-remove-online-events-notes.md.
 *
 * "The Royal Courts" is the same design-copy name the real `/events`
 * page's own heading already uses (`EventsExplorer.tsx`) — this section
 * is a preview of that page, so it reuses its name rather than inventing
 * a second one for the same destination.
 *
 * Phase 34: before this phase, this was the one landing section with
 * *zero* atmosphere elements — no starfield, no palace silhouette, no
 * lantern, nothing from this design system's own motif set — which made
 * it the starkest case of the "feels long text only" report. Added: a
 * static `StarField`, a `PalaceSilhouette` along the bottom edge (both
 * matching the treatment `Theme` already has, so the landing page's
 * atmosphere feels continuous rather than switching on and off section
 * to section), a `GeometricBand` opening the section, a small `Lantern`
 * beside the "Events" eyebrow, and one flat-line glyph per stat card
 * (`SportsGlyph`/`CulturalsGlyph`/`EsportsGlyph`, defined below) so the
 * three cards read as three distinct categories at a glance instead of
 * three identical number tiles differing only in their label text.
 */
const STATS = [
  { label: "Sports", value: eventCounts.sports, Glyph: SportsGlyph },
  { label: "Culturals", value: eventCounts.culturalOnstage + eventCounts.culturalOffstage, Glyph: CulturalsGlyph },
  { label: "Esports", value: eventCounts.esports, Glyph: EsportsGlyph },
] as const;

export function EventsTeaser() {
  return (
    <section aria-labelledby="events-teaser-heading" className="relative overflow-hidden">
      <StarField animated={false} className="opacity-30" />

      <PalaceSilhouette
        gapColor="#070A18"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full text-antique-gold/[0.08] sm:h-28 lg:h-32"
      />

      <GeometricBand heightClassName="h-2.5 sm:h-3" className="relative z-10 text-antique-gold/20" />

      <SectionContainer as="div" width="content" verticalPadding className="relative z-10">
        <ScrollReveal>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2 font-accent text-lg italic tracking-wide text-warm-gold sm:text-xl">
              <Lantern size={22} glow={false} className="shrink-0" />
              <span>Events</span>
            </div>
            <h2
              id="events-teaser-heading"
              className="font-display text-4xl font-semibold tracking-wide text-ivory sm:text-5xl lg:text-6xl"
            >
              The Royal Courts Await
            </h2>
            <GoldDivider size="lg" />
            <p className="max-w-xl font-body text-base text-desert-sand sm:text-lg">
              {eventCounts.total} events across sports, culturals, and esports categories.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delayMs={120}>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-6">
            {STATS.map((stat) => (
              <OrnamentalFrame
                key={stat.label}
                padding="md"
                className="flex flex-col items-center gap-2 text-center"
              >
                <stat.Glyph className="h-7 w-7 text-antique-gold/70" />
                <span className="font-display text-4xl font-semibold text-antique-gold sm:text-5xl">
                  {stat.value}
                </span>
                <span className="font-body text-xs font-medium uppercase tracking-[0.2em] text-desert-sand">
                  {stat.label}
                </span>
              </OrnamentalFrame>
            ))}
          </div>
        </ScrollReveal>

        <div className="mt-10 flex justify-center sm:mt-12">
          <GoldButton href="/events">Explore All Events</GoldButton>
        </div>
      </SectionContainer>
    </section>
  );
}

/**
 * Three flat-line glyphs, one per stat card — same visual language as
 * `Lantern`/`Crescent`/the rest of this design system: `currentColor`
 * stroke, no fill, no gradient. Kept local to this file (not promoted to
 * `design-system/`) since nothing else on the site needs a "sports"/
 * "culturals"/"esports" icon yet — the same "add it here first, promote
 * it later if a second consumer shows up" approach `Gallery.tsx`'s own
 * local `ArrowGlyph`/`CloseGlyph` already follow.
 */
function SportsGlyph({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      {/* Crossed blades — a competition/tournament motif fitting a royal-court framing better than a literal ball or trophy would. */}
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4 L20 20" />
        <path d="M20 4 L4 20" />
        <path d="M4 4 L6.2 4" />
        <path d="M4 4 L4 6.2" />
        <path d="M20 4 L17.8 4" />
        <path d="M20 4 L20 6.2" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

function CulturalsGlyph({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      {/* A simple performance mask — two eyes and a raised smile-line, evoking on-stage cultural events without a literal photograph. */}
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10 C4 5.5 7.6 3 12 3 C16.4 3 20 5.5 20 10 C20 15 16.4 19 12 19 C7.6 19 4 15 4 10 Z" />
        <circle cx="8.6" cy="9.5" r="1.1" fill="currentColor" stroke="none" />
        <circle cx="15.4" cy="9.5" r="1.1" fill="currentColor" stroke="none" />
        <path d="M8 13.5 C9.3 15 14.7 15 16 13.5" />
      </g>
    </svg>
  );
}

function EsportsGlyph({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      {/* A simple game controller — the plainest honest icon for the esports titles (E-Football, FIFA, PUBG, Free Fire) this tile now counts, replacing the Phase 25 monitor glyph once the "Online" stat became an esports-only one (Phase 39). */}
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 8.5 H17 C19 8.5 20.5 10.2 20.5 12.5 C20.5 14.6 19.3 16 17.8 16 C16.8 16 16.3 15.4 15.6 14.4 C15.1 13.7 14.6 13.2 12 13.2 C9.4 13.2 8.9 13.7 8.4 14.4 C7.7 15.4 7.2 16 6.2 16 C4.7 16 3.5 14.6 3.5 12.5 C3.5 10.2 5 8.5 7 8.5 Z" />
        <path d="M7.5 10.8 V12.9" />
        <path d="M6.45 11.85 H8.55" />
        <circle cx="16.2" cy="10.6" r="0.6" fill="currentColor" stroke="none" />
        <circle cx="17.8" cy="12.2" r="0.6" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

import {
  GeometricBand,
  GoldDivider,
  Lantern,
  OrnamentalFrame,
  ScrollReveal,
  SectionContainer,
  StarField,
} from "@/components/design-system";
import { aboutAffinity, aboutAffinityBrochureVariant, festivalIdentity } from "@/data/content";

/**
 * Phase 07 — "Enter the Story."
 *
 * Every fact in this section comes from `data/content.ts` (itself
 * transcribed from `docs/affinity-content-truth.md`). Two strings are
 * used verbatim rather than summarized or trimmed, specifically to avoid
 * the transcription risk of hand-editing organizer copy:
 *
 * - `aboutAffinity` — the sober, first-person organizer description
 *   ("It has been a tradition... three days of fun-filled sports and
 *   cultural events").
 * - `aboutAffinityBrochureVariant` — the brochure's own more exuberant
 *   self-description ("thousands of medical students from across
 *   India... bigger, bolder, and more magical"). This is the *only*
 *   place in this section a number or a superlative claim appears, and
 *   it is rendered as an attributed blockquote — the organizer's own
 *   quoted voice, not an assertion this component is making. That's
 *   deliberate: the phase brief says "do not invent participant
 *   numbers... do not invent achievements," and quoting the source
 *   exactly (rather than paraphrasing it into unattributed prose) keeps
 *   every one of those claims traceable to the brochure, not to this
 *   codebase.
 *
 * Layout is an asymmetric editorial grid — large typography on the
 * left, a bordered "story panel" on the right — instead of a card grid,
 * per the phase's explicit instruction.
 *
 * Phase 34: this section (plus Theme, Cause, and EventsTeaser) was
 * reported as "feels long text only" — a fair read, since its only
 * non-text elements before this phase were a static starfield and a
 * near-invisible parchment texture. Two more of this design system's
 * existing motifs were added: a `GeometricBand` (the Arabian
 * eight-point-star pattern, new this phase — see that component) as a
 * thin ornamental strip opening the section, and a small `Lantern`
 * beside the "The Story" eyebrow, echoing the Hero's own lantern motif
 * on a smaller scale. No new photography — see
 * docs/phase-34-theme-atmosphere-notes.md for why real Arabian Nights
 * imagery isn't used here (the project brief's own motif list is
 * explicitly vector/illustrative: crescents, stars, lanterns, palace
 * silhouettes, geometric patterns — not photographs).
 */

/**
 * A near-invisible noise layer behind the story panel's text — the
 * "parchment-inspired texture" the phase asks for, without literally
 * switching the panel to cream/beige paper (which would fight the
 * project's dark palette). An SVG `feTurbulence` filter tinted
 * desert-sand (#D9C19A) at ~7% opacity, evoking a page catching lantern
 * light rather than a literal parchment scan.
 *
 * Explicit z-index (`z-0`), not `z-auto`: `OrnamentalFrame` positions
 * its gold corner brackets with plain `absolute` (z-index auto), and
 * this texture is also `absolute`. Without an explicit stacking order,
 * paint order between two auto-positioned layers falls back to DOM tree
 * order, which is fragile. Giving this layer `z-0` and the text content
 * below `z-10` makes the "text always wins" ordering unambiguous rather
 * than incidental.
 */
function ParchmentTexture() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-[0.07]"
      preserveAspectRatio="none"
    >
      <filter id="story-parchment-noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves={2}
          stitchTiles="stitch"
          result="noise"
        />
        {/* Recolors the greyscale noise to desert-sand (#D9C19A) instead of leaving it neutral grey. */}
        <feColorMatrix
          in="noise"
          type="matrix"
          values="0 0 0 0 0.851  0 0 0 0 0.757  0 0 0 0 0.604  0 0 0 0.55 0"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#story-parchment-noise)" />
    </svg>
  );
}

export function Story() {
  return (
    <section aria-labelledby="story-heading" className="relative overflow-hidden">
      {/* Sparse, static starfield — ambient texture behind body copy, not the
          animated night-sky moment the Hero already owns. `animated={false}`
          is StarField's own documented use-case for exactly this situation. */}
      <StarField animated={false} className="opacity-40" />

      <GeometricBand heightClassName="h-2.5 sm:h-3" className="relative z-10 text-antique-gold/20" />

      <SectionContainer as="div" width="wide" verticalPadding className="relative">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-16">
          <ScrollReveal>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <Lantern size={30} glow={false} />
                <p className="font-accent text-lg italic tracking-wide text-warm-gold sm:text-xl">
                  The Story
                </p>
              </div>
              <h2
                id="story-heading"
                className="font-display text-5xl font-semibold leading-[1.05] tracking-wide text-ivory sm:text-6xl lg:text-7xl"
              >
                Enter the Story
              </h2>
              <div className="flex justify-start">
                <GoldDivider size="lg" />
              </div>
              <p className="max-w-sm font-body text-sm text-desert-sand/80 sm:text-base">
                {festivalIdentity.edition} &middot; {festivalIdentity.institution}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={150}>
            <OrnamentalFrame padding="lg" className="relative overflow-hidden">
              <ParchmentTexture />
              <div className="relative z-10 flex flex-col gap-6">
                <p className="font-body text-base leading-relaxed text-ivory sm:text-lg">
                  {aboutAffinity}
                </p>

                <blockquote className="border-l-2 border-antique-gold/40 pl-5">
                  <p className="font-accent text-lg italic leading-relaxed text-desert-sand sm:text-xl">
                    &ldquo;{aboutAffinityBrochureVariant}&rdquo;
                  </p>
                  <cite className="mt-3 block font-body text-xs not-italic uppercase tracking-[0.2em] text-warm-gold/80">
                    &mdash; From the official AFFINITY &apos;26 brochure
                  </cite>
                </blockquote>

                <div className="flex flex-col gap-1.5 border-t border-antique-gold/20 pt-5">
                  {festivalIdentity.taglines.map((tagline) => (
                    <p
                      key={tagline}
                      className="font-accent text-base italic text-antique-gold sm:text-lg"
                    >
                      {tagline}
                    </p>
                  ))}
                </div>
              </div>
            </OrnamentalFrame>
          </ScrollReveal>
        </div>
      </SectionContainer>
    </section>
  );
}

import { Crescent, GeometricBand, GoldDivider, OrnamentalFrame, ScrollReveal, SectionContainer } from "@/components/design-system";
import { aboutCause } from "@/data/content";

/**
 * Phase 08 — "A Story Worth Seeing," the blindness-awareness cause
 * section. "A Story Worth Seeing" is sanctioned design copy — it's one
 * of the project brief's own listed examples of acceptable marketing
 * language — kept structurally separate from the section's one factual
 * claim, which gets its own small label ("The Cause · Blindness")
 * instead of being folded into the emotional headline.
 *
 * Every fact comes from `data/content.ts`'s `aboutCause`:
 *
 * - `description` — the organizer's own paragraph. No charity name, no
 *   donation amount, no medical statistic, no beneficiary count appears
 *   anywhere in the source material, so none appears here either — the
 *   phase's "do not invent" list is a list of things this component
 *   structurally cannot say, not a list of edits made to hide them.
 * - `connectedEvent` — the one place the source documents tie the cause
 *   to a specific piece of programming: the Pencil Painting event's own
 *   stated theme. Phase 39 (remove Online Events completely) stopped
 *   rendering this as a blockquote here — Pencil Painting is one of the
 *   `onlineCulturalEvents` (data/events/online.ts) that phase removed
 *   from every participant-facing surface, so a promotional aside
 *   pointing at an event a participant can no longer find or select
 *   would be actively misleading. `aboutCause.connectedEvent` itself is
 *   untouched in data/content.ts (it's sourced content, not deleted —
 *   see that field's own doc comment) — this component just no longer
 *   surfaces it. See docs/phase-39-remove-online-events-notes.md.
 *
 * Visually restrained on purpose — a single soft aperture-of-light motif
 * (concentric rings + a narrow gradient beam, both static, no per-scroll
 * animation) rather than anything literal or dramatized, per the phase's
 * explicit "respectful... not exploitative or overly dramatic."
 *
 * Phase 34: reported alongside Story/Theme/EventsTeaser as "feels long
 * text only." This section's own restraint is deliberate (see above), so
 * it gets the lightest touch of the four rather than matching Theme's
 * lantern pair — a small `Crescent` beside the eyebrow (this design
 * system's quietest recurring mark, already used the same way in
 * `Theme`/`Footer`/the nav wordmark) and one `GeometricBand` closing the
 * section, not opening it, so it never competes with `LightAperture` for
 * the first thing a reader's eye meets.
 */

/**
 * The section's one visual idea: a controlled beam of warm-gold light
 * falling from above, opening into soft concentric rings — reads as
 * both "light" and, loosely, "an eye adjusting to it," without drawing
 * an actual eye (which risks reading as clinical or uncanny for a cause
 * section about vision). Entirely static — no pulse, no scroll-trigger
 * — matching `GoldDivider`'s precedent elsewhere in this design system
 * that a decorative element sitting this close to solemn subject matter
 * should never visibly move.
 */
function LightAperture() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 flex justify-center overflow-hidden">
      {/* The beam: a narrow trapezoid widening as it falls, faded to nothing before it reaches the body text. */}
      <div
        className="absolute top-0 h-64 w-28 bg-gradient-to-b from-warm-gold/25 via-warm-gold/5 to-transparent sm:h-80 sm:w-36"
        style={{ clipPath: "polygon(46% 0%, 54% 0%, 68% 100%, 32% 100%)" }}
      />
      <svg viewBox="0 0 200 200" className="mt-6 h-48 w-48 opacity-80 sm:h-60 sm:w-60">
        <defs>
          <radialGradient id="cause-aperture-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E8C76A" stopOpacity="0.5" />
            <stop offset="45%" stopColor="#E8C76A" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#E8C76A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="100" fill="url(#cause-aperture-core)" />
        <circle cx="100" cy="100" r="72" fill="none" stroke="#C9A24D" strokeOpacity="0.22" strokeWidth="0.75" />
        <circle cx="100" cy="100" r="48" fill="none" stroke="#C9A24D" strokeOpacity="0.32" strokeWidth="0.75" />
        <circle cx="100" cy="100" r="24" fill="none" stroke="#E8C76A" strokeOpacity="0.45" strokeWidth="1" />
      </svg>
    </div>
  );
}

export function Cause() {
  return (
    <section aria-labelledby="cause-heading" className="relative overflow-hidden">
      <LightAperture />

      <SectionContainer as="div" width="narrow" verticalPadding className="relative z-10">
        <ScrollReveal>
          <OrnamentalFrame padding="lg" className="flex flex-col items-center gap-6 text-center">
            <div className="flex items-center gap-2 font-accent text-lg italic tracking-wide text-warm-gold sm:text-xl">
              <Crescent size={18} className="shrink-0" />
              <span>
                The Cause &middot; {aboutCause.cause}
              </span>
            </div>

            <h2
              id="cause-heading"
              className="font-display text-4xl font-semibold tracking-wide text-ivory sm:text-5xl lg:text-6xl"
            >
              A Story Worth Seeing
            </h2>

            <GoldDivider size="lg" />

            <p className="max-w-2xl font-body text-base leading-relaxed text-desert-sand sm:text-lg">
              {aboutCause.description}
            </p>

            <GeometricBand heightClassName="h-2" className="mt-2 w-full max-w-xs text-antique-gold/25" />
          </OrnamentalFrame>
        </ScrollReveal>
      </SectionContainer>
    </section>
  );
}

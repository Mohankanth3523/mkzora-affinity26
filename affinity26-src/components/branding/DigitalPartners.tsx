import { BrandLogo } from "@/components/design-system/BrandLogo";
import type { DigitalPartner } from "@/data/branding";

export interface DigitalPartnersProps {
  partners: readonly DigitalPartner[];
  /**
   * @default "h-20 sm:h-24 lg:h-28" — see
   * docs/phase-29-brand-logo-integration-notes.md for why this row exists
   * as its own quiet section in the first place, and
   * docs/phase-33-logo-refresh-notes.md for why this specific height was
   * raised from Phase 29's original "h-14 sm:h-16" (a direct "make it
   * big, clearly visible" request) without abandoning that section's
   * still-true "digital partners never outsize the AFFINITY event
   * emblem" rule — `event` renders even larger than this everywhere it
   * appears (see `Hero`).
   */
  heightClassName?: string;
  /** @default "lg" */
  padding?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Phase 29 — reusable, data-driven digital-partner strip, per the brief's
 * own instruction #10 ("Create a reusable DigitalPartners component").
 * Every partner in `partners` renders at the *same* `heightClassName` and
 * `padding` — equal treatment between digital partners is a hierarchy
 * rule from the brief, not an accident of this being the only two
 * partners supplied so far, so a future third partner slots in at the
 * same size automatically rather than needing a bespoke prop per entry.
 *
 * A partner is only ever wrapped in a link when `partner.href` is set.
 * Per `data/branding.ts`, neither supplied partner has an official URL on
 * file, so both currently render as plain, unlinked marks — never a
 * guessed or placeholder `href`.
 */
export function DigitalPartners({
  partners,
  heightClassName = "h-20 sm:h-24 lg:h-28",
  padding = "lg",
  className = "",
}: DigitalPartnersProps) {
  if (partners.length === 0) return null;

  return (
    <div
      className={["flex flex-wrap items-center justify-center gap-6 sm:gap-10", className].join(" ")}
    >
      {partners.map((partner) => {
        const mark = (
          <BrandLogo src={partner.logo} alt={partner.alt} heightClassName={heightClassName} padding={padding} />
        );

        return (
          <div key={partner.name} className="flex flex-col items-center gap-2">
            {partner.href ? (
              <a
                href={partner.href}
                {...(/^https?:\/\//i.test(partner.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="rounded-md transition-opacity duration-fast hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-warm-gold"
              >
                {mark}
                {/^https?:\/\//i.test(partner.href) ? <span className="sr-only"> (opens in a new tab)</span> : null}
              </a>
            ) : (
              mark
            )}
          </div>
        );
      })}
    </div>
  );
}

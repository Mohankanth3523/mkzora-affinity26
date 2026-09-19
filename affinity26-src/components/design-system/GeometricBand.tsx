import { useId } from "react";

export interface GeometricBandProps {
  className?: string;
  /** Tailwind height utility for the band. @default "h-3 sm:h-4" */
  heightClassName?: string;
}

/**
 * Phase 34 — a thin, tiled Arabian eight-point-star geometric pattern.
 * The project brief's own motif list names "Arabian geometric patterns"
 * alongside crescents, stars, lanterns, and palace silhouettes — but
 * unlike those four (each already a real, reused component by Phase 29),
 * no geometric-pattern motif existed anywhere on the actual site before
 * this phase. This fills that one specific gap.
 *
 * The tile is the classic two-overlapping-squares construction of an
 * eight-point star (rub el hizb), drawn as flat line art — no gradient,
 * no fill — repeated via a native SVG `<pattern>` rather than a raster
 * background-image, so it stays crisp at any size and its color/opacity
 * are just `currentColor` + the caller's own text utility classes (the
 * same convention `PalaceSilhouette`/`Lantern` already use).
 *
 * Deliberately a thin **band** — a divider-height strip, not a full
 * background texture sitting behind paragraph text — so it reads as an
 * ornamental rule (this design system's `GoldDivider`, just patterned
 * instead of a plain line) rather than a busy backdrop competing with
 * reading. Static, no animation, matching `GoldDivider`'s own "a
 * decorative separator that visibly moves reads as a gaming website"
 * reasoning.
 */
export function GeometricBand({ className = "", heightClassName = "h-3 sm:h-4" }: GeometricBandProps) {
  const patternId = `geometric-band-${useId().replace(/:/g, "")}`;
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      className={[heightClassName, "w-full", className].join(" ")}
    >
      <defs>
        <pattern id={patternId} width="26" height="26" patternUnits="userSpaceOnUse">
          <g transform="translate(13,13)" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="-6.5" y="-6.5" width="13" height="13" />
            <rect x="-6.5" y="-6.5" width="13" height="13" transform="rotate(45)" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

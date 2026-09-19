import { StarField } from "@/components/design-system/StarField";
import { Crescent } from "@/components/design-system/Crescent";
import { Lantern } from "@/components/design-system/Lantern";
import { PalaceSilhouette } from "@/components/design-system/PalaceSilhouette";

/**
 * Phase 04 — global Arabian Nights atmosphere.
 *
 * A single, site-wide decorative backdrop mounted once in app/layout.tsx,
 * not a page section: `position: fixed`, `pointer-events-none`,
 * `aria-hidden`, and stacked behind all real content via a negative
 * z-index so it can never sit between the user and anything interactive,
 * never affects document flow/height, and never needs to be reasoned
 * about per-page. It composes the Phase 03 design-system pieces
 * (StarField, Crescent, Lantern, PalaceSilhouette) rather than
 * duplicating them, plus two atmosphere-only additions: a faint
 * geometric-lattice texture and a hairline ornamental viewport frame.
 *
 * Deliberately restrained, per the brief: low opacities throughout, no
 * new motion beyond what StarField/Lantern already do (both already
 * collapse under `prefers-reduced-motion` via the global rule in
 * app/globals.css — nothing new to gate here), and nothing that reads as
 * "fantasy game" — nine total decorative elements (48 star dots counted
 * as one field, one moon, two lanterns, one skyline, one pattern layer,
 * one frame) across the entire viewport, not a busy scene.
 */
export function AtmosphereBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base sky: the same radial vignette token used behind hero/section surfaces, here covering the whole viewport as the site's constant backdrop. */}
      <div className="absolute inset-0 bg-night-vignette" />

      {/* Faint Arabian geometric lattice — a classic overlapping-squares (8-point star) motif, tiled at very low opacity so it reads as texture, not pattern. */}
      <GeometricLattice className="absolute inset-0 text-antique-gold opacity-[0.035]" />

      {/* A single soft warm glow near the top, suggesting moonlight/lantern-light without a literal light source — kept far too subtle to compete with foreground content. */}
      <div className="absolute left-1/2 top-0 h-[40vh] w-[70vw] -translate-x-1/2 -translate-y-1/3 rounded-full bg-warm-gold/[0.06] blur-3xl" />

      {/* Stars — reusing the deterministic StarField as-is, toned down further for a persistent (not just hero) presence. */}
      <div className="absolute inset-0 opacity-60">
        <StarField />
      </div>

      {/* Crescent moon, fixed in the upper sky, never competing with page content since nothing else occupies this corner. */}
      <Crescent
        size={96}
        className="absolute right-6 top-8 h-14 w-14 text-warm-gold/50 sm:right-10 sm:top-10 sm:h-20 sm:w-20 lg:h-28 lg:w-28"
      />

      {/* A palace skyline at the horizon — a tone barely lighter than the base sky, so it reads as distant and atmospheric rather than as decoration sitting on top of the page. */}
      <PalaceSilhouette
        gapColor="#070A18"
        className="absolute inset-x-0 bottom-0 h-24 w-full text-royal-navy opacity-80 sm:h-32 lg:h-40"
      />

      {/* Two small lanterns framing the top corners — "subtle lantern lighting," kept to a pair so it stays atmosphere, not a repeating decoration. */}
      <Lantern size={28} className="absolute left-4 top-4 opacity-30 sm:left-6 sm:top-6" />
      <Lantern size={28} className="absolute right-20 top-4 opacity-20 sm:right-28 sm:top-6" glow={false} />

      {/* Hairline ornamental frame around the viewport, inset to respect notch/home-indicator safe areas on mobile. Corner brackets echo OrnamentalFrame's motif for visual consistency across the design system. */}
      <ViewportOrnamentalFrame />
    </div>
  );
}

/** Overlapping-squares lattice tile — a simple, authentic Islamic geometric motif (two squares, one rotated 45°) rather than an invented pattern. Static; texture, not content, so it carries no `title`/`role`. */
function GeometricLattice({ className }: { className?: string }) {
  const tile = 84;
  const inset = 22;
  const size = tile - inset * 2;
  const patternId = "affinity-atmosphere-lattice";

  return (
    <svg className={className} width="100%" height="100%">
      <defs>
        <pattern id={patternId} width={tile} height={tile} patternUnits="userSpaceOnUse">
          <rect
            x={inset}
            y={inset}
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.75}
          />
          <rect
            x={inset}
            y={inset}
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.75}
            transform={`rotate(45 ${tile / 2} ${tile / 2})`}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

/** Thin gold corner bracket — visually consistent with OrnamentalFrame's corner mark, sized for the whole viewport rather than a single panel. */
function ViewportCorner({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={`absolute h-8 w-8 text-antique-gold/20 sm:h-10 sm:w-10 ${className}`}
    >
      <path d="M2 18 V8 a6 6 0 0 1 6 -6 H18" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/**
 * A near-invisible hairline border around the whole viewport plus four
 * corner brackets — the "ornamental borders" atmosphere ingredient,
 * rendered once globally rather than per-section. Inset with
 * `env(safe-area-inset-*)` so it never draws under a phone's notch or
 * home-indicator area.
 */
function ViewportOrnamentalFrame() {
  const inset = {
    top: "max(10px, env(safe-area-inset-top))",
    right: "max(10px, env(safe-area-inset-right))",
    bottom: "max(10px, env(safe-area-inset-bottom))",
    left: "max(10px, env(safe-area-inset-left))",
  };

  return (
    <div className="fixed border border-antique-gold/10" style={inset}>
      <ViewportCorner className="left-0 top-0" />
      <ViewportCorner className="right-0 top-0 -scale-x-100" />
      <ViewportCorner className="bottom-0 left-0 -scale-y-100" />
      <ViewportCorner className="bottom-0 right-0 -scale-x-100 -scale-y-100" />
    </div>
  );
}

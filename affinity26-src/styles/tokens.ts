/**
 * AFFINITY '26 design tokens — single source of truth.
 *
 * tailwind.config.ts imports this file so Tailwind utility classes and any
 * plain-TS consumer (e.g. a canvas/SVG effect, a <meta theme-color>, a
 * future non-Tailwind surface) stay in sync with one definition instead of
 * two. Values are exactly the palette specified in the project brief —
 * nothing here is a designer's guess.
 *
 * Color-pairing rules used throughout components/design-system/ are
 * verified against a real WCAG 2.1 contrast calculation, not assumed —
 * see docs/design-system-accessibility.md for the full contrast matrix.
 * Summary:
 *  - On the dark surfaces this theme is built around (midnight, royalNavy)
 *    and as a burgundy fill, all four of ivory / warmGold / antiqueGold /
 *    desertSand pass AA for normal text (>=4.5:1).
 *  - As an emerald fill, only ivory passes AA for normal text (6.03:1);
 *    warmGold/desertSand pass only at large-text size (>=3.0:1) and
 *    antiqueGold fails outright (2.86:1) — use ivory for any normal-size
 *    text on an emerald background.
 *  - burgundy and emerald are both far too close to midnight in luminance
 *    to use as small *text* on a dark background — background-fill use
 *    only.
 *  - Gold/sand tones are never used as text on ivory (both fail AA badly)
 *    — ivory is a dark-surface text color in this palette, not a light
 *    background for gold text.
 *  - `errorRose` (Phase 12) is the one addition to the brief's original
 *    eight-color palette: the brief's colors have no semantic "error" red
 *    at all, and `burgundy` — the palette's only red-family color — fails
 *    badly as text on a dark background (1.20:1 against midnight; see
 *    docs/design-system-accessibility.md). A warm terracotta/rose reads
 *    as an alert without introducing a jarring pure red into an Arabian
 *    Nights palette, and clears AA comfortably as text on both dark
 *    surfaces (6.60:1 on midnight, 6.02:1 on royalNavy) — see
 *    docs/design-system-accessibility.md for the full computation.
 */

export const colors = {
  midnight: "#070A18",
  royalNavy: "#0D1530",
  antiqueGold: "#C9A24D",
  warmGold: "#E8C76A",
  burgundy: "#3A1024",
  desertSand: "#D9C19A",
  ivory: "#F7F0DE",
  emerald: "#0F6658",
  errorRose: "#E8735A",
} as const;

export type ColorToken = keyof typeof colors;

/**
 * next/font/google (wired in app/layout.tsx) generates the CSS custom
 * properties these reference (--font-display, --font-accent, --font-body).
 * The literal family names are kept as a fallback for the brief moment
 * before a font loads, and so this file still means something if ever
 * read outside a Next.js/next-font context.
 */
export const fontFamilies = {
  /** Cinzel — headings, the wordmark, anything that should read as "carved in gold". */
  display: ["var(--font-display)", "Cinzel", "serif"],
  /** Cormorant Garamond — italic eyebrows, taglines, pull-quotes; the "storytelling" voice. */
  accent: ["var(--font-accent)", "Cormorant Garamond", "serif"],
  /** Inter — body copy and UI text. */
  body: ["var(--font-body)", "Inter", "sans-serif"],
} as const;

/**
 * Named section-spacing scale, additive to Tailwind's default spacing
 * scale (not a replacement for it) — exposed as `p-section-lg`,
 * `gap-section-md`, etc. for the rhythm between/inside sections
 * specifically, so that rhythm can be tuned in one place.
 */
export const spacingScale = {
  xs: "0.5rem",
  sm: "1rem",
  md: "1.5rem",
  lg: "2.5rem",
  xl: "4rem",
  "2xl": "6rem",
  "3xl": "8rem",
} as const;

/**
 * Deliberately conservative — the project brief calls out "repetitive
 * rounded cards" as something to avoid, so there is no xl/full radius
 * token. Sharp/near-sharp edges plus ornamental corner flourishes
 * (OrnamentalFrame) carry the premium feel instead of border-radius.
 */
export const radii = {
  none: "0px",
  sm: "0.125rem",
  md: "0.25rem",
  lg: "0.5rem",
} as const;

export const shadows = {
  goldGlow: "0 0 24px 0 rgba(232, 199, 106, 0.35)",
  card: "0 8px 30px -12px rgba(7, 10, 24, 0.65)",
  ornamental: "0 1px 0 0 rgba(201, 162, 77, 0.4), 0 -1px 0 0 rgba(201, 162, 77, 0.15)",
} as const;

export const borders = {
  hairline: "1px solid rgba(201, 162, 77, 0.35)",
  gold: "1px solid #C9A24D",
  goldStrong: "2px solid #C9A24D",
} as const;

export const transitions = {
  fast: "150ms ease",
  base: "250ms ease",
  slow: "500ms ease",
  /** For larger reveal/entrance motion — a gentle overshoot-free ease-out. */
  ornamental: "700ms cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export const containerWidths = {
  /** Long-form reading — about copy, rules. */
  narrow: "48rem",
  /** Standard section width. */
  content: "75rem",
  /** Full-bleed hero/gallery sections. */
  wide: "90rem",
} as const;

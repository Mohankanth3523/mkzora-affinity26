import { assetPath } from "@/lib/basePath";

export interface BrandLogoProps {
  src: string;
  alt: string;
  /**
   * Tailwind height utility classes controlling the logo's rendered
   * height at each breakpoint, e.g. `"h-12 sm:h-14"`. Width is always
   * `auto` (never set explicitly), so the browser derives it from the
   * source image's own intrinsic ratio — this is what "preserve original
   * aspect ratio, never stretch or crop" (brief) actually means in CSS
   * terms; there is no `object-fit`/cropping box here at all.
   */
  heightClassName: string;
  /**
   * `"plaque"` (default) — a small ivory card with a thin antique-gold
   * hairline border and a soft shadow around the mark. The five logo
   * files this originally shipped with (Phase 29) each had a baked-in
   * near-white/white background, so this plaque doubled as a fix for
   * that; the Phase 33 refresh replaced all five with genuinely
   * transparent PNGs (verified via pixel sampling, not assumed), so that
   * specific problem no longer exists. The plaque stays as this site's
   * own deliberate presentation regardless — read as a small royal seal/
   * medallion, ivory + a hairline gold rule fitting the Arabian Nights
   * material language already used for `OrnamentalFrame`/cards elsewhere
   * — rather than a generic "logo box," and it now frames a genuinely
   * transparent mark instead of masking a white one. It only ever
   * changes the *container*; the logo image inside is never touched.
   *
   * `"bare"` — no card, just the image. For contexts that already sit on
   * a light surface (e.g. print styles), or a caller building its own
   * framing.
   */
  variant?: "plaque" | "bare";
  /**
   * Plaque padding scale — independent of `heightClassName` so the same
   * variant can be used for both a large hero seal and a small compact
   * footer row without the padding overwhelming the smaller ones.
   * @default "md"
   */
  padding?: "sm" | "md" | "lg";
  className?: string;
}

const PADDING_CLASS: Record<NonNullable<BrandLogoProps["padding"]>, string> = {
  sm: "px-2 py-1.5",
  md: "px-3 py-2",
  lg: "px-5 py-3.5",
};

/**
 * Phase 29 — the one place any official AFFINITY '26 brand mark (event
 * emblem, college logo, batch logo, or a digital partner's logo) is
 * rendered. Every logo file under `public/assets/logo/` is treated as an
 * immutable asset: this component never recolors, crops, distorts, or
 * adds a glow/effect to the artwork itself — the only levers it uses are
 * the ones the brief explicitly allows (surrounding container, size,
 * spacing, accessible labelling). A plain `<img>` is used rather than
 * `next/image`, matching the precedent already set for `public/intro/`'s
 * raster assets in Phase 28 (see that phase's notes for why).
 *
 * Phase 44: `src` is a `public/`-relative path (e.g. "/assets/logo/
 * college-logo.png", per `data/branding.ts`'s own doc comment) — passed
 * through `assetPath()` here, the one point this component renders an
 * actual `<img>` tag, so every caller keeps storing/passing the plain
 * `public/`-relative path and never has to know about the app's current
 * `basePath` itself.
 */
export function BrandLogo({
  src,
  alt,
  heightClassName,
  variant = "plaque",
  padding = "md",
  className = "",
}: BrandLogoProps) {
  const image = <img src={assetPath(src)} alt={alt} className={["w-auto", heightClassName].join(" ")} />;

  if (variant === "bare") {
    return <span className={["inline-flex items-center", className].join(" ")}>{image}</span>;
  }

  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-md border border-antique-gold/40 bg-ivory shadow-card",
        PADDING_CLASS[padding],
        className,
      ].join(" ")}
    >
      {image}
    </span>
  );
}

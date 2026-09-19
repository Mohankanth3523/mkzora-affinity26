import { useId } from "react";

export interface CrescentProps {
  /** Pixel size (square). @default 32 */
  size?: number;
  className?: string;
  /** Decorative by default; pass a label to expose it to assistive tech (rare — usually the crescent is pure ornament next to a labeled heading). */
  title?: string;
}

/**
 * The recurring crescent-moon mark — used in the nav wordmark, section
 * eyebrows, and the success-page pass artwork. Built from two circles via
 * an SVG mask (full disc, minus an offset disc) rather than a hand-drawn
 * path, so the crescent shape is geometrically exact at any size.
 * `currentColor` fill so it inherits text color (typically
 * `text-warm-gold` or `text-antique-gold`).
 */
export function Crescent({ size = 32, className = "", title }: CrescentProps) {
  // Unique per instance so multiple Crescents on one page never collide on
  // id (SVG <mask> lookups are document-global, and duplicate ids are
  // invalid HTML regardless).
  const maskId = `crescent-mask-${useId().replace(/:/g, "")}`;
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      className={className}
    >
      {title ? <title>{title}</title> : null}
      <mask id={maskId}>
        <circle cx="16" cy="16" r="12" fill="#fff" />
        <circle cx="21" cy="12" r="10" fill="#000" />
      </mask>
      <circle cx="16" cy="16" r="12" fill="currentColor" mask={`url(#${maskId})`} />
      <circle cx="25" cy="8" r="1.3" fill="currentColor" />
    </svg>
  );
}

import type { ElementType, ReactNode } from "react";

export interface OrnamentalFrameProps {
  children: ReactNode;
  as?: ElementType;
  /** @default "md" */
  padding?: "sm" | "md" | "lg";
  className?: string;
  id?: string;
  /**
   * Phase 22 — small hover lift + gold glow, for a frame that's actually
   * one choice in a browsable/selectable set (EventCard, PackageStep's
   * package cards), not just a bordered box. @default false — most
   * OrnamentalFrame uses (review sections, the registration pass,
   * contact cards, pull-quotes) are read-only display panels, and giving
   * those a hover response would visually invite a click that isn't
   * there. Pure `transform`/`box-shadow`/`border-color` (no layout
   * properties), so it's cheap to animate; the project-wide
   * `prefers-reduced-motion` rule in `app/globals.css` already collapses
   * the transition duration to near-zero, so reduced-motion users still
   * get the end state without the motion.
   */
  interactive?: boolean;
}

const PADDING_CLASS: Record<NonNullable<OrnamentalFrameProps["padding"]>, string> = {
  sm: "p-5",
  md: "p-6 sm:p-8",
  lg: "p-8 sm:p-12",
};

const INTERACTIVE_CLASS =
  "transition-[transform,box-shadow,border-color] duration-base ease-ornamental hover:-translate-y-1 hover:border-antique-gold/60 hover:shadow-gold-glow";

/** One gold corner bracket, rotated per corner via the `className` passed in. */
function CornerMark({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className={`pointer-events-none absolute h-6 w-6 text-antique-gold sm:h-8 sm:w-8 ${className}`}
    >
      <path
        d="M2 14 V6 a4 4 0 0 1 4 -4 H14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="2" cy="2" r="1.4" fill="currentColor" />
    </svg>
  );
}

/**
 * A bordered panel that carries the "royal registry" feel without a
 * rounded card and without glassmorphism/blur — a hairline gold-tinted
 * border plus four corner brackets (a nod to illuminated-manuscript /
 * palace-door ironwork) around a flat, near-opaque royal-navy panel.
 *
 * Used for: event detail panels, the registration wizard's step card,
 * pull-quote blocks, the success/pass screen.
 */
export function OrnamentalFrame({
  children,
  as: Tag = "div",
  padding = "md",
  className = "",
  id,
  interactive = false,
}: OrnamentalFrameProps) {
  return (
    <Tag
      id={id}
      className={[
        "relative border border-antique-gold/30 bg-royal-navy/60",
        PADDING_CLASS[padding],
        interactive ? INTERACTIVE_CLASS : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <CornerMark className="left-0 top-0" />
      <CornerMark className="right-0 top-0 -scale-x-100" />
      <CornerMark className="bottom-0 left-0 -scale-y-100" />
      <CornerMark className="bottom-0 right-0 -scale-x-100 -scale-y-100" />
      {children}
    </Tag>
  );
}

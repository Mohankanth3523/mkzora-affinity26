export interface GoldDividerProps {
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const WIDTH_CLASS: Record<NonNullable<GoldDividerProps["size"]>, string> = {
  sm: "w-16",
  md: "w-24",
  lg: "w-36",
};

/**
 * Ornamental rule: two hairlines fading outward from a small centered
 * diamond glyph. Purely decorative (`aria-hidden`) — never the only
 * separator between two sections that also need a semantic boundary
 * (use a landmark element for that).
 *
 * No animation: a divider that visibly moves on every scroll-into-view
 * reads as "gaming website," which the brief explicitly asks to avoid, so
 * this stays static regardless of `prefers-reduced-motion`.
 */
export function GoldDivider({ size = "md", className = "" }: GoldDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={["flex items-center justify-center gap-3", className].join(" ")}
    >
      <span
        className={[
          "h-px bg-gradient-to-r from-transparent to-antique-gold/70",
          WIDTH_CLASS[size],
        ].join(" ")}
      />
      <span className="h-1.5 w-1.5 rotate-45 border border-antique-gold bg-warm-gold/80" />
      <span
        className={[
          "h-px bg-gradient-to-l from-transparent to-antique-gold/70",
          WIDTH_CLASS[size],
        ].join(" ")}
      />
    </div>
  );
}

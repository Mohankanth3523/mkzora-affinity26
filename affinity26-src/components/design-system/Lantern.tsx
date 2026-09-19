export interface LanternProps {
  /** Pixel width; height follows the lantern's aspect ratio. @default 48 */
  size?: number;
  className?: string;
  /** Subtle warm-gold glow pulse behind the lantern body. @default true — automatically disabled under prefers-reduced-motion by the global rule in app/globals.css. */
  glow?: boolean;
  title?: string;
}

/**
 * Hanging Arabian lantern silhouette — used sparingly (hero section, event
 * cards, footer) as a motif, not tiled decoration. Body is a flat gold
 * outline (no gradient fill, per the brief's "avoid excessive gradients"),
 * with an optional soft radial glow pulsing behind it to suggest a lit
 * candle without any particle/sparkle effect.
 */
export function Lantern({ size = 48, className = "", glow = true, title }: LanternProps) {
  const height = Math.round(size * 1.4);
  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height }}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      aria-label={title}
    >
      {glow ? (
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[38%] -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-warm-gold/40 blur-md"
          style={{
            width: size * 0.7,
            height: size * 0.7,
            animation: "lantern-glow 3.6s ease-in-out infinite",
          }}
        />
      ) : null}
      <svg viewBox="0 0 40 56" width={size} height={height} className="relative text-antique-gold">
        {/* Suspension chain */}
        <line x1="20" y1="0" x2="20" y2="8" stroke="currentColor" strokeWidth="1.2" />
        {/* Cap */}
        <path d="M12 8 L20 3 L28 8 Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        {/* Body */}
        <path
          d="M11 10 H29 L26 16 V38 L20 44 L14 38 V16 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* Body lattice */}
        <line x1="14" y1="16" x2="26" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="14" y1="28" x2="26" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="20" y1="16" x2="20" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        {/* Base finial */}
        <path d="M17 44 L20 50 L23 44 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
        {/* Flame */}
        <circle cx="20" cy="24" r="3" fill="currentColor" className="text-warm-gold" opacity="0.85" />
      </svg>
    </div>
  );
}

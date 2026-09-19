import { STAR_POSITIONS } from "@/styles/star-positions";

export interface StarFieldProps {
  className?: string;
  /** @default true — set false for a static field (e.g. behind body text where motion would be distracting). */
  animated?: boolean;
}

/**
 * Absolutely-positioned field of small gold/ivory dots meant to sit behind
 * a dark hero/section as a night-sky texture. The parent element must be
 * `position: relative` (or otherwise establish a positioning context) —
 * this component fills it via `inset-0` and does not size itself.
 *
 * Positions come from styles/star-positions.ts, a deterministic array
 * generated once with a seeded PRNG — never `Math.random()` here, which
 * would cause a server/client hydration mismatch on every request.
 *
 * `aria-hidden`: this is texture, not content. The twinkle animation is a
 * CSS `@keyframes` (see app/globals.css) that the project-wide
 * `prefers-reduced-motion` rule collapses automatically — no per-component
 * media query needed.
 */
export function StarField({ className = "", animated = true }: StarFieldProps) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {STAR_POSITIONS.map((star, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-ivory"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: animated ? undefined : star.opacity * 0.7,
            animation: animated
              ? `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`
              : undefined,
            // Consumed by the `twinkle` keyframes in app/globals.css.
            ["--star-opacity" as string]: star.opacity,
            ["--star-min-opacity" as string]: star.opacity * 0.2,
          }}
        />
      ))}
    </div>
  );
}

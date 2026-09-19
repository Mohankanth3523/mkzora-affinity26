import type { Config } from "tailwindcss";
import {
  colors,
  spacingScale,
  radii,
  shadows,
  containerWidths,
  transitions,
} from "./styles/tokens";

/**
 * PHASE 03: Tailwind consumes styles/tokens.ts directly instead of
 * duplicating values here, so the token file stays the single source of
 * truth (see its header comment). Key names below are the *Tailwind*
 * vocabulary (kebab-case, matches Tailwind convention) mapped from the
 * *token* vocabulary (camelCase, matches TS convention) — e.g.
 * `colors.royalNavy` becomes the `royal-navy` utility (`bg-royal-navy`,
 * `text-royal-navy`, etc.).
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"], // present for future use; the theme itself is dark by design, not by media query
  theme: {
    extend: {
      colors: {
        midnight: colors.midnight,
        "royal-navy": colors.royalNavy,
        "antique-gold": colors.antiqueGold,
        "warm-gold": colors.warmGold,
        burgundy: colors.burgundy,
        "desert-sand": colors.desertSand,
        ivory: colors.ivory,
        emerald: colors.emerald,
        "error-rose": colors.errorRose,
      },
      fontFamily: {
        display: ["var(--font-display)", "Cinzel", "serif"],
        accent: ["var(--font-accent)", "Cormorant Garamond", "serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
      },
      spacing: {
        "section-xs": spacingScale.xs,
        "section-sm": spacingScale.sm,
        "section-md": spacingScale.md,
        "section-lg": spacingScale.lg,
        "section-xl": spacingScale.xl,
        "section-2xl": spacingScale["2xl"],
        "section-3xl": spacingScale["3xl"],
      },
      borderRadius: {
        none: radii.none,
        sm: radii.sm,
        DEFAULT: radii.md,
        lg: radii.lg,
      },
      boxShadow: {
        "gold-glow": shadows.goldGlow,
        card: shadows.card,
        ornamental: shadows.ornamental,
      },
      maxWidth: {
        narrow: containerWidths.narrow,
        content: containerWidths.content,
        wide: containerWidths.wide,
      },
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "500ms",
        ornamental: "700ms",
      },
      transitionTimingFunction: {
        ornamental: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      backgroundImage: {
        // Very low-key radial vignette used behind hero/section surfaces —
        // intentionally not a "purple AI gradient": a single dark-to-darker
        // navy falloff, meant to be nearly subliminal.
        "night-vignette":
          "radial-gradient(120% 100% at 50% 0%, #0D1530 0%, #070A18 70%)",
      },
      keyframes: {
        // PHASE 06: a single fade-up reveal, reused six times (below) at
        // increasing delays to build the hero's "stars → crescent →
        // lanterns → title → supporting text → CTA" sequence. One
        // keyframe, six delays — not six different animations — so the
        // whole sequence reads as one consistent gesture.
        "hero-reveal": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // PHASE 10: the event details modal's entrance. Two separate
        // keyframes (not one shared with hero-reveal) because the
        // backdrop only fades while the panel also rises — different
        // enough motion that reusing hero-reveal for both would mean
        // either the backdrop rising too (wrong) or the panel not
        // rising (loses the "sheet" feel on mobile).
        // Live countdown: the seconds numeral eases in on every tick (opacity + 3px rise), a soft "pulse of time".
        "count-tick": {
          "0%": { opacity: "0.55", transform: "translateY(3px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "modal-backdrop": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "modal-panel": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        // Each stage's delay is baked into its own named animation
        // (rather than pairing `animate-hero-reveal` with a separate
        // arbitrary `[animation-delay:...]` utility) so there is no
        // dependency on Tailwind's utility-ordering to decide which of
        // two competing `animation-delay` declarations wins — each class
        // here is self-contained. `backwards` fill-mode holds the 0%
        // (invisible) state during the delay, and is pure CSS — nothing
        // here depends on JavaScript running.
        //
        // Phase 22 motion audit: tightened from a 900ms step/350ms
        // stagger (finishing at ~2650ms) to 700ms/220ms (finishing at
        // ~1800ms) — same six-stage choreography, same easing, just
        // faster, to actually read as "cinematic but short" rather than
        // a nearly-three-second wait before the CTA is usable.
        "hero-1": "hero-reveal 700ms cubic-bezier(0.16,1,0.3,1) 0ms backwards", // stars appear
        "hero-2": "hero-reveal 700ms cubic-bezier(0.16,1,0.3,1) 220ms backwards", // crescent appears
        "hero-3": "hero-reveal 700ms cubic-bezier(0.16,1,0.3,1) 440ms backwards", // lanterns illuminate
        "hero-4": "hero-reveal 700ms cubic-bezier(0.16,1,0.3,1) 660ms backwards", // title reveals
        "hero-5": "hero-reveal 700ms cubic-bezier(0.16,1,0.3,1) 880ms backwards", // supporting text reveals
        "hero-6": "hero-reveal 700ms cubic-bezier(0.16,1,0.3,1) 1100ms backwards", // CTA appears
        "count-tick": "count-tick 400ms cubic-bezier(0.16,1,0.3,1)",
        "modal-backdrop": "modal-backdrop 200ms ease-out",
        "modal-panel": "modal-panel 250ms cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [],
};

export default config;

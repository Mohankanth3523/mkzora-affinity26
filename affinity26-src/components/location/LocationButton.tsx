import { EVENT_LOCATION_URL } from "@/data/location";
import { ArrowUpRightGlyph, MapPinGlyph } from "./LocationIcons";

export interface LocationButtonProps {
  /**
   * "button" — midnight-navy plate with a gold border (hero, contact page).
   * "link"   — quiet gold text link (footer).
   * @default "button"
   */
  variant?: "button" | "link";
  /** @default "View Event Location" */
  label?: string;
  className?: string;
}

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warm-gold";

const BUTTON_CLASS =
  "group inline-flex min-h-11 items-center justify-center gap-2.5 rounded-sm border border-antique-gold/70 bg-royal-navy/80 px-6 py-2.5 font-body text-sm font-semibold uppercase tracking-[0.08em] text-warm-gold shadow-card backdrop-blur-sm transition-[background-color,border-color,box-shadow,transform] duration-base ease-ornamental hover:-translate-y-0.5 hover:border-warm-gold hover:bg-royal-navy hover:shadow-gold-glow active:translate-y-0 active:scale-[0.97] " +
  FOCUS;

const LINK_CLASS =
  "group inline-flex min-h-11 items-center gap-2.5 font-body text-sm text-ivory/90 underline decoration-transparent underline-offset-4 transition-colors duration-fast hover:text-warm-gold hover:decoration-warm-gold/60 sm:min-h-0 " +
  FOCUS;

/**
 * The official event-location CTA. A plain external `<a>`: it opens the Google Maps link in a NEW tab
 * (`target="_blank"`) with `rel="noopener noreferrer"`. The URL is never rendered as text.
 */
export function LocationButton({ variant = "button", label = "View Event Location", className = "" }: LocationButtonProps) {
  return (
    <a
      href={EVENT_LOCATION_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={[variant === "button" ? BUTTON_CLASS : LINK_CLASS, className].filter(Boolean).join(" ")}
    >
      <MapPinGlyph
        className={
          variant === "button"
            ? "h-4 w-4 shrink-0 transition-transform duration-base ease-ornamental group-hover:-translate-y-0.5"
            : "h-4 w-4 shrink-0 text-antique-gold transition-colors duration-fast group-hover:text-warm-gold"
        }
      />
      <span>{label}</span>
      <ArrowUpRightGlyph className="h-3.5 w-3.5 shrink-0 opacity-70 transition-[transform,opacity] duration-base group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
      <span className="sr-only"> — opens Google Maps in a new tab</span>
    </a>
  );
}

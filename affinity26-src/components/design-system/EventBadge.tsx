import type { EventCategory, EventMode, RegistrationMode, VerificationStatus } from "@/types/event";

type EventBadgeProps =
  | { variant: "category"; value: EventCategory; className?: string }
  | { variant: "mode"; value: EventMode; className?: string }
  | { variant: "verification"; value: VerificationStatus; className?: string }
  | { variant: "registration-mode"; value: RegistrationMode; className?: string };

const CATEGORY_LABEL: Record<EventCategory, string> = {
  sports: "Sports",
  "cultural-onstage": "Cultural · On-Stage",
  "cultural-offstage": "Cultural · Off-Stage",
  "online-cultural": "Online · Cultural",
  "online-esports": "Online · Esports",
};

const MODE_LABEL: Record<EventMode, string> = {
  offline: "On-Campus",
  online: "Online",
};

const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  confirmed: "Confirmed",
  "pending-organizer": "Pending Organizer Confirmation",
  conflicting: "Conflicting Sources — Verify",
};

/**
 * The event/registration pricing restructuring phase: "Direct Contact
 * Registration" must read as another official event category, not a
 * warning — so it shares this file's ordinary gold-on-dark chip styling,
 * never the burgundy "conflicting" treatment. "standard" has a label
 * defined for type-completeness but this app never actually renders it —
 * a standard event needs no extra chip beyond its existing category/mode
 * pair (see EventCard's doc comment).
 */
const REGISTRATION_MODE_LABEL: Record<RegistrationMode, string> = {
  standard: "Standard Package Event",
  "direct-contact": "Direct Contact Registration",
};

/** Small dot used on confirmed/pending chips — a plain circle, no icon font/dependency. */
function Dot({ className }: { className: string }) {
  return <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${className}`} />;
}

/** Hand-drawn triangle-alert glyph for the conflicting/verify state — avoids adding an icon-library dependency for one glyph. */
function AlertGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3 w-3 shrink-0">
      <path
        d="M8 1.5 L14.8 13.5 H1.2 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <line x1="8" y1="6" x2="8" y2="9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

const BASE_CLASS =
  "inline-flex items-center gap-1.5 border px-2.5 py-1 font-body text-xs font-medium uppercase tracking-wide";

/**
 * Small label chip for an event's category, mode, or data-verification
 * status. Color pairings are deliberately restricted to the ones verified
 * in styles/tokens.ts's header comment (ivory/warm-gold/antique-gold/
 * desert-sand text on dark; burgundy/emerald only as a filled background
 * with light text) — never introduce a new color combination here without
 * re-checking contrast.
 *
 * `verification="conflicting"` and `"pending-organizer"` are the one place
 * in the design system where a fact's uncertainty is meant to be visible
 * to a site visitor, not just left in code comments — see
 * docs/affinity-content-truth.md §14/§15.
 */
export function EventBadge(props: EventBadgeProps) {
  const { variant, value, className = "" } = props;

  if (variant === "category") {
    return (
      <span className={[BASE_CLASS, "border-antique-gold/50 text-desert-sand", className].join(" ")}>
        {CATEGORY_LABEL[value]}
      </span>
    );
  }

  if (variant === "mode") {
    const isOnline = value === "online";
    return (
      <span
        className={[
          BASE_CLASS,
          isOnline
            ? "border-emerald bg-emerald text-ivory"
            : "border-antique-gold/50 text-desert-sand",
          className,
        ].join(" ")}
      >
        {MODE_LABEL[value]}
      </span>
    );
  }

  if (variant === "registration-mode") {
    // Dignified, not alarming — same gold chip language as category/mode, never the burgundy "conflicting" treatment.
    return (
      <span className={[BASE_CLASS, "border-antique-gold bg-antique-gold/10 text-antique-gold", className].join(" ")}>
        {REGISTRATION_MODE_LABEL[value]}
      </span>
    );
  }

  // variant === "verification"
  if (value === "confirmed") {
    return (
      <span className={[BASE_CLASS, "border-emerald/60 text-desert-sand", className].join(" ")}>
        <Dot className="bg-emerald" />
        {VERIFICATION_LABEL[value]}
      </span>
    );
  }

  if (value === "pending-organizer") {
    return (
      <span className={[BASE_CLASS, "border-warm-gold/70 text-warm-gold", className].join(" ")}>
        <Dot className="bg-warm-gold" />
        {VERIFICATION_LABEL[value]}
      </span>
    );
  }

  // conflicting — the one status that should read as a real flag, not decoration
  return (
    <span className={[BASE_CLASS, "border-burgundy bg-burgundy text-ivory", className].join(" ")}>
      <AlertGlyph />
      {VERIFICATION_LABEL[value]}
    </span>
  );
}

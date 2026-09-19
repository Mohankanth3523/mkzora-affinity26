import type { MouseEvent } from "react";
import type { AffinityEvent } from "@/types/event";
import { EventBadge, OrnamentalFrame } from "@/components/design-system";
import { TYPE_LABEL } from "@/lib/events/eventLabels";

export interface EventCardProps {
  event: AffinityEvent;
  /**
   * Phase 10: when provided, renders a "View Details" trigger at the
   * card's foot that opens `EventDetailsModal` for this event. Passing
   * the clicked button element back (rather than the card grabbing its
   * own ref) lets the caller manage one shared "return focus here on
   * close" ref instead of every card needing its own. Omitted entirely
   * — no dead button — when the card is used somewhere non-interactive.
   *
   * The event/registration pricing restructuring phase: for a
   * `registrationMode: "direct-contact"` event, this is the *only*
   * footer button ever rendered (see `isDirectContact` below) — it never
   * toggles a package selection, whatever `onToggleSelect` is also
   * passed. Newly passed by `EventsStep` as well as `EventsExplorer`, so
   * a direct-contact card reached from either place opens the exact same
   * `EventDetailsModal`, with the exact same "contact the in-charge"
   * copy — one component, not two competing patterns.
   */
  onViewDetails?: (event: AffinityEvent, trigger: HTMLButtonElement) => void;
  /**
   * Phase 13: when provided, renders a full-width select/selected toggle
   * at the card's foot instead — the registration wizard's Events step
   * multi-select. `selected` drives both the toggle's label/icon and a
   * subtle gold ring around the whole card. Independent of
   * `onViewDetails` (a card could in principle render both footers, one
   * above the other, though no current caller passes both) — except for
   * a direct-contact event, where this is always ignored; see
   * `onViewDetails` above.
   */
  selected?: boolean;
  onToggleSelect?: (event: AffinityEvent) => void;
  /**
   * Phase 23 (accessibility audit): the event name's own heading level.
   * `EventsExplorer` renders a page with its own `<h1>` ("The Royal
   * Courts") — the event/registration pricing restructuring phase added
   * its own `<h2>` per section ("Standard AFFINITY Events" /
   * "Direct-Contact Events") above each card grid, so cards there now
   * pass `"h3"` (a sibling-list heading nested under that section's
   * `h2`, not a skip) — same value as the default, kept explicit at the
   * call site for clarity. The registration wizard's `EventsStep` sits
   * under a `<h2>`/`<h3>` pair already (`RegistrationStep`'s "Events",
   * then this step's own "Select Events"), so it also leaves this at
   * the default.
   * @default "h3"
   */
  headingLevel?: "h2" | "h3";
}

/** Plain checkbox-style glyph — filled/checked when selected, empty outline otherwise. Hand-drawn to match `EventBadge`'s existing no-icon-library convention. */
function SelectGlyph({ selected }: { selected: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0">
      <rect x="1.25" y="1.25" width="13.5" height="13.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      {selected ? (
        <path
          d="M3.7 8.3 L6.6 11.2 L12.3 4.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
}

/**
 * One event's summary card. Presentational — no hooks of its own, no
 * data fetching — reused by `EventsExplorer`'s grid and the registration
 * wizard's Events step. `onViewDetails` is a plain callback prop, not a
 * hook, so this file still doesn't need `"use client"` itself — it only
 * behaves like client code because its callers already are.
 *
 * Phase 31 (event selection & pricing cleanup): this card answers exactly
 * four questions — "What is this event?" (category + name), "Online or
 * offline?" (mode badge), "Individual or team?" (`TYPE_LABEL`), and "Who
 * is the contact?" (below) — nothing else. No fee, price, or payment text
 * appears anywhere on this component; pricing is a package-level concept
 * now (`data/pricing.ts` / `lib/registration/pricing.ts`), deliberately
 * kept off the event card. The data-verification badge (`EventBadge
 * variant="verification"`, e.g. "Pending Organizer Confirmation") is also
 * gone from the card — the phase brief explicitly lists that exact phrase
 * as clutter to remove — but the same information is still visible in
 * `EventDetailsModal`, one click away, where a genuine data-confidence
 * caveat is worth surfacing.
 *
 * Every displayed field is read straight off the `AffinityEvent` passed
 * in; nothing here computes a new fact. `description` is conditionally
 * omitted (some events have no one-line summary in the source data), and
 * the contact block falls back to the literal words "To be announced"
 * when `event.contact` is empty — never a fabricated name or number. The
 * limited-slot indicator, when shown, is deliberately just the words
 * "Limited Slots" — never `limitedSlots.cap` (e.g. "First 36"), since the
 * brief calls that number-bearing phrasing out by name as clutter to
 * remove and asks for "a very subtle label" instead.
 *
 * The event/registration pricing restructuring phase: a
 * `registrationMode: "direct-contact"` event (Chess, Badminton, the
 * Track & Field group, Free Fire, PUBG, E-Football, FIFA, Short Film,
 * Sollal Vel) gets a "Direct Contact Registration" chip alongside its
 * category/mode badges, and its footer *never* renders the
 * select/selected toggle, however `onToggleSelect` is wired by the
 * caller — clicking it must never be able to add the event to
 * `RegistrationState.selectedEvents` as a package selection. Instead it
 * always renders the same "Contact In-Charge" trigger a standard card's
 * `onViewDetails` uses, just relabeled, opening the same
 * `EventDetailsModal` — which itself replaces its package-registration
 * button with a plain "contact the in-charge" notice for this event
 * type. Still no fee/price text anywhere on the card itself, matching
 * the rest of this component's existing rule.
 */
export function EventCard({
  event,
  onViewDetails,
  selected,
  onToggleSelect,
  headingLevel: HeadingTag = "h3",
}: EventCardProps) {
  const isLimited = event.limitedSlots?.isLimited === true;
  const isDirectContact = event.registrationMode === "direct-contact";
  const contacts = event.contact ?? [];

  function handleViewDetails(clickEvent: MouseEvent<HTMLButtonElement>) {
    onViewDetails?.(event, clickEvent.currentTarget);
  }

  return (
    <OrnamentalFrame
      as="article"
      padding="sm"
      interactive
      className={["flex h-full flex-col gap-3", selected ? "ring-1 ring-antique-gold" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <EventBadge variant="category" value={event.category} />
          <EventBadge variant="mode" value={event.mode} />
          {isDirectContact ? <EventBadge variant="registration-mode" value={event.registrationMode} /> : null}
        </div>
        {isLimited ? (
          <span className="font-body text-[0.65rem] font-medium uppercase tracking-[0.15em] text-antique-gold/70">
            Limited Slots
          </span>
        ) : null}
      </div>

      <HeadingTag className="font-display text-lg font-semibold leading-snug text-ivory sm:text-xl">
        {event.name}
      </HeadingTag>

      <p className="font-body text-sm text-desert-sand">{TYPE_LABEL[event.type]}</p>

      {event.description ? (
        <p className="font-body text-sm leading-relaxed text-desert-sand sm:text-base">
          {event.description}
        </p>
      ) : null}

      <div className="border-t border-antique-gold/15 pt-3">
        <p className="font-body text-[0.65rem] font-medium uppercase tracking-[0.15em] text-desert-sand/70">
          Contact
        </p>
        {contacts.length > 0 ? (
          <ul className="mt-1.5 flex flex-col gap-1">
            {contacts.map((person, index) => (
              <li key={index} className="font-body text-sm text-ivory">
                {person.name}
                {person.phone ? (
                  <span className="text-desert-sand"> &middot; {person.phone}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1.5 font-body text-sm text-desert-sand/80">To be announced</p>
        )}
      </div>

      {isDirectContact ? (
        onViewDetails ? (
          <button
            type="button"
            onClick={handleViewDetails}
            className="mt-auto inline-flex min-h-11 items-center gap-1.5 border-t border-antique-gold/20 pt-3 text-left font-body text-sm font-medium uppercase tracking-wide text-antique-gold transition-colors duration-fast hover:text-warm-gold"
          >
            Contact In-Charge
            <span aria-hidden="true">&rarr;</span>
          </button>
        ) : null
      ) : (
        <>
          {onViewDetails ? (
            <button
              type="button"
              onClick={handleViewDetails}
              className="mt-auto inline-flex min-h-11 items-center gap-1.5 border-t border-antique-gold/20 pt-3 text-left font-body text-sm font-medium uppercase tracking-wide text-antique-gold transition-colors duration-fast hover:text-warm-gold"
            >
              View Details
              <span aria-hidden="true">&rarr;</span>
            </button>
          ) : null}

          {onToggleSelect ? (
            <button
              type="button"
              aria-pressed={Boolean(selected)}
              onClick={() => onToggleSelect(event)}
              className={[
                "mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 border-t pt-3 font-body text-sm font-semibold uppercase tracking-wide transition-colors duration-fast",
                selected
                  ? "border-antique-gold/40 text-antique-gold"
                  : "border-antique-gold/20 text-desert-sand hover:text-ivory",
              ].join(" ")}
            >
              <SelectGlyph selected={Boolean(selected)} />
              {selected ? "Selected" : "Select This Event"}
            </button>
          ) : null}
        </>
      )}
    </OrnamentalFrame>
  );
}

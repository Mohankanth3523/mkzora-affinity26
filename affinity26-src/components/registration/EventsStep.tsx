"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRegistration } from "@/lib/registration/context";
import { allEvents, getEventById } from "@/data/events";
import { MODE_LABEL } from "@/lib/events/eventLabels";
import { EventCard } from "@/components/events/EventCard";
import { EventDetailsModal } from "@/components/events/EventDetailsModal";
import { OrnamentalFrame } from "@/components/design-system";
import type { AffinityEvent } from "@/types/event";

/** Hand-drawn "×" glyph for the remove-event control — matches the project's no-icon-library convention (see EventBadge's AlertGlyph). */
function RemoveGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
      <line x1="1.5" y1="1.5" x2="10.5" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10.5" y1="1.5" x2="1.5" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Step 02 — Select Events. Multi-select event picker, reading
 * `allEvents` straight from the centralized data layer (this step is
 * already inside a client-only route subtree — `app/register/layout.tsx`
 * — so, unlike the public Events Explorer's Server→Client split, there's
 * no server boundary to pass data through; `EventPreselect`, Phase 10,
 * already established the same direct-import pattern here).
 *
 * Reuses `EventCard` (its Phase 13 `selected`/`onToggleSelect` mode, not
 * `onViewDetails` — this step's own brief doesn't ask for a details
 * drawer). "Do not invent restrictions": every event in `data/events/*`
 * is selectable here — there is no eligibility-matching logic
 * cross-checking a participant's year of study against an event's
 * `eligibility` text, because no source document defines that as a
 * structured, enforceable rule (see `docs/phase-13-events-step-notes.md`).
 *
 * Phase 31 replaced the category filter with a mode filter ("All Events /
 * Offline / Online"). Phase 39 (remove Online Events completely) removed
 * that filter bar entirely: once the Online Events category is excluded
 * from `allEvents` (see `data/events/index.ts`), every remaining
 * `registrationMode === "standard"` event is `mode === "offline"` — the
 * "Online" tab would always show zero results, and "All Events"/"Offline"
 * would always be identical, so keeping either sub-filter would just be
 * dead UI. Standard events now render as one plain grid, exactly the way
 * direct-contact events already did (see `renderDirectContactGrid` below).
 * Search still filters `allEvents` by name/description, unchanged. See
 * docs/phase-39-remove-online-events-notes.md.
 *
 * The event/registration pricing restructuring phase layers a second,
 * higher-priority split on top: every event is first divided into
 * "Standard AFFINITY Events" (`registrationMode === "standard"` —
 * covered by whichever of the 3 packages the participant picks in Step
 * 04, selectable here exactly as before) and "Direct-Contact Events"
 * (`registrationMode === "direct-contact"` — Chess, Badminton, the
 * Track & Field group, Free Fire, PUBG, E-Football, FIFA, Short Film,
 * Sollal Vel). Search still narrows *within* each of those two sections,
 * unchanged. A direct-contact event can never be toggled into
 * `state.selectedEvents` here — its card renders a "Contact In-Charge"
 * trigger (`EventCard`'s own doc comment) that opens the same
 * `EventDetailsModal` `EventsExplorer` uses, instead of the
 * select/selected toggle every standard card still gets. This keeps
 * every direct-contact event visible on this step (per the phase brief's
 * explicit "must remain visible, not hidden") without it ever being able
 * to affect the package total computed in `lib/registration/pricing.ts`.
 */
const STANDARD_HEADING = "Standard AFFINITY Events";
const STANDARD_SUBTEXT = "Covered by your selected registration package.";
const DIRECT_CONTACT_HEADING = "Direct-Contact Events";
const DIRECT_CONTACT_SUBTEXT =
  "These events have separate entry procedures. Contact the respective in-charge for participation details.";

export function EventsStep() {
  const { state, dispatch } = useRegistration();
  const [query, setQuery] = useState("");
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const searchId = useId();
  const resultsId = useId();
  const modalTriggerRef = useRef<HTMLButtonElement | null>(null);

  const selectedIds = useMemo(
    () => new Set(state.selectedEvents.map((selection) => selection.eventId)),
    [state.selectedEvents],
  );

  const selectedEvents = useMemo(
    () =>
      state.selectedEvents
        .map((selection) => getEventById(selection.eventId))
        .filter((event): event is AffinityEvent => Boolean(event)),
    [state.selectedEvents],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allEvents;
    return allEvents.filter((event) => {
      const haystack = event.description ? `${event.name} ${event.description}` : event.name;
      return haystack.toLowerCase().includes(q);
    });
  }, [query]);

  // The event/registration pricing restructuring phase's primary split —
  // computed from `filtered`, so search still narrows within each group
  // exactly as before. Phase 39 removed the mode sub-filter that used to
  // layer on top of `standardFiltered` here (see this file's top doc
  // comment) — every standard event is offline now that the Online Events
  // category is gone, so there is nothing left to sub-filter.
  const standardFiltered = useMemo(
    () => filtered.filter((event) => event.registrationMode === "standard"),
    [filtered],
  );
  const directContactFiltered = useMemo(
    () => filtered.filter((event) => event.registrationMode === "direct-contact"),
    [filtered],
  );

  const openEvent = openEventId ? (getEventById(openEventId) ?? null) : null;

  function toggleEvent(event: AffinityEvent) {
    dispatch(
      selectedIds.has(event.id)
        ? { type: "DESELECT_EVENT", eventId: event.id }
        : { type: "SELECT_EVENT", eventId: event.id },
    );
  }

  function handleViewDetails(event: AffinityEvent, trigger: HTMLButtonElement) {
    modalTriggerRef.current = trigger;
    setOpenEventId(event.id);
  }

  function renderStandardGrid(events: AffinityEvent[]) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            selected={selectedIds.has(event.id)}
            onToggleSelect={toggleEvent}
          />
        ))}
      </div>
    );
  }

  function renderDirectContactGrid(events: AffinityEvent[]) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onViewDetails={handleViewDetails} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-2xl font-semibold tracking-wide text-ivory">Select Events</h3>
        <p className="font-accent text-base italic text-warm-gold">
          Choose the events you wish to participate in.
        </p>
      </div>

      <OrnamentalFrame padding="sm" className="mt-6">
        <h4 className="font-body text-xs font-medium uppercase tracking-wide text-desert-sand">
          Selected Events ({selectedEvents.length})
        </h4>

        {selectedEvents.length === 0 ? (
          <p className="mt-2 font-body text-sm text-desert-sand/80">
            No events selected yet — choose from the events below.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {selectedEvents.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-3 border border-antique-gold/20 px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="font-body text-sm font-medium text-ivory">{event.name}</span>
                  <span className="font-body text-xs text-desert-sand">{MODE_LABEL[event.mode]}</span>
                </div>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "DESELECT_EVENT", eventId: event.id })}
                  aria-label={`Remove ${event.name}`}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 border border-antique-gold/30 px-3 font-body text-xs font-medium uppercase tracking-wide text-desert-sand transition-colors duration-fast hover:border-error-rose/60 hover:text-error-rose"
                >
                  <RemoveGlyph />
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </OrnamentalFrame>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <div className="w-full sm:w-72">
          <label htmlFor={searchId} className="sr-only">
            Search events by name
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events…"
            aria-describedby={resultsId}
            className="min-h-11 w-full border border-antique-gold/40 bg-royal-navy/60 px-4 py-2 font-body text-sm text-ivory placeholder:text-desert-sand"
          />
        </div>
      </div>

      <p id={resultsId} aria-live="polite" className="mt-4 font-body text-sm text-desert-sand">
        {filtered.length} {filtered.length === 1 ? "event" : "events"} found
      </p>

      {filtered.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-2 border border-antique-gold/20 px-6 py-16 text-center">
          <p className="font-accent text-lg italic text-warm-gold">No events match your search.</p>
          <p className="font-body text-sm text-desert-sand">Try a different name, or clear the filters above.</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-12">
          {standardFiltered.length > 0 && (
            <div>
              <h4 className="font-display text-lg font-semibold tracking-wide text-ivory">{STANDARD_HEADING}</h4>
              <p className="mt-1 font-body text-sm text-desert-sand">{STANDARD_SUBTEXT}</p>
              <div className="mt-5">{renderStandardGrid(standardFiltered)}</div>
            </div>
          )}

          {directContactFiltered.length > 0 && (
            <div>
              <h4 className="font-display text-lg font-semibold tracking-wide text-ivory">
                {DIRECT_CONTACT_HEADING}
              </h4>
              <p className="mt-1 font-body text-sm text-desert-sand">{DIRECT_CONTACT_SUBTEXT}</p>
              <div className="mt-5">{renderDirectContactGrid(directContactFiltered)}</div>
            </div>
          )}
        </div>
      )}

      {openEvent ? (
        <EventDetailsModal event={openEvent} onClose={() => setOpenEventId(null)} triggerRef={modalTriggerRef} />
      ) : null}
    </div>
  );
}

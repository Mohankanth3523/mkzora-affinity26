"use client";

import { useId, useMemo, useRef, useState } from "react";
import type { AffinityEvent } from "@/types/event";
import { SectionContainer } from "@/components/design-system";
import { EVENT_GROUPS, EVENT_GROUP_LABEL, EVENT_GROUP_CATEGORIES, type EventGroup } from "@/lib/events/eventGroups";
import { EventCard } from "./EventCard";
import { EventDetailsModal } from "./EventDetailsModal";

export interface EventsExplorerProps {
  events: AffinityEvent[];
}

/**
 * "The Royal Courts" — the events explorer. Client component (search
 * and category-filter state), fed by `allEvents` from `app/events/
 * page.tsx` — a Server Component that reads the centralized data layer
 * and passes it down, rather than this component importing `data/`
 * directly, so `EventCard`/`EventsExplorer` stay reusable wherever else
 * a filtered event list is needed.
 *
 * "Selection state" (one of Phase 09's listed features) is implemented
 * as the category filter's own pressed/active state (`aria-pressed`) —
 * deliberately *not* a per-card shortlist mechanism; see
 * docs/phase-09-events-explorer-notes.md for the full reasoning. Phase
 * 10 adds a genuinely different kind of selection on top: which event's
 * details modal is open (`openEventId`) — exactly the "deliberate
 * future step" that phase's notes said a real selection feature should
 * be, rather than folding it into the filter chips.
 *
 * The event/registration pricing restructuring phase: the filtered
 * result now renders as two visually separated sections — Standard
 * AFFINITY Events (covered by the registration packages) and
 * Direct-Contact Events (Chess, Badminton, the Track & Field group, Free
 * Fire, PUBG, E-Football, FIFA, Short Film, Sollal Vel — separate entry
 * fee and process, handled by the event's own in-charge) — rather than
 * one flat grid, so the distinction is visible while browsing, not just
 * inside a card's own details modal. The category tabs (All/Sports/
 * Culturals — Phase 39 removed the fourth "Online" tab along with the
 * Online Events category site-wide; see
 * docs/phase-39-remove-online-events-notes.md) and search keep filtering
 * across both sections exactly as before. Every card still opens the same
 * `EventDetailsModal` via `onViewDetails` regardless of section — this
 * page has never had a selection/payment mechanism of its own, so
 * `EventCard`'s direct-contact footer swap (see its own doc comment)
 * is the only behavior difference a direct-contact card needs here.
 */
export function EventsExplorer({ events }: EventsExplorerProps) {
  const [group, setGroup] = useState<EventGroup>("all");
  const [query, setQuery] = useState("");
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const searchId = useId();
  const resultsId = useId();
  const modalTriggerRef = useRef<HTMLButtonElement | null>(null);

  const filtered = useMemo(() => {
    const categories = group === "all" ? null : EVENT_GROUP_CATEGORIES[group];
    const q = query.trim().toLowerCase();
    return events.filter((event) => {
      if (categories && !categories.includes(event.category)) return false;
      if (!q) return true;
      const haystack = event.description ? `${event.name} ${event.description}` : event.name;
      return haystack.toLowerCase().includes(q);
    });
  }, [events, group, query]);

  const standardEvents = useMemo(
    () => filtered.filter((event) => event.registrationMode === "standard"),
    [filtered],
  );
  const directContactEvents = useMemo(
    () => filtered.filter((event) => event.registrationMode === "direct-contact"),
    [filtered],
  );

  const openEvent = openEventId ? (events.find((event) => event.id === openEventId) ?? null) : null;

  function handleViewDetails(event: AffinityEvent, trigger: HTMLButtonElement) {
    modalTriggerRef.current = trigger;
    setOpenEventId(event.id);
  }

  return (
    <SectionContainer as="div" width="wide" verticalPadding>
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-display text-4xl font-semibold tracking-wide text-ivory sm:text-5xl lg:text-6xl">
          The Royal Courts
        </h1>
        <p className="font-accent text-lg italic text-warm-gold sm:text-xl">
          Choose your arena. Begin your tale.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Filter events by category" className="flex flex-wrap gap-2">
          {EVENT_GROUPS.map((g) => {
            const active = g === group;
            return (
              <button
                key={g}
                type="button"
                aria-pressed={active}
                onClick={() => setGroup(g)}
                className={[
                  "min-h-11 border px-4 py-2 font-body text-sm font-medium uppercase tracking-wide transition-colors duration-base",
                  active
                    ? "border-antique-gold bg-antique-gold text-midnight"
                    : "border-antique-gold/40 text-desert-sand hover:border-antique-gold/70 hover:text-ivory",
                ].join(" ")}
              >
                {EVENT_GROUP_LABEL[g]}
              </button>
            );
          })}
        </div>

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

      {filtered.length > 0 ? (
        <div className="mt-6 flex flex-col gap-12">
          {standardEvents.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold tracking-wide text-ivory">
                Standard AFFINITY Events
              </h2>
              <p className="mt-1 font-body text-sm text-desert-sand">
                Covered by your selected registration package.
              </p>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {standardEvents.map((event) => (
                  <EventCard key={event.id} event={event} onViewDetails={handleViewDetails} headingLevel="h3" />
                ))}
              </div>
            </div>
          )}

          {directContactEvents.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold tracking-wide text-ivory">
                Direct-Contact Events
              </h2>
              <p className="mt-1 font-body text-sm text-desert-sand">
                These events have separate entry procedures. Contact the respective in-charge for
                participation details.
              </p>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {directContactEvents.map((event) => (
                  <EventCard key={event.id} event={event} onViewDetails={handleViewDetails} headingLevel="h3" />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center gap-2 border border-antique-gold/20 px-6 py-16 text-center">
          <p className="font-accent text-lg italic text-warm-gold">No arenas match your search.</p>
          <p className="font-body text-sm text-desert-sand">Try a different name, or clear the filters above.</p>
        </div>
      )}

      {openEvent ? (
        <EventDetailsModal
          event={openEvent}
          onClose={() => setOpenEventId(null)}
          triggerRef={modalTriggerRef}
        />
      ) : null}
    </SectionContainer>
  );
}

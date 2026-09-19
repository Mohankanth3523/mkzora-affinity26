import type { AffinityEvent } from "@/types/event";
import { sportsEvents } from "./sports";
import { culturalOnstageEvents, culturalOffstageEvents } from "./cultural";
import { onlineCulturalEvents, onlineEsportsEvents } from "./online";

export { sportsEvents } from "./sports";
export { culturalOnstageEvents, culturalOffstageEvents } from "./cultural";
export { onlineCulturalEvents, onlineEsportsEvents } from "./online";

/**
 * Every participant-facing AFFINITY '26 event. This is the single array the
 * Events Explorer, registration wizard, and pricing calculator all read
 * from.
 *
 * Phase 39 (remove Online Events completely): `onlineCulturalEvents` is
 * deliberately left out of this spread. Those 9 records are the "Online
 * Events" category the phase brief asked to remove from every
 * participant-facing surface — Events page, registration wizard, search,
 * counts, everything downstream of `allEvents`. Per the brief's own "if the
 * project architecture requires retaining the original source data for
 * reference, you may retain it internally, but it must NOT appear in the
 * participant-facing event selection," the array itself (`./online.ts`,
 * `onlineCulturalEvents`) is untouched and still exported — nothing was
 * deleted, only excluded from the list every UI surface actually reads.
 *
 * `onlineEsportsEvents` (E-Football, FIFA, PUBG, Free Fire) stays in this
 * spread unchanged — those are `registrationMode: "direct-contact"` events
 * on the phase brief's own explicit confirmed-list of events that must
 * remain visible, even though they happen to share the word "online" (see
 * that field's own doc comment in types/event.ts and
 * docs/phase-39-remove-online-events-notes.md for the full reasoning).
 */
export const allEvents: AffinityEvent[] = [
  ...sportsEvents,
  ...culturalOnstageEvents,
  ...culturalOffstageEvents,
  ...onlineEsportsEvents,
];

export function getEventById(id: string): AffinityEvent | undefined {
  return allEvents.find((event) => event.id === id);
}

/**
 * Convenience counts used by landing-page copy (EventsTeaser) and any other
 * "N events" summary. Every figure here is a plain `.length` of a real
 * array — nothing fabricated or hard-coded.
 *
 * Phase 39: dropped `onlineCultural` (that category no longer appears
 * anywhere participant-facing, so a count for it would have nothing to
 * point at) and renamed `onlineEsports` → `esports`, since with the
 * "Online" stat tile gone (see EventsTeaser), this count now labels its own
 * distinct category rather than half of a combined online bucket.
 */
export const eventCounts = {
  total: allEvents.length,
  sports: sportsEvents.length,
  culturalOnstage: culturalOnstageEvents.length,
  culturalOffstage: culturalOffstageEvents.length,
  esports: onlineEsportsEvents.length,
};

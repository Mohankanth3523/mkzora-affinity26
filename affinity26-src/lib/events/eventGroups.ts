import type { EventCategory } from "@/types/event";

/**
 * The shared UI grouping used everywhere events are filtered by category
 * (the public Events Explorer, Phase 09; the registration wizard's Events
 * step, Phase 13). Coarser than `EventCategory`'s five values. This is a
 * navigation/UI taxonomy, not a sourced fact, so it lives here rather than
 * in `data/events/` alongside the real event records — same reasoning
 * `EventsExplorer`'s original doc comment gave when this lived only in
 * that one file.
 *
 * Extracted to its own module in Phase 13 once a second consumer
 * (`EventsStep`) needed the identical grouping — duplicating three
 * consts across two files would have been worse than the one extra
 * import.
 *
 * Phase 39 (remove Online Events completely): the "online" group/tab is
 * gone — `[ALL EVENTS][SPORTS][CULTURALS]` is now the complete, final
 * filter set the phase brief asked for. This doesn't hide the 4
 * `online-esports` direct-contact events (E-Football, FIFA, PUBG, Free
 * Fire) — they're still in `allEvents` (see data/events/index.ts) and
 * still shown under "ALL EVENTS," same as every other direct-contact
 * event. They just don't have a category-specific tab of their own here,
 * because — per the phase brief's explicit TRUTH MODE instruction not to
 * "move an online event into Sports or Culturals unless the existing
 * official source explicitly identifies it as an offline/on-campus
 * event" — this phase does not invent a new "Esports" filter tab or
 * reclassify them into an existing one. See
 * docs/phase-39-remove-online-events-notes.md.
 */
export type EventGroup = "all" | "sports" | "culturals";

export const EVENT_GROUPS: EventGroup[] = ["all", "sports", "culturals"];

export const EVENT_GROUP_LABEL: Record<EventGroup, string> = {
  all: "All Events",
  sports: "Sports",
  culturals: "Culturals",
};

export const EVENT_GROUP_CATEGORIES: Record<Exclude<EventGroup, "all">, EventCategory[]> = {
  sports: ["sports"],
  culturals: ["cultural-onstage", "cultural-offstage"],
};

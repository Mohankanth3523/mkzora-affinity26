import type { EventMode, EventType, FestivalDay } from "@/types/event";

/**
 * Small display-label maps shared between `EventCard` and
 * `EventDetailsModal`. Deliberately not added to `EventBadge`'s own
 * internal `MODE_LABEL` (a private, unexported const in that Phase 03
 * component) — duplicating two entries here is cheaper and lower-risk
 * than widening a shared design-system component's surface for this.
 */
export const TYPE_LABEL: Record<EventType, string> = {
  individual: "Individual",
  duo: "Duo",
  team: "Team",
  squad: "Squad",
};

export const MODE_LABEL: Record<EventMode, string> = {
  offline: "On-Campus",
  online: "Online",
};

/**
 * Renders an event's `day` field for display, or `null` when the field
 * is absent entirely — most events (sports, online) don't carry a `day`
 * at all in the source data; only onstage culturals are scheduled by
 * day. `null` means "omit this line," not "Details to be announced" —
 * the caller decides which.
 */
export function formatDay(day: FestivalDay | undefined): string | null {
  if (!day) return null;
  if (day === "tba") return "To Be Announced";
  const [, num] = day.split("-");
  return `Day ${num}`;
}

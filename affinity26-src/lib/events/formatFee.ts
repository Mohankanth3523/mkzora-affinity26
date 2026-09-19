import type { EventFee } from "@/types/event";

const UNIT_LABEL: Record<EventFee["unit"], string> = {
  per_person: "per person",
  per_team: "per team",
  per_film: "per film",
  per_squad: "per squad",
  included_in_package: "included in package",
  unspecified: "not stated",
};

/**
 * Renders an `AffinityEvent`'s fee field into short, honest card copy —
 * never a fabricated number. `fee.amount` is `null` for events where
 * the brochure never states a per-event fee (see
 * docs/affinity-content-truth.md §5/§15); the two `null` cases still
 * say something true rather than hiding the field or guessing a figure:
 *
 * - `unit === "included_in_package"` → "Included in registration
 *   package" (the event's own `verificationStatus` — surfaced
 *   separately via `EventBadge` — is what flags that this inclusion is
 *   an assumption, not a stated fact; this formatter doesn't duplicate
 *   that caveat inline).
 * - `unit === "unspecified"` → "Fee not stated", the plain truth.
 */
export function formatEventFee(fee: EventFee): string {
  if (fee.amount != null) {
    return `₹${fee.amount.toLocaleString("en-IN")} ${UNIT_LABEL[fee.unit]}`;
  }
  if (fee.unit === "included_in_package") {
    return "Included in registration package";
  }
  return "Fee not stated";
}

/**
 * Frontend-only pricing calculation.
 *
 * Pure function: (RegistrationState) -> PricingSummary. No network calls —
 * this is exactly the "Frontend pricing calculation" the project brief
 * asks for, reading only data/pricing.ts.
 *
 * Phase 31 (event selection & pricing cleanup) rewrote this from the
 * ground up. Before this phase, the displayed total was the selected
 * package's price *plus* every selected event's own per-event fee (Chess,
 * Track & Field, Short Film, the online bundle, each esports title), with
 * a special case that replaced the base package entirely with a flat ₹250
 * for a Chess-only registration. The new phase brief is explicit and
 * repeated across several of its sections: "Do NOT add individual event
 * fees to the displayed total," "Do not display separate prices for...
 * chess... online events... any other individual event," and gives exact
 * worked examples (Registration → ₹480, +Food → ₹1,100, +Food+Accommodation
 * → ₹1,500) that are simply the three official package prices with nothing
 * added. This calculator now does exactly that: the total is always the
 * selected package's own price, full stop, independent of which or how
 * many events are selected.
 *
 * This is a deliberate simplification of what the *frontend displays*,
 * instructed directly by this phase's own brief — not a correction of any
 * source document. Nothing about the underlying source data was touched:
 * `data/pricing.ts`'s per-event fee figures, `data/events/*`'s own `fee`
 * fields, and the official Chess-only-₹250-replaces-the-package rule
 * (docs/affinity-content-truth.md §5) are all still there, intact, for a
 * future backend or a future phase to read. This function just no longer
 * folds any of that into the number shown to a participant. See
 * docs/phase-31-event-pricing-cleanup-notes.md for the open
 * [VERIFY WITH ORGANIZER] this leaves: how a Chess-only registrant's real
 * payment should reconcile with the flat package price now shown here.
 */
import type { RegistrationState } from "@/types/registration";
import type { PricingLine, PricingSummary } from "@/types/registration";
import { PACKAGES } from "@/data/pricing";

export function calculatePricing(state: RegistrationState): PricingSummary {
  const selectedPackage = state.package.packageId
    ? PACKAGES.find((option) => option.id === state.package.packageId)
    : undefined;

  if (!selectedPackage) {
    return {
      lines: [],
      total: 0,
      currency: "INR",
      isEstimate: true,
      assumptions: [],
    };
  }

  const lines: PricingLine[] = [
    { label: selectedPackage.label, amount: selectedPackage.amount, kind: "package" },
  ];

  return {
    lines,
    total: selectedPackage.amount,
    currency: "INR",
    isEstimate: true,
    assumptions: [],
  };
}

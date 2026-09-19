/**
 * Pricing data — source: docs/affinity-content-truth.md §5.
 *
 * TRUTH MODE: the brochure states three base packages and a handful of
 * per-event fee overrides (Chess, Track & Field, Short Film, the online
 * bundle, and each esports title). It never states how the base package
 * relates to every other sport/cultural event — that gap is preserved
 * here as `baseIncludesUnlistedEvents` plus a caveat string, rather than
 * assumed away. See lib/registration/pricing.ts for how this is combined
 * with each event's own `fee` field into an estimate.
 */

export type PackageId =
  | "registration-only"
  | "registration-food"
  | "registration-food-accommodation";

export interface PackageOption {
  id: PackageId;
  label: string;
  amount: number;
  includesFood: boolean;
  includesAccommodation: boolean;
}

export const PACKAGES: PackageOption[] = [
  {
    id: "registration-only",
    label: "Registration Only",
    amount: 480,
    includesFood: false,
    includesAccommodation: false,
  },
  {
    id: "registration-food",
    label: "Registration + Food",
    amount: 1100,
    includesFood: true,
    includesAccommodation: false,
  },
  {
    id: "registration-food-accommodation",
    label: "Registration + Food + Accommodation",
    amount: 1500,
    includesFood: true,
    includesAccommodation: true,
  },
];

export const AFFINITY_TAG_REPLACEMENT_FEE = {
  amount: null as number | null,
  notes: "Lost Affinity tags are not replaced for free — \"a separate amount will be charged\" per the brochure, but no figure is given. See §15 of the content-truth doc.",
};

export const ACCOMMODATION_CAUTION_DEPOSIT = {
  amount: 100,
  unit: "per_head" as const,
  refundable: true,
  notes: "Paid at the registration desk on arrival, not at online registration.",
};

/**
 * Whether events with no event-specific fee (i.e. `fee.unit ===
 * "included_in_package"` in data/events/*) are genuinely covered by the
 * base package. The brochure never confirms this — see §5/§15 of the
 * content-truth doc — so this stays `false` (the conservative reading)
 * until an organizer confirms it, and the pricing calculator surfaces the
 * assumption explicitly rather than silently charging or not charging for
 * those events.
 */
export const baseIncludesUnlistedEvents = {
  confirmed: false,
  note: "The brochure's pricing page lists explicit fees only for Chess (solo), Track & Field, Short Film, the online-events bundle, and each esports title. It never states whether entry to every other sport/cultural event is included in the ₹480/₹1,100/₹1,500 base package or requires an additional unstated fee. Treat any total involving those events as an estimate pending organizer confirmation.",
};

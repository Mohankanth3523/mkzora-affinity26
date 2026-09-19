/**
 * Rules page ("Event Rules & Guidelines") display categories.
 *
 * The project brief asks the Rules page to organize content under eleven
 * named headings — Registration, Eligibility, Identification, Sports,
 * Culturals, Accommodation, Food, Discipline, Safety, Payment, General
 * Conduct — which cut across `data/rules.ts`'s six source `RuleSection`s
 * differently than they're grouped there. This file is a presentation-
 * layer regrouping only: every string below is referenced directly from
 * `data/rules.ts`'s arrays **by index**, never retyped, so a rule's exact
 * wording can never drift between this file and the section it came
 * from. Nothing here is invented, reworded, or resolved — where the same
 * item appears under more than one heading, that's because the fact is
 * genuinely relevant to both angles (the Affinity-tag rule is both a
 * Registration and an Identification concern), not a new fact, and it's
 * still the identical source string in both places.
 *
 * Sports, Culturals, and Accommodation reuse their existing `RuleSection`
 * wholesale — `data/rules.ts` already groups those three exactly this
 * way, so there's nothing to recombine. Registration, Eligibility,
 * Identification, Food, Discipline, Safety, Payment, and General Conduct
 * are curated subsets pulled from the three cross-cutting sections
 * (Registration, Terms & Conditions, Important Restrictions) — which is
 * also why a few of those eight overlap: the source material itself
 * restates several Terms & Conditions clauses inside "Important
 * Restrictions."
 *
 * The refund-policy conflict (`data/rulesVerification.ts`) is surfaced
 * separately in the Payment category as a flag, not folded into its item
 * list — the same pattern `pgEligibilityConflict` already uses in
 * `ParticipantStep`/`ReviewStep`.
 */

import {
  registrationRules,
  termsAndConditions,
  sportsGeneralRules,
  culturalsGeneralRules,
  accommodationRules,
  restrictions,
} from "./rules";

const REG = registrationRules.items;
const TNC = termsAndConditions.items;
const SPORTS = sportsGeneralRules.items;
const CULT = culturalsGeneralRules.items;
const ACC = accommodationRules.items;
const RESTR = restrictions.items;

/**
 * `tsconfig`'s `noUncheckedIndexedAccess` (deliberately on, project-wide —
 * see docs/design-system-accessibility.md's neighbor `docs/*-notes.md`
 * files) types a plain `REG[0]` as `string | undefined`, not `string`.
 * Rather than silencing that with a non-null assertion at every call
 * site below, this throws immediately (at module load, i.e. caught by
 * the very first `tsc`/import of this file) if an index is ever out of
 * range — which would only happen if `data/rules.ts`'s arrays changed
 * without these indices being updated to match.
 */
function req(source: string[], index: number): string {
  const value = source[index];
  if (value === undefined) {
    throw new Error(`data/rulesCategories.ts: index ${index} is out of range (length ${source.length}).`);
  }
  return value;
}

const reg = (index: number) => req(REG, index);
const tnc = (index: number) => req(TNC, index);
const sports = (index: number) => req(SPORTS, index);
const cult = (index: number) => req(CULT, index);
const acc = (index: number) => req(ACC, index);
const restr = (index: number) => req(RESTR, index);

export type RuleCategoryId =
  | "registration"
  | "eligibility"
  | "identification"
  | "sports"
  | "culturals"
  | "accommodation"
  | "food"
  | "discipline"
  | "safety"
  | "payment"
  | "general-conduct";

export interface RuleCategory {
  id: RuleCategoryId;
  title: string;
  items: string[];
}

export const ruleCategories: RuleCategory[] = [
  {
    id: "registration",
    title: "Registration",
    items: [reg(0), reg(1), reg(2), reg(5), reg(6), reg(8), reg(10), tnc(16)],
  },
  {
    id: "eligibility",
    title: "Eligibility",
    // The PG-eligibility conflict (data/registrationVerification.ts) is
    // surfaced by the page component alongside this list, not inside it.
    items: [sports(0), sports(1), cult(1), restr(8)],
  },
  {
    id: "identification",
    title: "Identification",
    items: [reg(3), reg(4), reg(7), reg(9), tnc(1), cult(7)],
  },
  {
    id: "sports",
    title: "Sports",
    items: [...SPORTS],
  },
  {
    id: "culturals",
    title: "Culturals",
    items: [...CULT],
  },
  {
    id: "accommodation",
    title: "Accommodation",
    items: [...ACC],
  },
  {
    id: "food",
    title: "Food",
    items: [reg(11), tnc(7)],
  },
  {
    id: "discipline",
    title: "Discipline",
    items: [tnc(2), tnc(3), tnc(11), tnc(13), tnc(14), sports(7), cult(12), acc(8), restr(2)],
  },
  {
    id: "safety",
    title: "Safety",
    items: [tnc(4), tnc(5), tnc(6), tnc(10), tnc(12), acc(6), acc(7), acc(9), restr(1), restr(7)],
  },
  {
    id: "payment",
    title: "Payment",
    // The refund clause (tnc(0)/restr(0)) is included here as source text —
    // the conflict itself is a separate flag, see refundPolicyConflict.
    items: [reg(1), reg(2), reg(11), acc(1), tnc(0), restr(0)],
  },
  {
    id: "general-conduct",
    title: "General Conduct",
    items: [
      tnc(8),
      tnc(9),
      tnc(15),
      tnc(16),
      sports(3),
      sports(4),
      sports(5),
      sports(10),
      cult(2),
      cult(3),
      cult(4),
      cult(5),
      cult(8),
      cult(9),
      cult(10),
      cult(11),
      restr(3),
      restr(4),
      restr(5),
      restr(6),
    ],
  },
];

/**
 * Rules-page-level verification flags — source-of-truth conflicts that
 * belong to the rules themselves, not to any one event (see
 * `data/events/*`'s per-event `verificationStatus`) or to the
 * registration form (see `data/registrationVerification.ts` for the
 * PG-eligibility conflict).
 *
 * Currently just the refund-policy conflict from
 * `docs/affinity-content-truth.md` §14(a): three different official
 * documents state three different things about refunds, and nothing in
 * the source material resolves them — so this stays a flagged conflict,
 * never a guessed resolution.
 */

import type { VerificationStatus } from "@/types/event";

export interface RuleVerificationFlag {
  id: string;
  status: VerificationStatus;
  /** Short label for UI surfaces — an `EventBadge variant="verification"` plus this summary. */
  summary: string;
  /** Where this was found — for anyone tracing the claim back to source. */
  source: string;
}

export const refundPolicyConflict: RuleVerificationFlag = {
  id: "refund-policy",
  status: "conflicting",
  summary:
    "Three official documents disagree on refunds: the original Terms & Conditions document says registration fees are non-refundable “unless the event is cancelled,” the brochure's general rule says “no amount will be refunded at any cost” with no stated exception, and the brochure's own Free Fire rules promise a refund specifically if that event is cancelled for low registration. This has not been resolved by the organizer.",
  source: "docs/affinity-content-truth.md §14(a)",
};

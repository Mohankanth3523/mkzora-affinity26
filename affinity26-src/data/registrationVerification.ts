/**
 * Registration-wizard-level verification flags — source-of-truth conflicts
 * that apply to the registration *form itself*, not to any one event.
 *
 * `data/events/*` already has a `verificationStatus`/`verificationNotes`
 * pair per event (see `types/event.ts`). This file is the same pattern
 * applied one level up, for facts about the registration process itself
 * that the source documents disagree on — currently just the one PG
 * conflict, but structured so a future flag (should one turn up) has
 * somewhere to live without inventing a new pattern.
 */

import type { VerificationStatus } from "@/types/event";

export interface RegistrationVerificationFlag {
  id: string;
  status: VerificationStatus;
  /** Short label for UI surfaces (a form field's inline notice, a badge). */
  summary: string;
  /** Where this was found — for anyone tracing the claim back to source. */
  source: string;
}

/**
 * Source: docs/affinity-content-truth.md §9, §14(b). The original
 * registration-form document lists "PG" as a selectable year-of-study
 * option, but the eligibility rules say culturals allow **no** PG at all,
 * and most sports don't either (only Football and Futsal name a limited
 * PG allowance). Which reading governs the registration form's own "PG"
 * option is not stated anywhere — so this stays a flagged conflict, not a
 * guessed resolution. Never silently drop "PG" from the year-of-study
 * list (it's genuinely on the official form) and never silently accept it
 * as unconditionally eligible either — surface the conflict instead.
 */
export const pgEligibilityConflict: RegistrationVerificationFlag = {
  id: "pg-eligibility",
  status: "conflicting",
  summary:
    "PG appears as a year-of-study option on the official registration form, but most events' eligibility rules state postgraduates are not allowed (only Football and Futsal name a limited PG allowance). This has not been resolved by the organizer.",
  source: "docs/affinity-content-truth.md §9, §14(b)",
};

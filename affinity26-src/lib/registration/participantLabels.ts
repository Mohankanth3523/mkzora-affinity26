/**
 * Display labels for `YearOfStudy` — extracted so `ParticipantStep` (the
 * `<select>` options) and `ReviewStep` (Phase 16's read-only recap) share
 * one definition instead of two copies that could drift apart, the same
 * reasoning `lib/events/eventGroups.ts` documents for its own extraction
 * in Phase 13. The six values themselves are unchanged since Phase 02 —
 * see docs/affinity-content-truth.md §4/§9 and the PG-eligibility
 * conflict in `data/registrationVerification.ts`.
 */
import type { YearOfStudy } from "@/types/registration";

export const YEAR_OF_STUDY_OPTIONS: { value: YearOfStudy; label: string }[] = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
  { value: "intern", label: "Intern" },
  { value: "pg", label: "PG" },
];

export const YEAR_OF_STUDY_LABEL: Record<YearOfStudy, string> = Object.fromEntries(
  YEAR_OF_STUDY_OPTIONS.map((option) => [option.value, option.label]),
) as Record<YearOfStudy, string>;

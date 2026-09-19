/**
 * Registration wizard field validation.
 *
 * Pure functions only — no DOM/React here, so this can be unit-tested and
 * reused from both `ParticipantStep` (inline errors) and
 * `RegistrationNavigation` (gating "Next") without either importing the
 * other. Validation *rules themselves* (required-ness, length limits,
 * phone/email shape) are ordinary frontend UX judgment calls, not sourced
 * facts — the project brief's TRUTH MODE governs event names/fees/dates/
 * etc., not "is this a plausible phone number." Where a rule *is* sourced
 * (which year-of-study options exist), it comes from `types/registration.ts`
 * / `data/registrationVerification.ts`, not invented here.
 */
import type { EventSelection, Participant, PackageSelection, RegistrationReview } from "@/types/registration";
import { OTHER_COLLEGE_ID } from "@/data/colleges";

export type ParticipantErrors = Partial<Record<keyof Participant, string>>;

const NAME_MIN = 2;
const NAME_MAX = 80;
const EMAIL_MAX = 254;
/** Phase 38: only applies to the manually-typed "Others" college name — every listed college's own name is already a verified, correctly-lengthed string, so this never constrains a real selection. */
const COLLEGE_MIN = 3;
const COLLEGE_MAX = 120;

/** 10-digit Indian mobile number, optionally prefixed with +91/91/0, optional spaces/hyphens — stripped before testing. */
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

/** Deliberately simple (not the full RFC 5322 grammar) — good enough to catch obvious typos without rejecting valid real-world addresses. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(raw: string): string {
  const stripped = raw.replace(/[\s-]/g, "");
  return stripped.replace(/^(\+91|91|0)/, "");
}

export function validateParticipant(participant: Participant): ParticipantErrors {
  const errors: ParticipantErrors = {};

  const name = participant.name.trim();
  if (!name) {
    errors.name = "Enter your full name.";
  } else if (name.length < NAME_MIN) {
    errors.name = `Name must be at least ${NAME_MIN} characters.`;
  } else if (name.length > NAME_MAX) {
    errors.name = `Name must be under ${NAME_MAX} characters.`;
  }

  // Phase 29: a college is only ever set together with its id, by
  // CollegeCombobox's onSelect (see types/registration.ts) — so requiring
  // collegeId here, rather than re-validating the string, is what
  // actually enforces "must select from the official list, not type
  // arbitrary text." The collegeName.trim() check is a belt-and-suspenders
  // guard against a corrupted/hand-edited localStorage record that somehow
  // has an id but an empty name.
  //
  // Phase 38: the one exception is OTHER_COLLEGE_ID — the participant
  // explicitly chose "my college isn't listed" (see CollegeCombobox/
  // ParticipantStep), so collegeName is now a manually-typed value rather
  // than one sourced from data/colleges.ts, and needs its own length
  // check the way `name` above does (it was never a free-text field
  // before this phase, so there was nothing to check).
  if (!participant.collegeId) {
    errors.collegeName = "Please select your college.";
  } else if (participant.collegeId === OTHER_COLLEGE_ID) {
    const manualCollegeName = participant.collegeName.trim();
    if (!manualCollegeName) {
      errors.collegeName = "Enter your college name.";
    } else if (manualCollegeName.length < COLLEGE_MIN) {
      errors.collegeName = `College name must be at least ${COLLEGE_MIN} characters.`;
    } else if (manualCollegeName.length > COLLEGE_MAX) {
      errors.collegeName = `College name must be under ${COLLEGE_MAX} characters.`;
    }
  } else if (!participant.collegeName.trim()) {
    errors.collegeName = "Please select your college.";
  }

  if (!participant.yearOfStudy) {
    errors.yearOfStudy = "Select your year of study.";
  }

  const phone = participant.phoneNumber.trim();
  if (!phone) {
    errors.phoneNumber = "Enter your phone number.";
  } else if (!INDIAN_MOBILE_REGEX.test(normalizePhone(phone))) {
    errors.phoneNumber = "Enter a valid 10-digit Indian mobile number.";
  }

  const email = participant.email.trim();
  if (!email) {
    errors.email = "Enter your email address.";
  } else if (email.length > EMAIL_MAX) {
    errors.email = "Email address is too long.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
}

export function isParticipantValid(participant: Participant): boolean {
  return Object.keys(validateParticipant(participant)).length === 0;
}

/**
 * Step 02 — Events. "Valid" here means only "at least one event is
 * selected" — the phase brief's own "Continue disabled if no valid event
 * selected" plus "Do not invent restrictions" together rule out adding
 * any eligibility-matching logic (e.g. cross-checking a participant's
 * year of study against an event's `eligibility` text) that the source
 * material doesn't already enforce as a hard, structured rule. Every
 * event in `data/events/*` is a real, selectable AFFINITY '26 event, so
 * selecting any one of them is "valid" — there is nothing else to check.
 */
export function isEventsStepValid(selectedEvents: EventSelection[]): boolean {
  return selectedEvents.length > 0;
}

/**
 * Registration flow simplification phase: there is no team-roster step
 * (and no `validateTeamSelection`/`isDetailsStepValid` — this wizard never
 * collects a team name, captain, or member roster; see
 * `types/registration.ts`'s `EventSelection` doc comment and
 * docs/phase-36-registration-flow-simplification-notes.md). A participant
 * can still select a team/duo/squad event exactly like an individual one —
 * `isEventsStepValid` above treats every real event the same way, with no
 * per-type branching.
 */

/**
 * Step 03 — Package. Like `isEventsStepValid`, "valid" means only "a
 * package has been chosen" — a simple boolean gate, not a form with
 * per-field errors. The three packages themselves (and their prices) are
 * the officially stated ones in `data/pricing.ts`; there is nothing else
 * to validate about which one was picked.
 */
export function isPackageStepValid(packageSelection: PackageSelection): boolean {
  return packageSelection.packageId !== null;
}

/**
 * Step 04 — Review. The only thing gating "Proceed" is the acknowledgement
 * checkbox itself (`RegistrationReview.acceptedTerms`) — every other field
 * was already validated on its own step (Participant) or needs no
 * validation at all (Events/Package are simple selections). Re-checking
 * those here would duplicate `isParticipantValid`/
 * `isEventsStepValid`/`isPackageStepValid` for no UX benefit, since a user
 * can't reach Review through the wizard's own "Next" flow without already
 * having passed them — they're each still independently enforced on their
 * own step regardless of how Review is reached (e.g. jumping via the
 * freely-clickable step indicator).
 */
export function isReviewStepValid(review: RegistrationReview): boolean {
  return review.acceptedTerms;
}

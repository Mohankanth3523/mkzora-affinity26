/**
 * Phase 41 — the frontend's only network call anywhere in this codebase:
 * submitting one completed registration to the same-origin proxy
 * (/affinity26/api/register), which forwards it server-to-server to a
 * Google Apps Script Web App that appends a row to a Google Sheet and returns
 * a server-issued registration ID. See docs/google-sheets-setup.md for the Apps Script
 * source this pairs with, and
 * docs/phase-41-confirm-registration-google-sheets-notes.md for the full
 * phase writeup.
 *
 * This file owns two things deliberately kept together: building the
 * exact payload shape the Sheet's columns expect (including the
 * packageId -> Sheet-label mapping below), and the actual `fetch` call.
 * Nothing else in the app talks to the endpoint directly — `ConfirmStep`
 * only ever calls `submitRegistration()`.
 */
import { PACKAGES, type PackageId } from "@/data/pricing";
import { REGISTRATION_ENDPOINT } from "./submissionConfig";

export interface RegistrationSubmissionInput {
  fullName: string;
  collegeName: string;
  /** Already resolved to its display label (e.g. "3rd Year") — see `YEAR_OF_STUDY_LABEL` in `lib/registration/participantLabels.ts`. Never the raw `YearOfStudy` union value. */
  yearOfStudyLabel: string;
  phone: string;
  email: string;
  /** Official event names, already resolved from `selectedEvents` via `getEventById` — never raw internal event ids. */
  eventNames: string[];
  packageId: PackageId;
}

interface RegistrationSubmissionPayload {
  fullName: string;
  collegeName: string;
  yearOfStudy: string;
  phone: string;
  email: string;
  /** Pipe-delimited readable event names, e.g. "Cricket | Volleyball | Basketball" — column H of the "Registrations" sheet. */
  selectedEvents: string;
  eventCount: number;
  /** One of "Registration" / "Registration + Food" / "Registration + Food + Accommodation" — see SHEET_PACKAGE_LABEL below. */
  package: string;
  /** Numeric — 480 / 1100 / 1500, never a "₹"-prefixed string. */
  amount: number;
  source: string;
}

/**
 * The Sheet's own package vocabulary, distinct from the UI's own package
 * label wording. `data/pricing.ts`'s existing UI label for the base
 * package is "Registration Only" (unchanged, everywhere it's displayed —
 * this phase's brief doesn't ask for that copy to change, and changing
 * it would be an unrelated UI edit). The phase brief's own Google Sheets
 * column spec independently states the exact three strings the Package
 * column must hold, and the first of those three ("Registration") is
 * worded slightly differently than the UI label. Rather than either
 * renaming the UI label (unrelated change, not asked for) or silently
 * sending the UI's own wording to the Sheet (deviates from the brief's
 * explicit column spec), this mapping exists so each side keeps its own,
 * correct wording.
 */
const SHEET_PACKAGE_LABEL: Record<PackageId, string> = {
  "registration-only": "Registration",
  "registration-food": "Registration + Food",
  "registration-food-accommodation": "Registration + Food + Accommodation",
};

/** Column M of the "Registrations" sheet — a fixed constant per the phase brief, never derived from anything the participant enters. */
const SUBMISSION_SOURCE = "AFFINITY '26 Website";

function buildPayload(input: RegistrationSubmissionInput): RegistrationSubmissionPayload {
  // Amount is looked up fresh from data/pricing.ts by packageId, right
  // here at submission time — never passed in from a caller's own
  // possibly-stale `state.pricing.total` — so it can never be a number
  // that doesn't match one of the three official package prices. (In
  // practice `state.pricing.total` is always recalculated to exactly
  // this same value whenever the package changes — see
  // lib/registration/pricing.ts — this lookup is a second, independent
  // guarantee of the same "never trust a possibly-stale amount" rule the
  // phase brief states for the Apps Script side; deriving it fresh here
  // costs nothing and removes one more thing a caller could get wrong.)
  const packageOption = PACKAGES.find((option) => option.id === input.packageId);
  const amount = packageOption ? packageOption.amount : 0;

  return {
    fullName: input.fullName,
    collegeName: input.collegeName,
    yearOfStudy: input.yearOfStudyLabel,
    phone: input.phone,
    email: input.email,
    selectedEvents: input.eventNames.join(" | "),
    eventCount: input.eventNames.length,
    package: SHEET_PACKAGE_LABEL[input.packageId],
    amount,
    source: SUBMISSION_SOURCE,
  };
}

export type SubmissionFailureReason = "not-configured" | "network" | "invalid-response" | "server-error";

export type SubmissionResult =
  | { ok: true; registrationId: string; message?: string }
  | { ok: false; reason: SubmissionFailureReason; message: string };

const GENERIC_FAILURE_MESSAGE =
  "Registration could not be submitted. Please check your connection and try again.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Submits one registration. Never trusts the network blindly: the parsed
 * response is checked field-by-field with runtime type guards before any
 * of it is treated as a real registration ID, and the caller
 * (`ConfirmStep`) never marks a registration confirmed on anything less
 * than `result.ok === true` here.
 *
 * CORS note: Google Apps Script /exec responses never include
 * `Access-Control-Allow-Origin`, so the browser cannot read them cross-origin
 * (and `mode: "no-cors"` would hide the response, which this code needs). The
 * request therefore goes to this site's own origin, where the Cloudflare
 * proxy (worker/registerProxy.js) calls Apps Script and returns the same JSON
 * contract: { success, registrationId, message }. The body stays a JSON
 * string sent as `text/plain`, which the proxy forwards unchanged and Apps
 * Script parses with `JSON.parse(e.postData.contents)`.
 */
export async function submitRegistration(
  input: RegistrationSubmissionInput,
): Promise<SubmissionResult> {
  const endpoint = REGISTRATION_ENDPOINT; // same-origin proxy: /affinity26/api/register

  const payload = buildPayload(input);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, reason: "network", message: GENERIC_FAILURE_MESSAGE };
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return { ok: false, reason: "invalid-response", message: GENERIC_FAILURE_MESSAGE };
  }

  if (
    isRecord(data) &&
    data.success === true &&
    typeof data.registrationId === "string" &&
    data.registrationId.trim().length > 0
  ) {
    return {
      ok: true,
      registrationId: data.registrationId,
      message: typeof data.message === "string" ? data.message : undefined,
    };
  }

  if (isRecord(data) && data.success === false) {
    const serverMessage = typeof data.message === "string" ? data.message.trim() : "";
    return {
      ok: false,
      reason: "server-error",
      message: serverMessage.length > 0 ? serverMessage : GENERIC_FAILURE_MESSAGE,
    };
  }

  return { ok: false, reason: "invalid-response", message: GENERIC_FAILURE_MESSAGE };
}

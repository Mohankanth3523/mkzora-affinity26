/**
 * Registration wizard reducer.
 *
 * Pure state transitions only — no side effects, no network calls.
 * Persistence (lib/registration/storage.ts) and React wiring
 * (lib/registration/context.tsx) are kept separate so this file can be
 * unit-tested in isolation later.
 */
import type {
  RegistrationState,
  RegistrationStep,
  Participant,
  EventSelection,
} from "@/types/registration";
import { INITIAL_REGISTRATION_STATE } from "@/types/registration";
import type { PackageId } from "@/data/pricing";
import { getEventById } from "@/data/events";
import { calculatePricing } from "./pricing";

export type RegistrationAction =
  | { type: "SET_STEP"; step: RegistrationStep }
  | { type: "UPDATE_PARTICIPANT"; patch: Partial<Participant> }
  | { type: "SELECT_EVENT"; eventId: string }
  | { type: "DESELECT_EVENT"; eventId: string }
  | { type: "SET_PACKAGE"; packageId: PackageId }
  | { type: "SET_ACCOMMODATION_REQUESTED"; requested: boolean }
  | { type: "SET_ACCEPTED_TERMS"; accepted: boolean }
  | { type: "CONFIRM_REGISTRATION"; registrationId: string }
  | { type: "RESET" }
  | { type: "HYDRATE"; state: RegistrationState };

function withRecalculatedPricing(state: RegistrationState): RegistrationState {
  return { ...state, pricing: calculatePricing(state) };
}

export function registrationReducer(
  state: RegistrationState,
  action: RegistrationAction,
): RegistrationState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };

    case "UPDATE_PARTICIPANT":
      return { ...state, participant: { ...state.participant, ...action.patch } };

    case "SELECT_EVENT": {
      if (state.selectedEvents.some((selection) => selection.eventId === action.eventId)) {
        return state;
      }
      const selection: EventSelection = { eventId: action.eventId };
      return withRecalculatedPricing({
        ...state,
        selectedEvents: [...state.selectedEvents, selection],
      });
    }

    case "DESELECT_EVENT": {
      return withRecalculatedPricing({
        ...state,
        selectedEvents: state.selectedEvents.filter((selection) => selection.eventId !== action.eventId),
      });
    }

    case "SET_PACKAGE":
      return withRecalculatedPricing({
        ...state,
        package: {
          packageId: action.packageId,
          accommodationRequested: action.packageId === "registration-food-accommodation",
        },
      });

    case "SET_ACCOMMODATION_REQUESTED":
      return {
        ...state,
        package: { ...state.package, accommodationRequested: action.requested },
      };

    case "SET_ACCEPTED_TERMS":
      return {
        ...state,
        review: {
          acceptedTerms: action.accepted,
          reviewedAt: action.accepted ? new Date().toISOString() : null,
        },
      };

    case "CONFIRM_REGISTRATION":
      // Phase 41: this action now only fires from ConfirmStep after
      // `submitRegistration()` has already returned a genuine success
      // response from the Google Apps Script Web App — `registrationId`
      // is that server-issued ID, never generated here. There is no
      // client-side ID generator in this file anymore (see this file's
      // git history / Phase 17 notes for the old
      // `generateMockRegistrationId()`, removed this phase) — a
      // registration is only ever "confirmed" in this state after a real
      // row has been appended to the Sheet.
      return {
        ...state,
        step: "confirm",
        confirmation: {
          registrationId: action.registrationId,
          confirmedAt: new Date().toISOString(),
        },
      };

    case "RESET":
      return INITIAL_REGISTRATION_STATE;

    case "HYDRATE": {
      // Phase 39 (remove Online Events completely): a registration begun
      // before this phase could have persisted a `selectedEvents` entry
      // for one of the 9 online-cultural events this phase excluded from
      // `allEvents` (data/events/index.ts) — that id no longer resolves
      // via `getEventById`. Every step component that *renders*
      // `selectedEvents` already maps through `getEventById` and drops
      // unresolvable ids (EventsStep/ReviewStep/RegistrationSummary/
      // RegistrationPass), so a stale id was never going to crash
      // anything — but it would otherwise sit in `state.selectedEvents`
      // (and get re-persisted to localStorage) forever, silently invalid.
      // The phase brief is explicit that a stale online event must be
      // "removed safely from the active registration selection," not just
      // hidden from view, so hydration is where that actually happens —
      // once, here, rather than duplicating the same filter in every
      // consumer. `withRecalculatedPricing` is a no-op either way (see
      // ./pricing.ts — the total only ever depends on the selected
      // package, never on which events are selected).
      const hydrated = action.state;
      const sanitizedSelectedEvents = hydrated.selectedEvents.filter((selection) =>
        Boolean(getEventById(selection.eventId)),
      );

      // Phase 41: a registration confirmed before this phase would have
      // persisted the OLD `ConfirmationDetails` shape (`mockRegistrationId`/
      // `generatedAt`/`paymentStatus`), which no longer has a
      // `registrationId` field at all — reading it as one would render as
      // `undefined` on `/success` (a broken-looking pass, and a download
      // filename literally containing the word "undefined"). Rather than
      // let a leftover pre-Phase-41 localStorage record surface that,
      // hydration drops any `confirmation` that doesn't have a real
      // non-empty `registrationId` string — the same "sanitize stale
      // persisted shapes at the one place hydration happens" pattern the
      // `selectedEvents` filter above already established for Phase 39.
      const hydratedConfirmation = hydrated.confirmation;
      const sanitizedConfirmation =
        hydratedConfirmation &&
        typeof hydratedConfirmation.registrationId === "string" &&
        hydratedConfirmation.registrationId.trim().length > 0
          ? hydratedConfirmation
          : null;

      return withRecalculatedPricing({
        ...hydrated,
        selectedEvents: sanitizedSelectedEvents,
        confirmation: sanitizedConfirmation,
      });
    }

    default:
      return state;
  }
}

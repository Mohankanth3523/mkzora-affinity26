"use client";

import { REGISTRATION_STEPS, type RegistrationState, type RegistrationStep } from "@/types/registration";
import { useRegistration } from "@/lib/registration/context";
import { GoldButton, SecondaryButton } from "@/components/design-system";
import { isEventsStepValid, isPackageStepValid, isReviewStepValid } from "@/lib/registration/validation";

/**
 * Steps whose own component owns a `<form>` with real validation — for
 * these, "Next" is associated with that form via the native HTML `form`
 * attribute (`type="submit" form={id}`) instead of dispatching `SET_STEP`
 * directly. The form's own `onSubmit` (in the step component) validates
 * and advances the wizard on success, or reveals errors + moves focus to
 * the first invalid field on failure — see `ParticipantStep.tsx` and
 * `docs/phase-12-participant-step-notes.md`. Steps not listed here still
 * advance immediately on click, exactly as Phase 11 left them; add an
 * entry only once that step actually has a form + validation to gate on.
 * The registration flow simplification phase removed the old "Details"
 * step (team rosters) that used to be the second entry here.
 */
const FORM_ID_BY_STEP: Partial<Record<RegistrationStep, string>> = {
  participant: "participant-form",
};

/**
 * Steps with a simple boolean "can advance" gate — no per-field errors to
 * show or focus, so a plain `disabled` Next button (plus a short helper
 * line explaining why) is enough; no `<form>`/submit-intercept needed.
 * Phase 13: Events only allows advancing once at least one event is
 * selected — see `lib/registration/validation.ts`'s `isEventsStepValid`
 * for why "valid" means only "non-empty," not an invented eligibility
 * check. Phase 15: Package joins this same pattern — a package must be
 * chosen, nothing more to validate about which one. Phase 16: Review
 * joins it too — the acknowledgement checkbox is the only thing gating
 * "Proceed" (every other field was already validated on its own step —
 * see `isReviewStepValid`'s doc comment).
 */
const NEXT_DISABLED_BY_STEP: Partial<Record<RegistrationStep, (state: RegistrationState) => boolean>> = {
  events: (state) => !isEventsStepValid(state.selectedEvents),
  package: (state) => !isPackageStepValid(state.package),
  review: (state) => !isReviewStepValid(state.review),
};

const NEXT_DISABLED_REASON: Partial<Record<RegistrationStep, string>> = {
  events: "Select at least one event to continue.",
  package: "Select a package to continue.",
  review: "Confirm you agree to the AFFINITY '26 terms and conditions to continue.",
};

/**
 * Per-step override for the advance button's own label. Every step not
 * listed here just says "Next" (the Phase 11 default). Phase 16: Review's
 * own brief names its CTA "PROCEED" specifically — title-cased here to
 * match every other button in the design system rather than shouting.
 */
const NEXT_LABEL_BY_STEP: Partial<Record<RegistrationStep, string>> = {
  review: "Proceed",
};

/**
 * Phase 11: the wizard's Back/Next pair, replacing WizardNav's plain
 * `<button>`s with the real design-system components.
 *
 * "Back" is omitted entirely on the first step and "Next" is omitted on
 * the last (Confirm already has its own dedicated CTA inside
 * `ConfirmStep`), rather than rendering a disabled dead button — `ml-auto`
 * on the remaining button keeps the row's `justify-between` alignment
 * correct with only one side populated.
 */
export function RegistrationNavigation() {
  const { state, dispatch } = useRegistration();
  const currentIndex = REGISTRATION_STEPS.indexOf(state.step);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === REGISTRATION_STEPS.length - 1;
  const formId = FORM_ID_BY_STEP[state.step];
  const blocked = NEXT_DISABLED_BY_STEP[state.step]?.(state) ?? false;
  const blockedReason = blocked ? NEXT_DISABLED_REASON[state.step] : undefined;
  const nextLabel = NEXT_LABEL_BY_STEP[state.step] ?? "Next";

  if (isLast) return null;

  return (
    <div className="mt-6 flex flex-col items-end gap-2">
      <div className="flex w-full items-center justify-between gap-4">
        {!isFirst && (
          <SecondaryButton
            onClick={() =>
              dispatch({ type: "SET_STEP", step: REGISTRATION_STEPS[currentIndex - 1]! })
            }
          >
            Back
          </SecondaryButton>
        )}
        <GoldButton
          className={isFirst ? "ml-auto" : ""}
          type={formId ? "submit" : "button"}
          form={formId}
          disabled={blocked}
          aria-label={blockedReason ? `${nextLabel} — ${blockedReason}` : undefined}
          onClick={
            formId || blocked
              ? undefined
              : () => dispatch({ type: "SET_STEP", step: REGISTRATION_STEPS[currentIndex + 1]! })
          }
        >
          {nextLabel}
        </GoldButton>
      </div>
      {blockedReason && (
        <p role="status" className="font-body text-xs text-desert-sand">
          {blockedReason}
        </p>
      )}
    </div>
  );
}

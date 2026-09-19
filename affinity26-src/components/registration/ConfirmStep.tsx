"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegistration } from "@/lib/registration/context";
import { getEventById } from "@/data/events";
import { PACKAGES } from "@/data/pricing";
import { YEAR_OF_STUDY_LABEL } from "@/lib/registration/participantLabels";
import { isParticipantValid, isEventsStepValid, isPackageStepValid } from "@/lib/registration/validation";
import { submitRegistration } from "@/lib/registration/submitRegistration";
import { GoldButton, OrnamentalFrame } from "@/components/design-system";

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; configured: boolean; message: string };

const LABEL_CLASS = "font-body text-xs font-medium uppercase tracking-wide text-desert-sand";

/**
 * Step 05 — Confirm Registration.
 *
 * Phase 41 replaced the earlier two-phase "Payment"/"Demo Payment" step
 * (see docs/phase-17-confirm-step-notes.md for what used to be here) with
 * a real submission to a Google Sheets + Apps Script backend
 * (`lib/registration/submitRegistration.ts`) — see
 * docs/phase-41-confirm-registration-google-sheets-notes.md and
 * docs/google-sheets-setup.md. There is still no payment of any kind:
 * AFFINITY '26 does not collect payment online, so this step's only job
 * is to record the registration, never to process money — the project
 * brief is explicit that no PAYMENT/PAY NOW/CONTINUE TO PAYMENT/
 * RAZORPAY/TRANSACTION language may appear anywhere in this flow.
 *
 * A read-only Registration Summary (Participant / Events / Package /
 * Registration Amount) recaps everything Review already showed — reading
 * the exact same `state.pricing` Review and the sidebar already display,
 * so this number can never drift from what the participant already
 * reviewed — followed by a single "Confirm Registration" action with the
 * four button states (idle / submitting / success / error) the brief
 * asks for.
 *
 * Duplicate-submission guard: `submitState.status` blocks another submit
 * attempt while one is already "submitting" or has already reached
 * "success" (`isSubmitting` below gates the button's `disabled` prop).
 * The only way to submit again after a genuine failure is pressing the
 * button again from its "Try Again" label, which re-runs the exact same
 * submission — no wizard state is ever cleared or lost on a failed
 * attempt, so a participant's entered details survive any number of
 * retries.
 */
export function ConfirmStep() {
  const { state, dispatch } = useRegistration();
  const router = useRouter();
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const events = state.selectedEvents
    .map((selection) => getEventById(selection.eventId))
    .filter((event): event is NonNullable<typeof event> => Boolean(event));

  const selectedPackage = state.package.packageId
    ? PACKAGES.find((option) => option.id === state.package.packageId)
    : undefined;

  const isSubmitting = submitState.status === "submitting" || submitState.status === "success";

  async function handleConfirm() {
    if (isSubmitting) return;

    // Defensive re-validation, per the brief's own submit sequence
    // ("validate participant info, validate selected events, validate
    // package"). A participant who reached this step through the
    // wizard's own "Next" gating has already passed every one of these —
    // this only matters for someone who jumped straight here via
    // `RegistrationProgress`'s freely-clickable step indicator, exactly
    // the same defensive posture every earlier step's own gate already
    // assumes.
    if (
      !isParticipantValid(state.participant) ||
      !isEventsStepValid(state.selectedEvents) ||
      !isPackageStepValid(state.package) ||
      !state.package.packageId
    ) {
      setSubmitState({
        status: "error",
        configured: true,
        message: "Some registration details are incomplete. Please go back and review each step.",
      });
      return;
    }

    setSubmitState({ status: "submitting" });

    const result = await submitRegistration({
      fullName: state.participant.name.trim(),
      collegeName: state.participant.collegeName.trim(),
      yearOfStudyLabel: state.participant.yearOfStudy
        ? YEAR_OF_STUDY_LABEL[state.participant.yearOfStudy]
        : "",
      phone: state.participant.phoneNumber.trim(),
      email: state.participant.email.trim(),
      eventNames: events.map((event) => event.name),
      packageId: state.package.packageId,
    });

    if (result.ok) {
      // Only ever dispatched after a confirmed Google Sheets submission —
      // never before. See lib/registration/state.ts's CONFIRM_REGISTRATION
      // case and docs/phase-41-...-notes.md's "never show success before
      // Sheets confirms" section.
      dispatch({ type: "CONFIRM_REGISTRATION", registrationId: result.registrationId });
      setSubmitState({ status: "success" });
      router.push("/success");
      return;
    }

    setSubmitState({
      status: "error",
      configured: result.reason !== "not-configured",
      message: result.message,
    });
  }

  const buttonLabel =
    submitState.status === "submitting"
      ? "Submitting Registration…"
      : submitState.status === "success"
        ? "Registration Confirmed"
        : submitState.status === "error"
          ? "Try Again"
          : "Confirm Registration";

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-2xl font-semibold tracking-wide text-ivory">
          Confirm Your Registration
        </h3>
        <p className="font-accent text-base italic text-warm-gold">
          Please review your details before submitting your AFFINITY &apos;26 registration.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <OrnamentalFrame padding="sm">
          <h4 className="font-display text-lg font-semibold text-ivory">Registration Summary</h4>

          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className={LABEL_CLASS}>Full Name</dt>
              <dd className="mt-1 font-body text-sm text-ivory">{state.participant.name.trim() || "—"}</dd>
            </div>
            <div>
              <dt className={LABEL_CLASS}>College</dt>
              <dd className="mt-1 font-body text-sm text-ivory">
                {state.participant.collegeName.trim() || "—"}
              </dd>
            </div>
            <div>
              <dt className={LABEL_CLASS}>Year of Study</dt>
              <dd className="mt-1 font-body text-sm text-ivory">
                {state.participant.yearOfStudy ? YEAR_OF_STUDY_LABEL[state.participant.yearOfStudy] : "—"}
              </dd>
            </div>
            <div>
              <dt className={LABEL_CLASS}>Phone</dt>
              <dd className="mt-1 font-body text-sm text-ivory">
                {state.participant.phoneNumber.trim() || "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className={LABEL_CLASS}>Email</dt>
              <dd className="mt-1 font-body text-sm text-ivory">{state.participant.email.trim() || "—"}</dd>
            </div>
          </dl>

          <div className="mt-5 border-t border-antique-gold/20 pt-4">
            <dt className={LABEL_CLASS}>Events</dt>
            <dd className="mt-1 font-body text-sm text-ivory">
              {events.length === 0 ? (
                "—"
              ) : (
                <ul className="flex flex-col gap-0.5">
                  {events.map((event) => (
                    <li key={event.id}>{event.name}</li>
                  ))}
                </ul>
              )}
            </dd>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3 border-t border-antique-gold/20 pt-4">
            <div>
              <dt className={LABEL_CLASS}>Package</dt>
              <dd className="mt-1 font-body text-sm text-ivory">
                {selectedPackage ? selectedPackage.label : "—"}
              </dd>
            </div>
            <div className="text-right">
              <dt className={LABEL_CLASS}>Registration Amount</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-antique-gold">
                {state.pricing ? formatRupees(state.pricing.total) : "₹0"}
              </dd>
            </div>
          </div>
        </OrnamentalFrame>

        <div aria-live="polite">
          {submitState.status === "error" && (
            <OrnamentalFrame padding="sm" className="ring-1 ring-burgundy">
              <p role="alert" className="font-body text-sm text-ivory">
                {!submitState.configured ? (
                  <>
                    <strong className="text-warm-gold">Registration submission is not configured.</strong>{" "}
                    {submitState.message}
                  </>
                ) : (
                  submitState.message
                )}
              </p>
            </OrnamentalFrame>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <GoldButton type="button" disabled={isSubmitting} onClick={handleConfirm}>
            {buttonLabel}
          </GoldButton>
          <p className="font-body text-xs text-desert-sand/80">
            AFFINITY &apos;26 does not collect payment online — confirming submits your registration
            details only.
          </p>
        </div>
      </div>
    </div>
  );
}

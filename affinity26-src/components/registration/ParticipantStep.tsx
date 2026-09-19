"use client";

import { useMemo, useRef, useState, type FormEvent, type RefObject } from "react";
import { useRegistration } from "@/lib/registration/context";
import { REGISTRATION_STEPS } from "@/types/registration";
import type { YearOfStudy } from "@/types/registration";
import { validateParticipant, type ParticipantErrors } from "@/lib/registration/validation";
import { pgEligibilityConflict } from "@/data/registrationVerification";
import { YEAR_OF_STUDY_OPTIONS } from "@/lib/registration/participantLabels";
import { EventBadge } from "@/components/design-system";
import { CollegeCombobox } from "@/components/registration/CollegeCombobox";
import { OTHER_COLLEGE_ID } from "@/data/colleges";

type FieldName = keyof ParticipantErrors;

/** Submit-time focus order — first invalid field in this order gets focus. */
const FIELD_ORDER: FieldName[] = ["name", "collegeName", "yearOfStudy", "phoneNumber", "email"];

const LABEL_CLASS = "font-body text-xs font-medium uppercase tracking-wide text-desert-sand";

const INPUT_CLASS =
  "mt-1.5 min-h-11 w-full border bg-royal-navy/60 px-4 py-2 font-body text-sm text-ivory placeholder:text-desert-sand/50 transition-colors duration-base focus:outline-none focus:ring-2 focus:ring-warm-gold";

/** Error state swaps the border to errorRose; resting state stays the same hairline gold every other field uses. */
function borderClass(hasError: boolean): string {
  return hasError ? "border-error-rose" : "border-antique-gold/40";
}

/**
 * Step 01 — Participant Details. Fields match the official registration form
 * exactly (docs/affinity-content-truth.md §4): name, college, year of
 * study, phone, email — see lib/registration/validation.ts for the
 * validation rules themselves (frontend UX judgment calls, not sourced
 * facts) and data/registrationVerification.ts for the PG-eligibility
 * conflict this step surfaces rather than silently resolving.
 *
 * The <form id="participant-form"> here has no submit button of its own —
 * RegistrationNavigation's "Next" button is associated with it via the
 * HTML `form` attribute (works across the component boundary natively,
 * no shared ref/lifted state needed) and triggers this form's onSubmit,
 * which validates, and on success advances the wizard directly. On
 * failure it reveals every field's error and moves focus to the first
 * invalid one — this step is the wizard's first with real validation, so
 * this is also where that "Next" ↔ form-submit wiring is introduced; see
 * docs/phase-12-participant-step-notes.md.
 *
 * Phase 29: College Name is now `CollegeCombobox`, not a free-text
 * `<input>` — the participant must pick one of the official colleges in
 * `data/colleges.ts`; nothing else is a valid value (see
 * `lib/registration/validation.ts`). `collegeRef` still gets focused on a
 * failed submit exactly as before, via the combobox's own `inputRef` prop
 * forwarding to its internal text input.
 *
 * Phase 38: `CollegeCombobox` now offers a trailing "Others" option for a
 * participant whose college genuinely isn't in the list (which also
 * gained one directly-requested entry, `college-087`, this phase — see
 * `data/colleges.ts`). Picking "Others" doesn't hand this step a fake
 * `College`; instead `participant.collegeId` is set to the
 * `OTHER_COLLEGE_ID` sentinel and this field swaps to a plain text
 * `<input>` so the participant can type their own college name into
 * `collegeName`, with a small link back to the searchable list. This is a
 * deliberate, narrow exception to "must select, not type" (Phase 30): the
 * participant is still choosing an explicit "not on this list" state
 * first, rather than the field silently accepting arbitrary text by
 * default.
 */
export function ParticipantStep() {
  const { state, dispatch } = useRegistration();
  const { participant } = state;

  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [attempted, setAttempted] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const collegeRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLSelectElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const fieldRefs: Record<FieldName, RefObject<HTMLInputElement | HTMLSelectElement | null>> = {
    name: nameRef,
    collegeId: collegeRef,
    collegeName: collegeRef,
    yearOfStudy: yearRef,
    phoneNumber: phoneRef,
    email: emailRef,
  };

  const errors = useMemo(() => validateParticipant(participant), [participant]);

  function isShown(field: FieldName): boolean {
    return Boolean((touched[field] || attempted) && errors[field]);
  }

  function markTouched(field: FieldName) {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }

  function errorId(field: FieldName): string {
    return `participant-${field}-error`;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const currentErrors = validateParticipant(participant);

    if (Object.keys(currentErrors).length > 0) {
      setAttempted(true);
      setTouched({ name: true, collegeName: true, yearOfStudy: true, phoneNumber: true, email: true });
      const firstInvalid = FIELD_ORDER.find((field) => currentErrors[field]);
      if (firstInvalid) fieldRefs[firstInvalid].current?.focus();
      return;
    }

    const nextStep = REGISTRATION_STEPS[REGISTRATION_STEPS.indexOf("participant") + 1];
    if (nextStep) dispatch({ type: "SET_STEP", step: nextStep });
  }

  return (
    <form id="participant-form" noValidate onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-2xl font-semibold tracking-wide text-ivory">Participant Details</h3>
        <p className="font-accent text-base italic text-warm-gold">
          Enter your details to begin your AFFINITY &apos;26 registration.
        </p>
      </div>

      <fieldset className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <legend className="sr-only">Participant details</legend>

        <div>
          <label htmlFor="participant-name" className={LABEL_CLASS}>
            Full Name <span aria-hidden="true" className="text-error-rose">*</span>
          </label>
          <input
            id="participant-name"
            ref={nameRef}
            type="text"
            autoComplete="name"
            value={participant.name}
            onChange={(e) => dispatch({ type: "UPDATE_PARTICIPANT", patch: { name: e.target.value } })}
            onBlur={() => markTouched("name")}
            aria-required="true"
            aria-invalid={isShown("name") || undefined}
            aria-describedby={isShown("name") ? errorId("name") : undefined}
            className={`${INPUT_CLASS} ${borderClass(isShown("name"))}`}
          />
          {isShown("name") && (
            <p id={errorId("name")} role="alert" className="mt-1.5 font-body text-xs text-error-rose">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="participant-college" className={LABEL_CLASS}>
            College Name <span aria-hidden="true" className="text-error-rose">*</span>
          </label>
          <div className="mt-1.5">
            {participant.collegeId === OTHER_COLLEGE_ID ? (
              <div className="flex flex-col gap-2">
                <input
                  id="participant-college"
                  ref={collegeRef}
                  type="text"
                  autoComplete="off"
                  placeholder="Enter your college name"
                  value={participant.collegeName}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_PARTICIPANT", patch: { collegeName: e.target.value } })
                  }
                  onBlur={() => markTouched("collegeName")}
                  aria-required="true"
                  aria-invalid={isShown("collegeName") || undefined}
                  aria-describedby={isShown("collegeName") ? errorId("collegeName") : undefined}
                  className={`${INPUT_CLASS} ${borderClass(isShown("collegeName"))}`}
                />
                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: "UPDATE_PARTICIPANT", patch: { collegeId: null, collegeName: "" } })
                  }
                  className="w-fit font-body text-xs uppercase tracking-wide text-antique-gold underline decoration-antique-gold/40 underline-offset-4 transition-colors duration-fast hover:text-warm-gold"
                >
                  Choose from the list instead
                </button>
              </div>
            ) : (
              <CollegeCombobox
                id="participant-college"
                inputRef={collegeRef}
                value={participant.collegeId}
                onSelect={(college) =>
                  dispatch({
                    type: "UPDATE_PARTICIPANT",
                    patch: { collegeId: college.id, collegeName: college.name },
                  })
                }
                onSelectOther={() =>
                  dispatch({
                    type: "UPDATE_PARTICIPANT",
                    patch: { collegeId: OTHER_COLLEGE_ID, collegeName: "" },
                  })
                }
                onBlur={() => markTouched("collegeName")}
                ariaInvalid={isShown("collegeName")}
                ariaDescribedBy={isShown("collegeName") ? errorId("collegeName") : undefined}
              />
            )}
          </div>
          {isShown("collegeName") && (
            <p id={errorId("collegeName")} role="alert" className="mt-1.5 font-body text-xs text-error-rose">
              {errors.collegeName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="participant-year" className={LABEL_CLASS}>
            Year of Study <span aria-hidden="true" className="text-error-rose">*</span>
          </label>
          <select
            id="participant-year"
            ref={yearRef}
            value={participant.yearOfStudy ?? ""}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_PARTICIPANT",
                patch: { yearOfStudy: (e.target.value || null) as YearOfStudy | null },
              })
            }
            onBlur={() => markTouched("yearOfStudy")}
            aria-required="true"
            aria-invalid={isShown("yearOfStudy") || undefined}
            aria-describedby={isShown("yearOfStudy") ? errorId("yearOfStudy") : undefined}
            className={`${INPUT_CLASS} ${borderClass(isShown("yearOfStudy"))}`}
          >
            <option value="" disabled>
              Select year of study
            </option>
            {YEAR_OF_STUDY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {isShown("yearOfStudy") && (
            <p id={errorId("yearOfStudy")} role="alert" className="mt-1.5 font-body text-xs text-error-rose">
              {errors.yearOfStudy}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="participant-phone" className={LABEL_CLASS}>
            Phone <span aria-hidden="true" className="text-error-rose">*</span>
          </label>
          <input
            id="participant-phone"
            ref={phoneRef}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="10-digit mobile number"
            value={participant.phoneNumber}
            onChange={(e) =>
              dispatch({ type: "UPDATE_PARTICIPANT", patch: { phoneNumber: e.target.value } })
            }
            onBlur={() => markTouched("phoneNumber")}
            aria-required="true"
            aria-invalid={isShown("phoneNumber") || undefined}
            aria-describedby={isShown("phoneNumber") ? errorId("phoneNumber") : undefined}
            className={`${INPUT_CLASS} ${borderClass(isShown("phoneNumber"))}`}
          />
          {isShown("phoneNumber") && (
            <p id={errorId("phoneNumber")} role="alert" className="mt-1.5 font-body text-xs text-error-rose">
              {errors.phoneNumber}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="participant-email" className={LABEL_CLASS}>
            Email <span aria-hidden="true" className="text-error-rose">*</span>
          </label>
          <input
            id="participant-email"
            ref={emailRef}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={participant.email}
            onChange={(e) => dispatch({ type: "UPDATE_PARTICIPANT", patch: { email: e.target.value } })}
            onBlur={() => markTouched("email")}
            aria-required="true"
            aria-invalid={isShown("email") || undefined}
            aria-describedby={isShown("email") ? errorId("email") : undefined}
            className={`${INPUT_CLASS} ${borderClass(isShown("email"))}`}
          />
          {isShown("email") && (
            <p id={errorId("email")} role="alert" className="mt-1.5 font-body text-xs text-error-rose">
              {errors.email}
            </p>
          )}
        </div>
      </fieldset>

      {participant.yearOfStudy === "pg" && (
        <div className="mt-6 flex flex-col items-start gap-2 border border-warm-gold/50 px-4 py-3">
          <EventBadge variant="verification" value={pgEligibilityConflict.status} />
          <p className="font-body text-sm text-desert-sand">{pgEligibilityConflict.summary}</p>
        </div>
      )}
    </form>
  );
}

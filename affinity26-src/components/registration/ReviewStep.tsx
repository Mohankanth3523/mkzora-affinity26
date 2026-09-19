"use client";

import type { ReactNode } from "react";
import { useRegistration } from "@/lib/registration/context";
import type { EventSelection, RegistrationStep } from "@/types/registration";
import { getEventById } from "@/data/events";
import type { AffinityEvent } from "@/types/event";
import { YEAR_OF_STUDY_LABEL } from "@/lib/registration/participantLabels";
import { pgEligibilityConflict } from "@/data/registrationVerification";
import { termsAndConditions } from "@/data/rules";
import { PACKAGES } from "@/data/pricing";
import { PricingBreakdown } from "@/components/registration/PricingBreakdown";
import { EventBadge, OrnamentalFrame } from "@/components/design-system";

interface ResolvedSelection {
  event: AffinityEvent;
  selection: EventSelection;
}

/** Hand-drawn pencil glyph for the per-section "Edit" affordance — matches the project's no-icon-library convention. */
function EditGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3 w-3 shrink-0">
      <path
        d="M11 1.5 L14.5 5 L5.5 14 L1.5 14.5 L2 10.5 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <line x1="9.3" y1="3.2" x2="12.8" y2="6.7" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

const LABEL_CLASS = "font-body text-xs font-medium uppercase tracking-wide text-desert-sand";

interface ReviewSectionProps {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}

/** One "Participant"/"Events"/"Package"/"Total" panel — a title, an "Edit" button that jumps straight back to the step that owns this data, and whatever read-only recap the section needs. Every section shares this one frame so all four read consistently as one document. */
function ReviewSection({ title, onEdit, children }: ReviewSectionProps) {
  return (
    <OrnamentalFrame padding="sm">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-display text-lg font-semibold text-ivory">{title}</h4>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex min-h-11 items-center gap-1.5 border border-antique-gold/30 px-3 font-body text-xs font-medium uppercase tracking-wide text-desert-sand transition-colors duration-fast hover:border-antique-gold/70 hover:text-ivory"
        >
          <EditGlyph />
          Edit
          <span className="sr-only"> {title}</span>
        </button>
      </div>
      <div className="mt-4">{children}</div>
    </OrnamentalFrame>
  );
}

/**
 * Step 04 — Review Registration. A read-only recap of every step before
 * it — Participant / Events / Package / Total — each with its own "Edit"
 * button that jumps straight back to the step that owns that data
 * (`SET_STEP`, the same action `RegistrationNavigation`'s Back button
 * already uses). Nothing here is computed independently of the steps that
 * came before it: the Total section reuses the exact same
 * `PricingBreakdown` component `PackageStep` uses (Phase 15), so the total
 * shown here can never drift from the one already computed by
 * `lib/registration/pricing.ts`.
 *
 * Registration flow simplification phase: the old "Team" section (team
 * name, captain, member roster) is gone along with the "Details" step
 * that used to populate it — this is a single-participant registration,
 * and a team event a participant selects is shown exactly like any other
 * selected event, no roster attached. See
 * docs/phase-36-registration-flow-simplification-notes.md.
 *
 * "Next" (labelled "Proceed" here — see `RegistrationNavigation`'s
 * `NEXT_LABEL_BY_STEP`) is gated on the acknowledgement checkbox alone
 * (`isReviewStepValid`); its wording is the project brief's own, verbatim
 * and unedited. The terms disclosure below it quotes
 * `data/rules.ts`'s `termsAndConditions` — the same centralized, sourced
 * list the (still-placeholder) Rules page reads — rather than writing new
 * legal copy for this one screen. See docs/phase-16-review-step-notes.md.
 */
export function ReviewStep() {
  const { state, dispatch } = useRegistration();
  const { participant, selectedEvents, package: packageSelection, review, pricing } = state;

  function goTo(step: RegistrationStep) {
    dispatch({ type: "SET_STEP", step });
  }

  const resolvedEvents: ResolvedSelection[] = selectedEvents
    .map((selection) => ({ selection, event: getEventById(selection.eventId) }))
    .filter((entry): entry is ResolvedSelection => Boolean(entry.event));

  const selectedPackage = packageSelection.packageId
    ? PACKAGES.find((option) => option.id === packageSelection.packageId)
    : undefined;

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-2xl font-semibold tracking-wide text-ivory">Review Registration</h3>
        <p className="font-accent text-base italic text-warm-gold">
          Check every detail before confirming your registration.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <ReviewSection title="Participant" onEdit={() => goTo("participant")}>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className={LABEL_CLASS}>Full Name</dt>
              <dd className="mt-1 font-body text-sm text-ivory">{participant.name.trim() || "—"}</dd>
            </div>
            <div>
              <dt className={LABEL_CLASS}>College</dt>
              <dd className="mt-1 font-body text-sm text-ivory">{participant.collegeName.trim() || "—"}</dd>
            </div>
            <div>
              <dt className={LABEL_CLASS}>Year of Study</dt>
              <dd className="mt-1 font-body text-sm text-ivory">
                {participant.yearOfStudy ? YEAR_OF_STUDY_LABEL[participant.yearOfStudy] : "—"}
              </dd>
            </div>
            <div>
              <dt className={LABEL_CLASS}>Phone</dt>
              <dd className="mt-1 font-body text-sm text-ivory">{participant.phoneNumber.trim() || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className={LABEL_CLASS}>Email</dt>
              <dd className="mt-1 font-body text-sm text-ivory">{participant.email.trim() || "—"}</dd>
            </div>
          </dl>

          {participant.yearOfStudy === "pg" && (
            <div className="mt-4 flex flex-col items-start gap-2 border border-warm-gold/50 px-4 py-3">
              <EventBadge variant="verification" value={pgEligibilityConflict.status} />
              <p className="font-body text-sm text-desert-sand">{pgEligibilityConflict.summary}</p>
            </div>
          )}
        </ReviewSection>

        <ReviewSection title="Events" onEdit={() => goTo("events")}>
          {resolvedEvents.length === 0 ? (
            <p className="font-body text-sm text-desert-sand/80">No events selected yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {resolvedEvents.map(({ event }) => (
                <li
                  key={event.id}
                  className="flex flex-wrap items-center justify-between gap-3 border border-antique-gold/20 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-body text-sm font-medium text-ivory">{event.name}</span>
                    <EventBadge variant="category" value={event.category} />
                  </div>
                  <EventBadge variant="mode" value={event.mode} />
                </li>
              ))}
            </ul>
          )}
        </ReviewSection>

        <ReviewSection title="Package" onEdit={() => goTo("package")}>
          {selectedPackage ? (
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <span className="font-body text-sm font-medium text-ivory">{selectedPackage.label}</span>
              <span className="font-display text-lg font-semibold text-antique-gold">
                ₹{selectedPackage.amount.toLocaleString("en-IN")}
              </span>
            </div>
          ) : (
            <p className="font-body text-sm text-desert-sand/80">No package selected yet.</p>
          )}
        </ReviewSection>

        <ReviewSection title="Total" onEdit={() => goTo("package")}>
          <PricingBreakdown pricing={pricing} showHeading={false} bare />
        </ReviewSection>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-antique-gold/20 pt-6">
        <details className="border border-antique-gold/20 px-4 py-3">
          <summary className="cursor-pointer font-body text-sm font-medium text-ivory">
            Read the AFFINITY &apos;26 terms &amp; conditions
          </summary>
          <ol className="mt-3 flex flex-col gap-2">
            {termsAndConditions.items.map((item, index) => (
              <li key={index} className="font-body text-xs text-desert-sand">
                {index + 1}. {item}
              </li>
            ))}
          </ol>
        </details>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={review.acceptedTerms}
            onChange={(e) => dispatch({ type: "SET_ACCEPTED_TERMS", accepted: e.target.checked })}
            className="mt-1 h-4 w-4 shrink-0 accent-antique-gold"
          />
          <span className="font-body text-sm text-ivory">
            I confirm that the information provided is correct and that I have read and agree to the
            AFFINITY &apos;26 terms and conditions.
          </span>
        </label>
      </div>
    </div>
  );
}

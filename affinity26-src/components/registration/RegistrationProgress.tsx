"use client";

import { REGISTRATION_STEPS, STEP_META } from "@/types/registration";
import { useRegistration } from "@/lib/registration/context";

/**
 * Phase 11: the wizard's step indicator — numbered circles connected by a
 * hairline, replacing WizardNav's plain text-button row. Self-contained
 * (reads `useRegistration()` directly, no props) so `RegistrationLayout`
 * only has to place it, not wire it.
 *
 * Preserves WizardNav's original behaviour deliberately: every step stays
 * clickable, including ones ahead of the current position. Phase 11 asks
 * for the wizard's *architecture*, not new validation/step-gating rules —
 * adding a "can't skip ahead" guard here would be scope this phase never
 * asked for, so it's left for a future phase to decide on purpose.
 */
export function RegistrationProgress() {
  const { state, dispatch } = useRegistration();
  const currentIndex = REGISTRATION_STEPS.indexOf(state.step);

  return (
    <nav aria-label="Registration steps">
      <ol className="flex items-start justify-between gap-1 sm:gap-2">
        {REGISTRATION_STEPS.map((step, index) => {
          const meta = STEP_META[step];
          const isCurrent = step === state.step;
          const isComplete = index < currentIndex;

          return (
            <li key={step} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                <span
                  aria-hidden="true"
                  className={[
                    "h-px flex-1 transition-colors duration-base",
                    index === 0 ? "opacity-0" : isComplete ? "bg-antique-gold" : "bg-antique-gold/20",
                  ].join(" ")}
                />
                <button
                  type="button"
                  onClick={() => dispatch({ type: "SET_STEP", step })}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Step ${meta.number}: ${meta.label}`}
                  className={[
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-display text-sm transition-colors duration-base sm:h-11 sm:w-11 sm:text-base",
                    isCurrent
                      ? "border-antique-gold bg-antique-gold text-midnight"
                      : isComplete
                        ? "border-antique-gold bg-transparent text-antique-gold hover:bg-antique-gold/10"
                        : "border-antique-gold/30 bg-transparent text-desert-sand hover:border-antique-gold/60 hover:text-ivory",
                  ].join(" ")}
                >
                  {meta.number}
                </button>
                <span
                  aria-hidden="true"
                  className={[
                    "h-px flex-1 transition-colors duration-base",
                    index === REGISTRATION_STEPS.length - 1
                      ? "opacity-0"
                      : isComplete
                        ? "bg-antique-gold"
                        : "bg-antique-gold/20",
                  ].join(" ")}
                />
              </div>
              <span
                className={[
                  "hidden text-center font-body text-xs uppercase tracking-wide sm:block",
                  isCurrent ? "text-ivory" : "text-desert-sand",
                ].join(" ")}
              >
                {meta.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

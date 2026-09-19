"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { RegistrationStep as RegistrationStepId } from "@/types/registration";
import { REGISTRATION_STEPS, STEP_META } from "@/types/registration";
import { OrnamentalFrame } from "@/components/design-system";

/** Zero-padded step count for the "Step N of 0X" caption below — computed from `REGISTRATION_STEPS.length` so this never drifts out of sync if a step is ever added or removed again (the registration flow simplification phase's own five-vs-six-step mismatch this fixes). */
const STEP_COUNT_LABEL = String(REGISTRATION_STEPS.length).padStart(2, "0");

export interface RegistrationStepProps {
  step: RegistrationStepId;
  children: ReactNode;
}

/**
 * Phase 11: the frame around whichever step is currently active. Renders
 * whatever step content `app/register/page.tsx` passes as `children`; the
 * actual step components (ParticipantStep, EventsStep, ...) keep their own
 * `"use client"` boundaries exactly as Phase 02 left them.
 *
 * `OrnamentalFrame` doesn't take an `aria-labelledby` prop, so the
 * accessible structure here relies on ordinary document order — an `<h2>`
 * heading inside the frame — rather than forcing a landmark label onto a
 * plain `<section>`. A `<section>` with no accessible name simply isn't
 * exposed as an ARIA landmark; that's not a regression, just the default.
 *
 * Phase 23 (accessibility audit): advancing/going back a step re-renders
 * this frame's content in place — no route change, no new page — so
 * nothing told a keyboard or screen-reader user the step actually changed;
 * focus stayed on whatever Back/Next/step-indicator button was just
 * clicked, which is easy to miss and gives no cue where you've landed.
 * This now moves focus to the step's own `<h2>` on every step change
 * (skipping the very first render, so landing on `/register` doesn't
 * yank focus away from the page on load — see the `isFirstRender` guard).
 * `tabIndex={-1}` makes the heading programmatically focusable without
 * adding it to the Tab order. The heading's `aria-label` includes the
 * "Step N of 0X" context that's otherwise only in a sibling `<span>`, so a
 * screen reader announces the full context in one utterance on focus —
 * mirroring `RegistrationProgress`'s own `aria-label` pattern for the same
 * information.
 */
export function RegistrationStep({ step, children }: RegistrationStepProps) {
  const meta = STEP_META[step];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  return (
    <OrnamentalFrame padding="lg" className="mt-8">
      <header className="mb-8 flex flex-col gap-1 border-b border-antique-gold/20 pb-6">
        <span className="font-accent text-sm italic text-warm-gold">Step {meta.number} of {STEP_COUNT_LABEL}</span>
        <h2
          ref={headingRef}
          tabIndex={-1}
          aria-label={`Step ${meta.number} of ${STEP_COUNT_LABEL}: ${meta.label}`}
          className="scroll-mt-24 font-display text-2xl font-semibold tracking-wide text-ivory sm:text-3xl"
        >
          {meta.label}
        </h2>
        <p className="font-body text-sm text-desert-sand">{meta.description}</p>
      </header>
      {children}
    </OrnamentalFrame>
  );
}

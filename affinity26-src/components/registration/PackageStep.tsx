"use client";

import { useRegistration } from "@/lib/registration/context";
import { PACKAGES } from "@/data/pricing";
import { OrnamentalFrame } from "@/components/design-system";
import { PricingBreakdown } from "@/components/registration/PricingBreakdown";

/** Filled circle for an included feature (Food/Accommodation on a given package tier). */
function CheckGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-antique-gold">
      <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M6 10.2 L8.7 13 L14 7.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Plain dash for a feature this tier does not include — never hidden entirely, so all three cards are directly comparable at a glance. */
function DashGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-desert-sand/40">
      <line x1="5" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Step 03 — Select Registration Package. Three official packages
 * (docs/affinity-content-truth.md §5) as a radio choice, plus a live
 * pricing readout reading straight from `state.pricing`
 * (`lib/registration/pricing.ts`) — never a client-side arbitrary number.
 *
 * Phase 31 (event selection & pricing cleanup): the displayed total is
 * now always exactly the selected package's own price — no per-event fee
 * (Chess, Track & Field, Short Film, the online bundle, any esports
 * title) is added to it, and the Chess-only-registration override that
 * used to replace the base package with a flat ₹250 no longer applies to
 * this display, per the phase brief's explicit instruction ("Do NOT add
 * individual event fees to the displayed total... Do not display
 * separate prices for... chess"). That override is still true of the
 * official brochure (docs/affinity-content-truth.md §5) — it has not been
 * deleted from the source-of-truth doc, and `data/events/sports.ts`'s
 * Chess record still carries its own `fee` — this is a deliberate,
 * documented simplification of what the *frontend displays*, not a
 * correction of the source. See docs/phase-31-event-pricing-cleanup-notes.md
 * for the [VERIFY WITH ORGANIZER] this leaves open: how a Chess-only
 * registrant's real payment should reconcile with the flat package price
 * now shown here.
 *
 * Like Events (Phase 13), "Next" uses the simple boolean gate in
 * `RegistrationNavigation` (`isPackageStepValid`) rather than a
 * form-submit — there's nothing to validate about *which* package beyond
 * "one is chosen." See `docs/phase-15-package-step-notes.md`.
 */
export function PackageStep() {
  const { state, dispatch } = useRegistration();

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-2xl font-semibold tracking-wide text-ivory">Select Registration Package</h3>
        <p className="font-accent text-base italic text-warm-gold">
          Choose the package that best fits your AFFINITY &apos;26 registration.
        </p>
      </div>

      <fieldset className="mt-6">
        <legend className="sr-only">Select a registration package</legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PACKAGES.map((option) => {
            const selected = state.package.packageId === option.id;
            return (
              <OrnamentalFrame
                key={option.id}
                as="label"
                padding="md"
                interactive
                className={[
                  "flex cursor-pointer flex-col gap-4",
                  selected ? "ring-1 ring-antique-gold" : "",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-display text-base font-semibold leading-snug text-ivory">
                    {option.label}
                  </span>
                  <input
                    type="radio"
                    name="package"
                    value={option.id}
                    checked={selected}
                    onChange={() => dispatch({ type: "SET_PACKAGE", packageId: option.id })}
                    aria-label={`${option.label} — ${formatRupees(option.amount)}`}
                    className="mt-1 h-4 w-4 shrink-0 accent-antique-gold"
                  />
                </div>

                <span className="font-display text-3xl font-semibold text-antique-gold">
                  {formatRupees(option.amount)}
                </span>

                <ul className="flex flex-col gap-1.5 border-t border-antique-gold/20 pt-3">
                  <li className="flex items-center gap-2 font-body text-sm text-desert-sand">
                    <CheckGlyph />
                    Registration
                  </li>
                  <li className="flex items-center gap-2 font-body text-sm text-desert-sand">
                    {option.includesFood ? <CheckGlyph /> : <DashGlyph />}
                    Food
                  </li>
                  <li className="flex items-center gap-2 font-body text-sm text-desert-sand">
                    {option.includesAccommodation ? <CheckGlyph /> : <DashGlyph />}
                    Accommodation
                  </li>
                </ul>
              </OrnamentalFrame>
            );
          })}
        </div>
      </fieldset>

      <PricingBreakdown pricing={state.pricing} className="mt-6" />
    </div>
  );
}

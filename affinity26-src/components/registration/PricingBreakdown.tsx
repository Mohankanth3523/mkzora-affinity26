import type { PricingSummary } from "@/types/registration";
import { OrnamentalFrame } from "@/components/design-system";

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export interface PricingBreakdownProps {
  pricing: PricingSummary | null;
  /** @default "Price Breakdown" */
  heading?: string;
  /** Suppress the panel's own heading — set false when a parent section already labels this block (Phase 16's Review "Fees" section). @default true */
  showHeading?: boolean;
  /** Skip this component's own `OrnamentalFrame` wrapper and render just the lines/total/notes — for a parent that supplies its own frame (Phase 16's `ReviewSection`), so nested panels don't produce two ornamental borders around one block of numbers. @default false */
  bare?: boolean;
  className?: string;
}

/**
 * The line-item pricing panel — Base Registration / Food / Accommodation /
 * each event's own fee / Total, plus any truth-mode assumption notes.
 * Extracted in Phase 16 from `PackageStep` (its original Phase 15 home) so
 * `ReviewStep`'s "Fees" section can show the exact same, always-in-sync
 * breakdown instead of a second hand-written copy — the same reasoning
 * `lib/events/eventGroups.ts` documents for its own Phase 13 extraction.
 *
 * Reads only `pricing` (already computed by `lib/registration/pricing.ts`
 * from `PACKAGES` and `data/events/*`) — no arbitrary client-side number
 * is possible here.
 */
export function PricingBreakdown({
  pricing,
  heading = "Price Breakdown",
  showHeading = true,
  bare = false,
  className = "",
}: PricingBreakdownProps) {
  const content = (
    <>
      {showHeading && (
        <h4 className="font-body text-xs font-medium uppercase tracking-wide text-desert-sand">{heading}</h4>
      )}

      {pricing && pricing.lines.length > 0 ? (
        <>
          <dl className={showHeading ? "mt-3 flex flex-col gap-2" : "flex flex-col gap-2"}>
            {pricing.lines.map((line, index) => (
              <div key={`${line.label}-${index}`} className="flex items-baseline justify-between gap-4">
                <dt className="min-w-0 font-body text-sm text-desert-sand">{line.label}</dt>
                <dd className="shrink-0 font-body text-sm tabular-nums text-ivory">{formatRupees(line.amount)}</dd>
              </div>
            ))}
            {/*
              Phase 23 (accessibility audit): the Total row is a `dt`/`dd`
              pair too, so it belongs inside this same `<dl>` — a `div`
              wrapping a `dt`+`dd` group is valid `<dl>` content, but the
              pair isn't valid sitting in a sibling `<div>` outside any
              `<dl>` at all, which is what this was before (an HTML
              content-model violation, not just a style nit — assistive
              tech that relies on the term/definition relationship for
              `dt`/`dd` has no `<dl>` ancestor to find it in).
            */}
            <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-antique-gold/30 pt-3">
              <dt className="font-display text-base font-semibold text-ivory">Total</dt>
              <dd className="font-display text-xl font-semibold tabular-nums text-antique-gold">
                {formatRupees(pricing.total)}
              </dd>
            </div>
          </dl>

          <p className="mt-2 font-body text-xs text-desert-sand">Estimate — subject to organizer confirmation.</p>
        </>
      ) : (
        <p
          className={
            showHeading ? "mt-3 font-body text-sm text-desert-sand/80" : "font-body text-sm text-desert-sand/80"
          }
        >
          Select a package to see your price breakdown.
        </p>
      )}

      {pricing && pricing.assumptions.length > 0 && (
        <div className="mt-5 border-t border-antique-gold/20 pt-4">
          <p className="font-body text-xs font-medium uppercase tracking-wide text-desert-sand">
            Notes on this estimate
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {pricing.assumptions.map((note, index) => (
              <li key={index} className="font-body text-xs text-desert-sand/90">
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );

  if (bare) {
    return <div className={className}>{content}</div>;
  }

  return (
    <OrnamentalFrame padding="sm" className={className}>
      {content}
    </OrnamentalFrame>
  );
}

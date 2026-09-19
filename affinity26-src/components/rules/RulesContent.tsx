import type { VerificationStatus } from "@/types/event";
import { ruleCategories } from "@/data/rulesCategories";
import { refundPolicyConflict } from "@/data/rulesVerification";
import { pgEligibilityConflict } from "@/data/registrationVerification";
import { Accordion, EventBadge, type AccordionItemData } from "@/components/design-system";

/** Small gold-dot bullet — the same list treatment `EventDetailsModal` uses for event rules, reused here for visual consistency across the site. */
function RuleList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, index) => (
        <li key={index} className="relative pl-4">
          <span
            aria-hidden="true"
            className="absolute left-0 top-[0.6em] h-1 w-1 rounded-full bg-antique-gold"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * A flagged-conflict callout — same visual pattern `ParticipantStep`/
 * `ReviewStep` use for `pgEligibilityConflict`: a warm-gold-bordered box,
 * an `EventBadge variant="verification"`, and the flag's own summary
 * text. Never folded into the plain rule list above it, so a reader can't
 * mistake an unresolved conflict for a settled rule.
 */
function ConflictNotice({ flag }: { flag: { status: VerificationStatus; summary: string } }) {
  return (
    <div className="mt-4 flex flex-col items-start gap-2 border border-warm-gold/50 px-4 py-3">
      <EventBadge variant="verification" value={flag.status} />
      <p className="font-body text-sm text-desert-sand">{flag.summary}</p>
    </div>
  );
}

/**
 * Builds the Accordion's item list from `data/rulesCategories.ts` —
 * kept as its own Server Component (not inlined in `app/rules/page.tsx`)
 * so the page file stays a thin metadata + layout shell, matching how
 * `app/events/page.tsx` delegates to `EventsExplorer`.
 *
 * Two categories carry an extra flagged-conflict notice below their rule
 * list: Eligibility (the PG-eligibility conflict already surfaced in the
 * registration wizard) and Payment (the refund-policy conflict). Every
 * other category is a plain verified-rules list.
 */
export function RulesContent() {
  const items: AccordionItemData[] = ruleCategories.map((category) => {
    const showsPgConflict = category.id === "eligibility";
    const showsRefundConflict = category.id === "payment";

    return {
      id: category.id,
      title: category.title,
      content: (
        <>
          <RuleList items={category.items} />
          {showsPgConflict && <ConflictNotice flag={pgEligibilityConflict} />}
          {showsRefundConflict && <ConflictNotice flag={refundPolicyConflict} />}
        </>
      ),
    };
  });

  return <Accordion items={items} twoColumn headingLevel="h2" />;
}

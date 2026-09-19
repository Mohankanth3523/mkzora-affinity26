/**
 * Rules & regulations — source: docs/affinity-content-truth.md §4, §9, §10, §13, §14.
 *
 * Structured by section rather than as one long list, so the Rules page
 * (and any per-category "general rules" panel in the Events Explorer) can
 * render each block independently. Nothing here is invented — every
 * bullet traces to the T&C docx and/or the brochure's general-rules pages.
 *
 * Phase 39 (remove Online Events completely) removed three bullets that
 * were specifically about the now-removed Online Events category:
 * `culturalsGeneralRules` lost "Online-event participants receive an
 * e-certificate." and "Last date for online-entry submission: 26
 * September 2026." (the latter judged, not unambiguous — see
 * docs/phase-39-remove-online-events-notes.md for why); `restrictions`
 * lost "Bot likes / artificial engagement are banned across every
 * Instagram-likes-judged online event." No other bullet was touched —
 * general rules that happen to name a now-removed event (e.g. the
 * AI-generated-content restriction naming English/Tamil Poetry) were
 * deliberately left as-is, since they're sourced content unrelated to the
 * word "online," not part of that phase's scope.
 */

export interface RuleSection {
  id: string;
  title: string;
  items: string[];
}

export const registrationRules: RuleSection = {
  id: "registration",
  title: "Registration",
  items: [
    "Registration is mandatory to participate in any event.",
    "Must be completed only through the official registration link (no on-spot cash registration).",
    "On-spot registration must also go through the official link — cash is not accepted at the registration desk.",
    "Original college ID card (hardcopy and softcopy) is mandatory and must be submitted at registration.",
    "Softcopy of the college ID card and Affinity tag must be shown to event in-charges before each event.",
    "Registered individuals must carry proof of transaction.",
    "Registration closes 2 hours prior to the respective event.",
    "The Affinity tag is mandatory for entry into the auditorium.",
    "A participant may join any number of events, as long as timings don't clash.",
    "ID cards are returned only if the Affinity tag is returned; lost tags are not replaced without a separate charge (amount unspecified).",
    "The registration desk closes for 2 hours during the sports inauguration.",
    "Food and accommodation are available, charged only through the registration link.",
  ],
};

export const termsAndConditions: RuleSection = {
  id: "terms-and-conditions",
  title: "Terms & Conditions",
  items: [
    "Registration fees once paid are non-refundable and non-transferable unless the event is cancelled. NOTE: this conflicts with the brochure's blanket \"no amount will be refunded at any cost\" and with Free Fire's specific refund-on-cancellation promise — see docs/affinity-content-truth.md §14(a).",
    "Participants must carry a valid college ID card and present it whenever requested by the organizing committee.",
    "Participants are expected to maintain proper discipline and decorum throughout the event.",
    "The organizing committee reserves the right to disqualify any participant/team for misconduct, rule violation, or inappropriate behaviour.",
    "Participants are fully responsible for their personal belongings and valuables — the organizing committee is not responsible for loss, theft, or damage.",
    "Any damage caused to college property, event equipment, or venue facilities is the responsibility of the concerned participant/team.",
    "Participants may be required to compensate for damage or loss caused by negligence or misconduct.",
    "Accommodation is provided only along with food.",
    "Prize rewards are subject to change based on the number of entries in each category.",
    "Events with limited slots are allotted on a first-come, first-served basis.",
    "The organizing committee is not responsible for injuries, accidents, or unforeseen incidents from a participant's own negligence.",
    "Participants must follow the instructions of the organizing committee, volunteers, security personnel, and college authorities.",
    "Consumption or possession of alcohol, drugs, tobacco, or any prohibited substance is strictly prohibited on the premises.",
    "Any ragging, harassment, bullying, intimidation, or discrimination results in immediate disciplinary action.",
    "Participants must follow individual event rules; judges'/referees' decisions are final.",
    "The organizing committee may modify the schedule, venue, rules, or timings if circumstances require, communicated whenever possible.",
    "By registering, participants are deemed to have read, understood, and agreed to all terms and conditions.",
  ],
};

export const sportsGeneralRules: RuleSection = {
  id: "sports-general",
  title: "Sports — General Rules",
  items: [
    "Open to all medical colleges.",
    "Only MBBS students allowed (batches 2021–2026); postgraduates not allowed unless specified for that sport.",
    "Participants/teams must be present at least 30 minutes prior to their event.",
    "Participants in multiple events must inform organizers in advance to avoid scheduling clashes.",
    "Fixtures/schedule are announced a day in advance and may change; changes are conveyed to teams as soon as possible.",
    "In case of disagreement, the referee's/organizing committee's decision is final.",
    "Smoking, alcohol, or narcotics use leads to disqualification and is strictly prohibited.",
    "A team may be denied or disqualified for misbehaviour.",
    "The host college does not participate in its own tournament.",
    "Registration is compulsory; without it participation is not allowed.",
    "Prize amounts are subject to change according to the number of entries in each category.",
  ],
};

export const culturalsGeneralRules: RuleSection = {
  id: "culturals-general",
  title: "Culturals — General Rules",
  items: [
    "Registration is mandatory to participate.",
    "Only MBBS students allowed (batches 2021–2026); no postgraduates allowed.",
    "Onstage performance order is decided by a lot system before the event.",
    "Limited-slot events are prioritized by order of registration.",
    "A team that misses its allotted slot does not get a second chance.",
    "The organizing committee's and judges' decision is final.",
    "Participants must be present on-site at least 2 hours prior to the event.",
    "Each member must show a softcopy of their college ID and Affinity tag to event in-charges before the event starts.",
    "Obscenity, plagiarism, or vulgarity is not entertained and leads to disqualification.",
    "Participant name(s) and event coordinator name/contact must be provided at registration.",
    "Bot likes are not encouraged and lead to disqualification.",
    "A team may be denied or disqualified for misbehaviour.",
    "Damage to college property is dealt with severely.",
    "Smoking/alcohol/narcotics use leads to disqualification and is strictly prohibited.",
    "Prize amounts are subject to change according to the number of entries.",
  ],
};

export const accommodationRules: RuleSection = {
  id: "accommodation",
  title: "Accommodation",
  items: [
    "Accommodation must be confirmed through the registration link; all delegates wanting it must register.",
    "A refundable caution deposit of ₹100 per head is paid at the registration desk on arrival (not at online registration).",
    "Accommodation is basic; buckets are provided and must be returned in good condition.",
    "Bed sheets and pillow covers are NOT provided.",
    "Allotment is based on contingent size, arrival date, and duration of stay.",
    "Accommodation is mostly shared rooms/halls (more than 10 people per room), possibly shared with other colleges' delegates.",
    "Locks and keys are provided; the organizers are not responsible for lost valuables/luggage/belongings.",
    "Smoking, alcohol, or narcotics on campus leads to severe action.",
    "A team may be denied participation or disqualified for misconduct.",
    "Damage to college property is fined accordingly.",
  ],
};

export const restrictions: RuleSection = {
  id: "important-restrictions",
  title: "Important Restrictions",
  items: [
    "No refund stated as the general rule — but see the refund-policy conflict noted under Terms & Conditions above.",
    "Zero tolerance for smoking, alcohol, and narcotics anywhere on campus/venue.",
    "Anti-ragging/harassment/bullying/discrimination policy, with immediate disciplinary action.",
    "Decency/anti-vulgarity requirements across performance events — obscenity or vulgarity disqualifies.",
    "AI-generated content is banned in Short Film, Movie Scene Recreation, English Poetry, and Tamil Poetry — but explicitly required (with credited tools/prompts) in the AI Poster event.",
    "Esports: emulators and cheat tools (aimbot/trigger bot/ESP) are banned and disqualify.",
    "No liability for participants' personal belongings, injuries, or accidents from participant negligence.",
    "The host college does not compete in its own sports tournament.",
    "Stage-messing substances (oil, water, glitter, snow spray, confetti) are banned across several stage/dance events.",
  ],
};

export const allRuleSections: RuleSection[] = [
  registrationRules,
  termsAndConditions,
  sportsGeneralRules,
  culturalsGeneralRules,
  accommodationRules,
  restrictions,
];

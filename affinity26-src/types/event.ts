/**
 * Event data model.
 *
 * Field names follow the AFFINITY '26 project brief's data-architecture
 * requirement: id, name, category, mode, type, fee, limitedSlots,
 * minParticipants, maxParticipants, eligibility, description, rules,
 * prize, contact, deadline, verificationStatus.
 *
 * TRUTH MODE: every value that populates an AffinityEvent in data/events/*
 * must trace back to docs/affinity-content-truth.md. Where the source
 * documents disagree with each other, or leave a fact unstated,
 * `verificationStatus` must be set accordingly and `verificationNotes`
 * must explain the gap/conflict — never silently guess a number.
 */

/** Top-level grouping used for navigation, filtering, and routing. */
export type EventCategory =
  | "sports"
  | "cultural-onstage"
  | "cultural-offstage"
  | "online-cultural"
  | "online-esports";

/** Whether participants attend in person or submit/compete remotely. */
export type EventMode = "offline" | "online";

/**
 * A loose descriptor of participation shape. Deliberately a string union
 * rather than an enum of every possible team size, since the source
 * brochure describes team composition in prose (e.g. "7 mains + 5 subs")
 * that doesn't reduce cleanly to a single label — the numeric detail lives
 * in `team`, this is just what the events explorer's filter chips show.
 */
export type EventType = "individual" | "duo" | "team" | "squad";

export type VerificationStatus =
  /** Every field on this record is explicitly stated in a source document. */
  | "confirmed"
  /** At least one field (commonly deadline/venue/date) is not stated anywhere and is rendered as TBA. */
  | "pending-organizer"
  /** Source documents state this fact two different ways; see verificationNotes and docs/affinity-content-truth.md §14. */
  | "conflicting";

/**
 * The event/registration pricing restructuring phase (see
 * docs/affinity-content-truth.md and the phase's own notes doc): every
 * AFFINITY '26 event is either
 *
 *  - "standard" — covered by one of the three registration packages
 *    (`data/pricing.ts`). No individual fee for a standard event is ever
 *    added to the package total; its own `fee` field stays in the data
 *    purely for reference/a future backend, never surfaced as something
 *    to pay on the Events page or in the registration wizard.
 *  - "direct-contact" — Chess, Badminton, the Track & Field group
 *    (Athletics — Track, Shot Put, Discus Throw, Javelin Throw), Free
 *    Fire, PUBG, E-Football, FIFA, Short Film, and Sollal Vel. These
 *    events have their own separate entry fee and their own registration
 *    process handled directly by the event's in-charge — never through
 *    the online package flow. They stay visible everywhere events are
 *    browsed, but cannot be added to `RegistrationState.selectedEvents`
 *    as a package selection; the UI instead surfaces the event's own
 *    `contact` list and `fee` as "contact the in-charge" information.
 *
 * This field is the single source of truth for that split — no component
 * re-derives it from an event's id, category, or fee shape.
 */
export type RegistrationMode = "standard" | "direct-contact";

export interface ContactPerson {
  name: string;
  /** Phone number as printed in the source (not normalized/validated — some source numbers are inconsistently formatted). */
  phone?: string;
  role?: string;
}

export type FeeUnit =
  | "per_person"
  | "per_team"
  | "per_film"
  | "per_squad"
  | "included_in_package"
  | "unspecified";

export interface EventFee {
  /** Amount in INR, or null when not stated (never fabricate a number). */
  amount: number | null;
  unit: FeeUnit;
  notes?: string;
}

/** One line of a prize table — most events pay out per placement, and several split by gender or by judging method (e.g. "likes" vs "judgement"). */
export interface PrizeTier {
  /** e.g. "Winner", "Runner", "1st Prize", "Judgement", "Likes". */
  label: string;
  amount: number | null;
  currency: "INR";
  /** e.g. "Boys", "Girls" — omitted when the event doesn't split by group. */
  group?: string;
}

export interface TeamComposition {
  min?: number;
  max?: number;
  /** Max teams/entries a single college may field, when stated. */
  perCollegeLimit?: number;
  notes?: string;
}

export interface LimitedSlots {
  isLimited: boolean;
  /** Numeric cap on total entries/teams, when the source states one. */
  cap?: number;
  notes?: string;
}

export type FestivalDay = "day-1" | "day-2" | "day-3" | "tba";

export interface AffinityEvent {
  id: string;
  name: string;
  category: EventCategory;
  mode: EventMode;
  type: EventType;
  day?: FestivalDay;

  fee: EventFee;
  limitedSlots?: LimitedSlots;
  minParticipants?: number;
  maxParticipants?: number;
  team?: TeamComposition;

  /** Eligibility notes specific to this event, layered on top of the general category eligibility in data/rules.ts. */
  eligibility?: string;

  /** Short, factual one-line summary for card/list views. Not marketing copy — see data/content.ts for that. */
  description?: string;

  /**
   * Concise rule bullets sourced from the brochure. This is a summary,
   * not a verbatim transcription of the full multi-paragraph rules —
   * the complete text lives in the source PDF and should be consulted
   * directly when authoring final on-site rules copy.
   */
  rules?: string[];

  prize?: PrizeTier[];
  contact?: ContactPerson[];

  /** ISO date string ("2026-09-26"), the literal string "tba", or undefined when nothing is stated. */
  deadline?: string;

  verificationStatus: VerificationStatus;
  verificationNotes?: string;

  /** See `RegistrationMode`'s own doc comment. Required — every event must be explicitly classified, never left to default. */
  registrationMode: RegistrationMode;
}

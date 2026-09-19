/**
 * Official AFFINITY '26 participating-college directory — the ONLY source
 * for the registration wizard's College Name field (`CollegeCombobox`,
 * `components/registration/CollegeCombobox.tsx`).
 *
 * Source: the college list document supplied for Phase 30 (86 entries,
 * numbered 1 through 86 in the source). Every one of those `name`s is
 * transcribed verbatim — same spelling, same punctuation, same "&" vs.
 * "and", same comma placement as the source. Nothing here is corrected,
 * shortened, renamed, merged, or supplemented from general knowledge: the
 * transcription was produced programmatically (each source paragraph
 * copied character-for-character into this array) specifically so no name
 * could drift through manual retyping, consistent with this project's
 * TRUTH MODE rule for institutional information. Two pairs of entries look
 * similar at a glance (`college-057`/`college-070`/`college-079` are all
 * "Vinayaka"/"Vinayaga" institutions, and `college-082`/`college-083` are
 * two separate Dhanalakshmi Srinivasan institutions in Perambalur) — the
 * source lists all of them as distinct entries, so all are kept, per the
 * phase brief's explicit "if two entries are separately present in the
 * source, keep both as separate entries" instruction.
 *
 * `college-087` ("SRM Medical College, Chennai") is a Phase 38 addition —
 * not part of the 86-entry source docx above. It was supplied as a direct,
 * explicit instruction from this project's own operator to add that named
 * college, not transcribed from a document, so it's recorded here with
 * that provenance rather than folded silently into the "86 official
 * entries" description — see docs/phase-38-college-list-addition-notes.md.
 * It is a distinct institution from `college-086` ("Trichy SRM Medical
 * College Hospital & Research Centre, Trichy") — different campus,
 * different city — not a duplicate or a correction of that entry.
 *
 * `sourceOrder` 1–86 preserves the original source document's own
 * ordering independently of `id`/array position, so that numbered list can
 * always be reconstructed even if this array is ever resorted for a UX
 * reason (none is applied here — array order and `sourceOrder` currently
 * agree, on purpose). `college-087` continues the sequence at 87 rather
 * than being spliced into the middle, so 1–86 still means exactly what it
 * always meant.
 */

export interface College {
  id: string;
  name: string;
  /**
   * 1-based position in the original 86-entry source document, or — for
   * `college-087` onward — the order later entries were added in, each
   * continuing the sequence rather than being inserted into 1–86.
   */
  sourceOrder: number;
}

/**
 * Sentinel `Participant.collegeId` value for "my college isn't in this
 * list" — `CollegeCombobox` offers it as a trailing option, and selecting
 * it swaps the field to a plain text input (`ParticipantStep`) where the
 * participant types their own college name into `collegeName` instead.
 * Deliberately not a `College` in the array below: it is a UI affordance,
 * not an official, sourced institution, so keeping it out of `colleges`
 * keeps that array's own integrity checks meaningful as a count of real
 * entries. See docs/phase-38-college-list-addition-notes.md.
 */
export const OTHER_COLLEGE_ID = "others" as const;

export const colleges: College[] = [
  { id: "college-001", name: "Madras Medical College", sourceOrder: 1 },
  { id: "college-002", name: "Stanley Medical College", sourceOrder: 2 },
  { id: "college-003", name: "Kilpauk Medical College", sourceOrder: 3 },
  { id: "college-004", name: "Government Medical College, Omandurar", sourceOrder: 4 },
  { id: "college-005", name: "Chengalpattu Medical College", sourceOrder: 5 },
  { id: "college-006", name: "Madurai Medical College", sourceOrder: 6 },
  { id: "college-007", name: "Coimbatore Medical College", sourceOrder: 7 },
  { id: "college-008", name: "Government Mohan Kumaramangalam Medical College", sourceOrder: 8 },
  { id: "college-009", name: "K.A.P. Viswanatham Government Medical College", sourceOrder: 9 },
  { id: "college-010", name: "Thanjavur Medical College", sourceOrder: 10 },
  { id: "college-011", name: "Tirunelveli Medical College", sourceOrder: 11 },
  { id: "college-012", name: "Kanyakumari Government Medical College", sourceOrder: 12 },
  { id: "college-013", name: "Government Medical College, Thoothukudi", sourceOrder: 13 },
  { id: "college-014", name: "Government Sivagangai Medical College", sourceOrder: 14 },
  { id: "college-015", name: "Government Medical College, Theni", sourceOrder: 15 },
  { id: "college-016", name: "Government Medical College, Dharmapuri", sourceOrder: 16 },
  { id: "college-017", name: "Government Medical College, Vellore", sourceOrder: 17 },
  { id: "college-018", name: "Government Medical College, Villupuram", sourceOrder: 18 },
  { id: "college-019", name: "Government Medical College, Ramanathapuram", sourceOrder: 19 },
  { id: "college-020", name: "Government Medical College, Virudhunagar", sourceOrder: 20 },
  { id: "college-021", name: "Government Medical College, Tiruppur", sourceOrder: 21 },
  { id: "college-022", name: "Government Medical College, Nilgiris", sourceOrder: 22 },
  { id: "college-023", name: "Government Medical College, Namakkal", sourceOrder: 23 },
  { id: "college-024", name: "Government Medical College, Pudukkottai", sourceOrder: 24 },
  { id: "college-025", name: "Government Medical College, Thiruvallur", sourceOrder: 25 },
  { id: "college-026", name: "Government Medical College, Krishnagiri", sourceOrder: 26 },
  { id: "college-027", name: "Government Medical College, Nagapattinam", sourceOrder: 27 },
  { id: "college-028", name: "Government Medical College, Dindigul", sourceOrder: 28 },
  { id: "college-029", name: "Government Medical College, Ariyalur", sourceOrder: 29 },
  { id: "college-030", name: "Government Medical College, Kallakurichi", sourceOrder: 30 },
  { id: "college-031", name: "Government Medical College, Karur", sourceOrder: 31 },
  { id: "college-032", name: "Government Medical College, Thiruvarur", sourceOrder: 32 },
  { id: "college-033", name: "Government Medical College, Tiruvannamalai", sourceOrder: 33 },
  { id: "college-034", name: "Government Medical College & Hospital, Cuddalore", sourceOrder: 34 },
  { id: "college-035", name: "Government Erode Medical College & Hospital", sourceOrder: 35 },
  { id: "college-036", name: "Government Medical College & ESIC Hospital, Coimbatore", sourceOrder: 36 },
  { id: "college-037", name: "ESIC Medical College & PGIMSR, Chennai", sourceOrder: 37 },
  { id: "college-038", name: "PSG Institute of Medical Sciences & Research", sourceOrder: 38 },
  { id: "college-039", name: "KMCH Institute of Health Sciences", sourceOrder: 39 },
  { id: "college-040", name: "Tagore Medical College & Hospital", sourceOrder: 40 },
  { id: "college-041", name: "Panimalar Medical College Hospital & Research Institute", sourceOrder: 41 },
  { id: "college-042", name: "Madha Medical College & Research Institute", sourceOrder: 42 },
  { id: "college-043", name: "ACS Medical College & Hospital", sourceOrder: 43 },
  { id: "college-044", name: "Sri Muthukumaran Medical College", sourceOrder: 44 },
  { id: "college-045", name: "Shri Sathya Sai Medical College & Research Institute", sourceOrder: 45 },
  { id: "college-046", name: "Srinivasan Medical College & Hospital", sourceOrder: 46 },
  { id: "college-047", name: "Nandha Medical College & Hospital", sourceOrder: 47 },
  { id: "college-048", name: "Swamy Vivekanandha Medical College Hospital & Research Institute", sourceOrder: 48 },
  { id: "college-049", name: "Velammal Medical College Hospital & Research Institute", sourceOrder: 49 },
  { id: "college-050", name: "VELS Medical College & Hospital", sourceOrder: 50 },
  { id: "college-051", name: "Sri Venkateshwaraa Medical College Hospital & Research Institute", sourceOrder: 51 },
  { id: "college-052", name: "PSP Medical College Hospital & Research Institute", sourceOrder: 52 },
  { id: "college-053", name: "Takshashila Medical College", sourceOrder: 53 },
  { id: "college-054", name: "J.R. Medical College & Hospital", sourceOrder: 54 },
  { id: "college-055", name: "APS Medical College Hospital & Research Institute", sourceOrder: 55 },
  { id: "college-056", name: "Indira Medical College & Hospitals", sourceOrder: 56 },
  { id: "college-057", name: "Kanyakumari Medical Mission Research Centre", sourceOrder: 57 },
  { id: "college-058", name: "Karpaga Vinayaga Institute of Medical Sciences", sourceOrder: 58 },
  { id: "college-059", name: "Melmaruvathur Adiparasakthi Institute of Medical Sciences & Research", sourceOrder: 59 },
  { id: "college-060", name: "Rajalakshmi Medical College Hospital & Research Institute", sourceOrder: 60 },
  { id: "college-061", name: "St. Peter's Medical College, Hospital & Research Institute", sourceOrder: 61 },
  { id: "college-062", name: "Sri Lalithambigai Medical College & Hospital", sourceOrder: 62 },
  { id: "college-063", name: "AIMS Madurai", sourceOrder: 63 },
  { id: "college-064", name: "Sri Ramachandra Medical College & Research Institute", sourceOrder: 64 },
  { id: "college-065", name: "Saveetha Medical College & Hospital", sourceOrder: 65 },
  { id: "college-066", name: "Meenakshi Medical College & Research Institute", sourceOrder: 66 },
  { id: "college-067", name: "Chettinad Hospital & Research Institute", sourceOrder: 67 },
  { id: "college-068", name: "Sree Balaji Medical College & Hospital", sourceOrder: 68 },
  { id: "college-069", name: "Bharath Medical College & Hospital", sourceOrder: 69 },
  { id: "college-070", name: "Vinayaka Missions Kirupananda Variyar Medical College & Hospitals", sourceOrder: 70 },
  { id: "college-071", name: "Jawaharlal Institute of Postgraduate Medical Education & Research (JIPMER)", sourceOrder: 71 },
  { id: "college-072", name: "Indira Gandhi Medical College & Research Institute", sourceOrder: 72 },
  { id: "college-073", name: "Pondicherry Institute of Medical Sciences & Research", sourceOrder: 73 },
  { id: "college-074", name: "Sri Manakula Vinayagar Medical College & Hospital", sourceOrder: 74 },
  { id: "college-075", name: "Sri Venkateswaraa Medical College, Hospital & Research Centre", sourceOrder: 75 },
  { id: "college-076", name: "Sri Lakshmi Narayana Institute of Medical Sciences", sourceOrder: 76 },
  { id: "college-077", name: "Mahatma Gandhi Medical College & Research Institute", sourceOrder: 77 },
  { id: "college-078", name: "Aarupadai Veedu Medical College & Hospitals", sourceOrder: 78 },
  { id: "college-079", name: "Vinayaka Missions Medical College, Karaikal", sourceOrder: 79 },
  { id: "college-080", name: "Annapurna Medical College & Hospital, Salem", sourceOrder: 80 },
  { id: "college-081", name: "Christian Medical College, Vellore", sourceOrder: 81 },
  { id: "college-082", name: "Dhanalakshmi Srinivasan Institute of Medical Sciences and Hospital, Perambalur", sourceOrder: 82 },
  { id: "college-083", name: "Dhanalakshmi Srinivasan Medical College & Hospital, Perambalur", sourceOrder: 83 },
  { id: "college-084", name: "Karpagam Faculty of Medical Sciences & Research, Coimbatore", sourceOrder: 84 },
  { id: "college-085", name: "Sree Mookambika Institute of Medical Sciences, Kanyakumari", sourceOrder: 85 },
  { id: "college-086", name: "Trichy SRM Medical College Hospital & Research Centre, Trichy", sourceOrder: 86 },
  { id: "college-087", name: "SRM Medical College, Chennai", sourceOrder: 87 },
];

/**
 * Dev/build-time integrity check — runs the moment anything imports this
 * module (Next.js executes this at build/prerender time as well as at
 * runtime), so a future edit that accidentally drops, duplicates, or
 * miscounts an entry fails loudly instead of silently shipping a wrong
 * dropdown. Per the Phase 30 brief: "The build should fail... if the list
 * accidentally contains a duplicate ID or incorrect count." Phase 38 raised
 * the expected count from 86 (the original source document) to 87 (adding
 * `college-087`, a directly-requested addition — see this file's own top
 * comment) and extended the sequence-gap check to match.
 */
if (colleges.length !== 87) {
  throw new Error(`Expected 87 AFFINITY '26 colleges (86 sourced + 1 later addition), found ${colleges.length}.`);
}

const seenIds = new Set<string>();
const seenSourceOrders = new Set<number>();
for (const college of colleges) {
  if (seenIds.has(college.id)) {
    throw new Error(`Duplicate college id: "${college.id}".`);
  }
  seenIds.add(college.id);

  if (seenSourceOrders.has(college.sourceOrder)) {
    throw new Error(`Duplicate college sourceOrder: ${college.sourceOrder}.`);
  }
  seenSourceOrders.add(college.sourceOrder);
}
for (let expected = 1; expected <= 87; expected += 1) {
  if (!seenSourceOrders.has(expected)) {
    throw new Error(`Missing college sourceOrder ${expected} — the 1–87 sequence has a gap.`);
  }
}

export function getCollegeById(id: string): College | undefined {
  return colleges.find((college) => college.id === id);
}

/**
 * Pure, local search over `data/colleges.ts` — no network, no external
 * search API (the phase brief is explicit: "Do NOT use external search
 * APIs... Use the local official data file"). Kept separate from
 * `CollegeCombobox.tsx` the same way `lib/registration/validation.ts` is
 * kept separate from the step components that call it — testable in
 * isolation, reusable if a second college-selection UI is ever needed.
 */
import type { College } from "@/data/colleges";

/** Lowercases and collapses/trims whitespace — "  Coimbatore   Medical " and "coimbatore medical" compare equal. */
function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Case-insensitive, whitespace-tolerant substring search across the full
 * college name. A multi-word query (e.g. "medical coimbatore") matches
 * when every word appears somewhere in the name, regardless of the
 * words' order in the query — this is what lets a query search "meaningful
 * words within the college name" rather than only a single contiguous
 * substring, while a single-word query (every example in the phase brief:
 * "madras", "coimbatore", "psg", "vinayaka") behaves exactly like a plain
 * substring match against the full name.
 *
 * An empty/whitespace-only query returns the full list, in its existing
 * (source) order — this is what lets the combobox show every college when
 * it's first opened with nothing typed yet.
 */
export function searchColleges(query: string, source: College[] = []): College[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return source;

  const terms = normalizedQuery.split(" ").filter(Boolean);

  return source.filter((college) => {
    const normalizedName = normalize(college.name);
    return terms.every((term) => normalizedName.includes(term));
  });
}

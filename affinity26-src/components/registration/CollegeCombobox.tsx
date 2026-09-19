"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { colleges, getCollegeById, type College } from "@/data/colleges";
import { searchColleges } from "@/lib/registration/collegeSearch";

export interface CollegeComboboxProps {
  id: string;
  /** Currently selected college's id, or `null`/`""` if none chosen yet. */
  value: string | null;
  onSelect: (college: College) => void;
  /**
   * Phase 38 — fires when the participant picks the trailing "Others"
   * option instead of a real college. This component never represents
   * "Others" as a selected value itself (it isn't a `College`); the
   * caller (`ParticipantStep`) is expected to swap this combobox out for a
   * plain text field in response, the same way it already owns every
   * other field-level decision for this step.
   */
  onSelectOther: () => void;
  onBlur?: () => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  placeholder?: string;
  className?: string;
}

/** Same chevron treatment as Accordion's ChevronGlyph — rotates open/closed, no icon-library dependency. */
function ChevronGlyph({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={[
        "h-4 w-4 shrink-0 text-antique-gold transition-transform duration-base ease-ornamental motion-reduce:transition-none",
        open ? "rotate-180" : "rotate-0",
      ].join(" ")}
    >
      <path
        d="M3 6 L8 11 L13 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-warm-gold">
      <path
        d="M3 8.5 L6.3 12 L13 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const INPUT_CLASS =
  "min-h-11 w-full border bg-royal-navy/60 py-2 pl-4 pr-10 font-body text-sm text-ivory placeholder:text-desert-sand/50 transition-colors duration-base focus:outline-none focus:ring-2 focus:ring-warm-gold";

function borderClass(hasError: boolean): string {
  return hasError ? "border-error-rose" : "border-antique-gold/40";
}

/**
 * Phase 29 — the AFFINITY '26 College Name field, replacing the old free-
 * text `<input>`. A WAI-ARIA 1.2 "combobox with listbox popup" pattern:
 * `role="combobox"` on the visible text input, `role="listbox"` on the
 * popup, `role="option"` per college, `aria-activedescendant` tracking
 * the keyboard-highlighted option. Deliberately not `<select>` — 86
 * options need search to be usable, and not a full-screen modal like
 * `EventDetailsModal` — this is an inline field, so its popover is a
 * plain `absolute`-positioned panel anchored to the input, capped at
 * `max-h-72` with its own scroll so it can never extend past the
 * viewport (the phase brief's own mobile requirement) without needing any
 * viewport-flipping logic.
 *
 * `data/colleges.ts` is the only source of truth this ever reads from —
 * nothing here hard-codes a name. Selecting an option is the *only* way
 * `onSelect` fires; there is no path from typed text alone to a committed
 * value, which is what makes "the participant must select a college from
 * the official list, not type an arbitrary one" true. Typed text that
 * doesn't end in a confirmed selection is discarded on blur/Escape, back
 * to whatever the last real selection was (or blank, if there never was
 * one) — see `reconcileDisplayValue`.
 *
 * Phase 38: a trailing "Others" row is always rendered as the list's last
 * option (whether the search matched 0 or many colleges), for a
 * participant whose college genuinely isn't one of the 87 entries in
 * `data/colleges.ts`. It's folded into the same keyboard/mouse selection
 * model as a real college (arrow-key reachable at index `filtered.length`,
 * `Enter`/click both work) but fires the separate `onSelectOther` callback
 * instead of `onSelect`, since it isn't a `College` and never becomes
 * `value` here.
 */
export function CollegeCombobox({
  id,
  value,
  onSelect,
  onSelectOther,
  onBlur,
  inputRef: externalInputRef,
  ariaInvalid,
  ariaDescribedBy,
  placeholder = "Search or select your college",
  className = "",
}: CollegeComboboxProps) {
  const selected = value ? (getCollegeById(value) ?? null) : null;

  const [query, setQuery] = useState(selected?.name ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef ?? fallbackInputRef;
  const listRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  const listboxId = useId();
  const statusId = useId();

  // Keep the displayed text in sync with the committed selection whenever
  // it changes from *outside* this component (hydration from
  // localStorage, Back-then-forward through the wizard, RESET) — but
  // never while the popup is open, which would stomp on what the user is
  // actively typing.
  useEffect(() => {
    if (!isOpen) {
      setQuery(selected?.name ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const filtered = useMemo(() => searchColleges(query, colleges), [query]);

  function openList() {
    if (isOpen) return;
    setIsOpen(true);
    const currentIndex = selected ? filtered.findIndex((college) => college.id === selected.id) : -1;
    setActiveIndex(query.trim() ? (filtered.length > 0 ? 0 : -1) : currentIndex);
  }

  /** Reverts the visible text to the last real selection (or blank) — called on blur/Escape so a typed-but-never-selected string never lingers in the field. */
  function reconcileDisplayValue() {
    setQuery(selected?.name ?? "");
  }

  function closeList() {
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function commit(college: College) {
    onSelect(college);
    setQuery(college.name);
    closeList();
  }

  /** Phase 38 — the trailing "Others" option's own commit path; see `onSelectOther`'s doc comment above for why this is separate from `commit`. */
  function commitOther() {
    onSelectOther();
    closeList();
  }

  function handleChange(nextValue: string) {
    setQuery(nextValue);
    setIsOpen(true);
    setActiveIndex(nextValue.trim() ? 0 : -1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        openList();
        return;
      }
      // Phase 38: the range now extends one past the last real college, to
      // the trailing "Others" row (index === filtered.length).
      setActiveIndex((prev) => Math.min(prev + 1, filtered.length));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        openList();
        return;
      }
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      if (isOpen && activeIndex >= 0) {
        if (activeIndex === filtered.length) {
          event.preventDefault();
          commitOther();
          return;
        }
        const college = filtered[activeIndex];
        if (college) {
          event.preventDefault();
          commit(college);
        }
      }
      return;
    }

    if (event.key === "Escape") {
      if (isOpen) {
        event.preventDefault();
        reconcileDisplayValue();
        closeList();
      }
      return;
    }

    if (event.key === "Tab") {
      // Let focus move naturally; onBlur (below) reconciles the value.
      closeList();
    }
  }

  function handleBlur() {
    // A brief delay so a mousedown on an option (which fires before this
    // input's blur) still has a chance to commit its selection first —
    // see the option's own onMouseDown, which calls preventDefault for
    // exactly this reason; this timeout is the belt-and-suspenders half.
    window.setTimeout(() => {
      reconcileDisplayValue();
      closeList();
    }, 0);
    onBlur?.();
  }

  useEffect(() => {
    if (activeIndex < 0) return;
    const key = activeIndex === filtered.length ? "others" : filtered[activeIndex]?.id;
    if (!key) return;
    optionRefs.current.get(key)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, filtered]);

  // Click outside the field/popover closes it without committing.
  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        reconcileDisplayValue();
        closeList();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const activeOptionId =
    activeIndex < 0
      ? undefined
      : activeIndex === filtered.length
        ? `${listboxId}-others`
        : filtered[activeIndex]
          ? `${listboxId}-${filtered[activeIndex]!.id}`
          : undefined;

  return (
    <div ref={wrapperRef} className={["relative", className].join(" ")}>
      <input
        id={id}
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-required="true"
        aria-invalid={ariaInvalid || undefined}
        aria-describedby={[ariaDescribedBy, statusId].filter(Boolean).join(" ") || undefined}
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={openList}
        onClick={openList}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`${INPUT_CLASS} ${borderClass(Boolean(ariaInvalid))}`}
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <ChevronGlyph open={isOpen} />
      </span>

      <p id={statusId} role="status" aria-live="polite" className="sr-only">
        {isOpen
          ? filtered.length === 0
            ? "No colleges match your search."
            : `${filtered.length} college${filtered.length === 1 ? "" : "s"} available.`
          : ""}
      </p>

      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Colleges"
          className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-72 overflow-y-auto border border-antique-gold/40 bg-royal-navy shadow-card"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 font-body text-sm text-desert-sand/70">
              No colleges match your search.
            </li>
          ) : (
            filtered.map((college, index) => {
              const isActive = index === activeIndex;
              const isSelected = selected?.id === college.id;
              return (
                <li
                  key={college.id}
                  ref={(node) => {
                    if (node) optionRefs.current.set(college.id, node);
                    else optionRefs.current.delete(college.id);
                  }}
                  id={`${listboxId}-${college.id}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(event) => {
                    // Commit before the input's blur fires, so the click
                    // doesn't get lost to reconcileDisplayValue().
                    event.preventDefault();
                    commit(college);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={[
                    "flex min-h-11 cursor-pointer items-center justify-between gap-3 border-b border-antique-gold/10 px-4 py-2 font-body text-sm text-ivory",
                    isActive ? "bg-antique-gold/15" : "",
                  ].join(" ")}
                >
                  <span className="truncate">{college.name}</span>
                  {isSelected && <CheckGlyph />}
                </li>
              );
            })
          )}
          {/*
            Phase 38: always present, regardless of search results — the
            escape hatch for a participant whose college genuinely isn't
            one of the 87 entries above. Selecting it hands off to
            `onSelectOther` rather than `onSelect`; see that prop's doc
            comment.
          */}
          <li
            ref={(node) => {
              if (node) optionRefs.current.set("others", node);
              else optionRefs.current.delete("others");
            }}
            id={`${listboxId}-others`}
            role="option"
            aria-selected={false}
            onMouseDown={(event) => {
              event.preventDefault();
              commitOther();
            }}
            onMouseEnter={() => setActiveIndex(filtered.length)}
            className={[
              "flex min-h-11 cursor-pointer items-center gap-2 border-t border-antique-gold/25 px-4 py-2 font-body text-sm italic text-desert-sand",
              activeIndex === filtered.length ? "bg-antique-gold/15" : "",
            ].join(" ")}
          >
            Others — my college isn&rsquo;t listed
          </li>
        </ul>
      )}
    </div>
  );
}

# Design System — Color Contrast Matrix (Phase 03, extended Phase 05, Phase 06, Phase 07, Phase 12)

This is the actual WCAG 2.1 relative-luminance contrast calculation behind
every color pairing used in `components/design-system/` and
`styles/tokens.ts`. It was computed programmatically (Python, standard
relative-luminance formula), not eyeballed — see the method at the bottom
of this file to reproduce it.

Thresholds: **AA normal text** requires ≥ 4.5:1. **AA large text** (≥24px,
or ≥19px bold) and UI components/graphical objects require ≥ 3.0:1.

## Text on a solid background

| Foreground | Background | Ratio | AA normal (4.5) | AA large (3.0) |
| --- | --- | ---: | :---: | :---: |
| ivory | midnight | 17.34 | ✅ | ✅ |
| warmGold | midnight | 12.02 | ✅ | ✅ |
| antiqueGold | midnight | 8.22 | ✅ | ✅ |
| desertSand | midnight | 11.30 | ✅ | ✅ |
| ivory | royalNavy | 15.83 | ✅ | ✅ |
| warmGold | royalNavy | 10.98 | ✅ | ✅ |
| antiqueGold | royalNavy | 7.51 | ✅ | ✅ |
| desertSand | royalNavy | 10.32 | ✅ | ✅ |
| ivory | burgundy | 14.44 | ✅ | ✅ |
| warmGold | burgundy | 10.01 | ✅ | ✅ |
| antiqueGold | burgundy | 6.85 | ✅ | ✅ |
| desertSand | burgundy | 9.41 | ✅ | ✅ |
| ivory | emerald | 6.03 | ✅ | ✅ |
| warmGold | emerald | 4.18 | ❌ | ✅ |
| desertSand | emerald | 3.93 | ❌ | ✅ |
| antiqueGold | emerald | 2.86 | ❌ | ❌ |
| midnight | antiqueGold | 8.22 | ✅ | ✅ |
| midnight | warmGold | 12.02 | ✅ | ✅ |
| ivory (80% opacity) | midnight | 11.10 | ✅ | ✅ |
| ivory (60% opacity) | midnight | 6.52 | ✅ | ✅ |
| ivory (60% opacity) | royalNavy | 6.29 | ✅ | ✅ |
| desertSand (80% opacity) | midnight | 7.43 | ✅ | ✅ |
| desertSand (80% opacity) | royalNavy | 6.96 | ✅ | ✅ |
| warmGold (80% opacity) | midnight | 7.86 | ✅ | ✅ |
| warmGold (80% opacity) | royalNavy | 7.35 | ✅ | ✅ |
| desertSand | ivory | 1.53 | ❌ | ❌ |
| antiqueGold | ivory | 2.11 | ❌ | ❌ |
| errorRose | midnight | 6.60 | ✅ | ✅ |
| errorRose | royalNavy | 6.02 | ✅ | ✅ |
| burgundy | midnight | 1.20 | ❌ | ❌ |

## Rules this design system follows

1. **On midnight or royalNavy** (the two page backgrounds): ivory,
   warmGold, antiqueGold, and desertSand are all safe for normal text.
2. **On a burgundy fill** (e.g. a badge or callout background): all four
   of the above are safe for normal text.
3. **On an emerald fill**: only **ivory** is safe for normal text.
   warmGold/desertSand are large-text-only; antiqueGold must not be used
   as text on emerald at any size. `EventBadge`'s `mode="online"` chip
   (the only current emerald-fill use) uses ivory text for this reason.
4. **burgundy and emerald as text color** on a dark background both fail
   badly (1.20 and 2.87 against midnight) — never used as small text,
   only as a background fill.
5. **Gold/sand as text on ivory** fails badly (1.53–2.11) — ivory in this
   palette is a *text* color for dark surfaces, never used as a light
   background for gold text elsewhere in the system.
6. **GoldButton/SecondaryButton**: `text-midnight` on `bg-antique-gold`
   (8.22:1) and on the `hover:bg-warm-gold` state (12.02:1) both clear AA
   comfortably, including for the button's own hover state, not just its
   resting state.
7. **`Navbar`'s inactive desktop link color** (`text-ivory/80`, i.e. ivory
   at 80% opacity) still clears AA comfortably once actually blended
   against the midnight background (11.10:1) — checked because an alpha-
   reduced color is *not* the same ratio as its 100%-opacity version and
   has to be recomputed, not assumed safe by association.
8. **`Hero`'s institution-name line** (`text-ivory/60`, its smallest and
   lowest-contrast text — 11px on mobile) still clears 6.5:1 against both
   midnight and royalNavy, well past the 4.5:1 AA-normal-text floor even
   though WCAG doesn't relax that floor for small type.
9. **`Story`'s two new opacity variants** — `text-desert-sand/80` (the
   left-column edition/institution meta line) and `text-warm-gold/80`
   (the story panel's blockquote attribution, its smallest text at
   `text-xs`/12px) — both clear AA comfortably once actually blended
   (6.96–7.86:1 against midnight/royalNavy), so neither needed a size- or
   color-adjustment to stay accessible at that small scale.
10. **`errorRose` (Phase 12) — the wizard's inline form-error color.**
    Added because the brief's eight-color palette has no semantic error
    red, and its one red-family color (`burgundy`) fails badly as text on
    a dark background (1.20:1 against midnight — confirmed here, not just
    asserted). `errorRose` (`#E8735A`, a warm terracotta rather than a
    pure red, to stay inside the Arabian Nights palette's temperature)
    clears AA comfortably as normal text on both page backgrounds
    (6.60:1 midnight, 6.02:1 royalNavy) — used for `ParticipantStep`'s
    inline field-error messages and `aria-invalid` input borders.

## What still needs a human check

Contrast ratio is necessary but not sufficient for accessible color use.
Not verified here (needs a real browser + a colorblindness simulator, not
just arithmetic):

- Whether `EventBadge`'s category-vs-verification chip **colors alone**
  (as opposed to their text labels, which are always present) would be
  distinguishable to a colorblind viewer — mitigated by the fact that
  every badge carries a text label, so color is never the *only* signal.
- Real rendered contrast once Tailwind's opacity modifiers
  (`border-antique-gold/30`, `bg-royal-navy/60`, etc.) are composited
  against whatever sits behind them — the table above is for solid
  (100%-opacity) fills only, which is why `OrnamentalFrame` and border-only
  badge variants deliberately keep *text* at full-opacity token colors
  even when a border or background is intentionally translucent.

## Method (to reproduce or extend this table)

```python
def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def channel_lin(c):
    c = c / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def rel_luminance(hex_color):
    r, g, b = hex_to_rgb(hex_color)
    R, G, B = channel_lin(r), channel_lin(g), channel_lin(b)
    return 0.2126 * R + 0.7152 * G + 0.0722 * B

def contrast(c1, c2):
    L1, L2 = rel_luminance(c1), rel_luminance(c2)
    lighter, darker = max(L1, L2), min(L1, L2)
    return (lighter + 0.05) / (darker + 0.05)
```

This is the formula from WCAG 2.1 §1.4.3 / §1.4.11, not an approximation.

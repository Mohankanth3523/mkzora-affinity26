---
name: Cinematic Editorial
colors:
  surface: '#141313'
  surface-dim: '#141313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2b2a2a'
  surface-container-highest: '#353434'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c7'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c9c6c5'
  primary: '#c9c6c5'
  on-primary: '#313030'
  primary-container: '#050505'
  on-primary-container: '#797777'
  inverse-primary: '#5f5e5e'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#c7c6c6'
  on-tertiary: '#2f3131'
  tertiary-container: '#040505'
  on-tertiary-container: '#777777'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c9c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#141313'
  on-background: '#e5e2e1'
  surface-variant: '#353434'
typography:
  display-xl:
    fontFamily: Hanken Grotesk
    fontSize: 120px
    fontWeight: '700'
    lineHeight: 110px
    letterSpacing: -0.04em
  display-xl-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 64px
    fontWeight: '600'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.15em
  mono-technical:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
spacing:
  margin-desktop: 64px
  margin-tablet: 32px
  margin-mobile: 20px
  gutter: 24px
  section-gap: 160px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered to evoke the atmosphere of a high-end digital gallery and a premier creative laboratory. It merges the precision of technology with the expressive scale of luxury fashion editorial. The aesthetic is rooted in **Modern Minimalism** with a **Cinematic Dark** influence, prioritizing content through dramatic contrast and generous, intentional whitespace.

The target audience consists of luxury brands, technology innovators, and high-net-worth creative partners. The UI should feel authoritative yet invisible—a sophisticated frame for abstract 3D architectural forms and high-fidelity project imagery. Every interaction must feel deliberate, utilizing structured grids and sharp, technical execution to communicate premium quality.

## Colors

The palette is monochromatic and high-contrast, designed to maintain a "Near-Black" cinematic environment. 

- **Primary Background (#050505):** A deep, void-like black that provides the foundation for reflective 3D materials.
- **Primary Typography (#F5F5F5):** An off-white that prevents visual fatigue while maintaining maximum legibility against the dark background.
- **Secondary/Muted Text (#888888):** Used for metadata, labels, and secondary information to create a clear visual hierarchy.
- **Accent (Deep Chrome Silver / #C0C0C0):** A restrained metallic tone used sparingly for interactive states or subtle hairline details.

Avoid the use of pure saturated colors. All color expression should come from embedded media or subtle gradients within 3D assets.

## Typography

Typography is the primary driver of the brand's luxury identity. The system uses a tiered approach:

1.  **Display & Headlines:** Utilizing **Hanken Grotesk** for its sharp, contemporary geometry. Display sizes use extremely tight tracking (`-0.04em`) to create a "locked" editorial feel.
2.  **Body:** **Inter** provides a neutral, systematic bridge that ensures readability across technical descriptions and studio narratives.
3.  **Technical Metadata:** **Geist** is used for labels, numbers, and UI controls to lean into the "Technology" aspect of the studio, emphasizing precision and developer-grade clarity.

Large display text should often be used as a structural element, occasionally overlapping image boundaries or spanning the full width of the grid.

## Layout & Spacing

This design system employs a **12-column Fixed Grid** on desktop (1440px max-width) and a **4-column Fluid Grid** on mobile.

The layout philosophy is defined by "The Breath of Luxury"—using expansive vertical gaps (`section-gap`) to separate distinct thoughts and projects. Elements should often be offset from the center or aligned to specific grid lines to create asymmetrical tension. 

- **Desktop:** Large margins (64px) to frame the content like a gallery piece.
- **Vertical Rhythm:** Spacing between elements follows a strict 8px baseline. 
- **Project Grids:** Use a mix of full-width feature rows and staggered 2-column modules to maintain visual interest.

## Elevation & Depth

In a near-black environment, depth is created through **Tonal Layers** and **Subtle Outlines** rather than heavy shadows.

- **Surface Tiers:** The base layer is #050505. Elevated containers (like cards or menus) use #0A0A0A or #121212.
- **Outlines:** Use "Ghost Borders"—1px solid lines with low opacity (10-15% white). This defines structure without breaking the cinematic flow.
- **Glassmorphism:** Reserved exclusively for navigation bars and temporary overlays. Use a high `backdrop-filter: blur(20px)` with a semi-transparent dark fill (#050505 at 70% opacity).
- **Interactive Depth:** On hover, elements may transition from a 1px border to a very subtle inner-glow to simulate light catching the edge of a physical object.

## Shapes

The shape language is **Sharp (0px)**. 

To maintain the architectural and high-fashion aesthetic, all buttons, cards, and input fields utilize hard 90-degree corners. This reinforces the precision of the studio's technical output. Avoid all rounded corners unless they are inherent to a 3D asset or specific iconography. 

Visual separation should be achieved through hairline strokes and spatial grouping rather than radius-based containment.

## Components

- **Buttons:** 
  - *Primary:* Solid #F5F5F5 with #050505 text. 
  - *Secondary:* Outline (1px #F5F5F5) with #F5F5F5 text.
  - *Interaction:* Subtle width expansion or text-shift on hover to provide a high-end tactile feel.
- **Project Cards:** Full-bleed imagery with typography overlays. Labels should use the `label-caps` style for metadata (e.g., YEAR // CATEGORY).
- **Navigation:** A minimalist top-bar with a "Glassmorphism" blur. Links use `label-caps` with a horizontal strike-through or underline animation on hover.
- **Input Fields:** Bottom-border only (1px #888888). Labels stay static in `label-caps` above the field. Focus state changes border to #F5F5F5.
- **Chips/Tags:** Sharp-edged boxes with 1px borders, using `mono-technical` typography for a utility-forward look.
- **Custom Cursor:** A small dot with a delayed trailing circle to emphasize the "Luxury Tech" interactive experience.
# MKZORA — Digital Experiences

A premium digital studio website for **MKZORA**, showcasing web development, e-commerce, branding, social media, and digital marketing services.

## Project Type

Static single-page website (HTML / CSS / JavaScript).

## Entry Point

```
index.html
```

## Folder Structure

```
mkzora/
├── index.html              # Main entry point (single-page site)
├── css/
│   └── main.css            # All custom styles
├── js/
│   └── main.js             # Interactions, cursor, animations, menu
├── assets/
│   └── images/
│       └── screen.png      # Website screenshot / preview
├── favicon/
│   ├── favicon.svg         # SVG favicon
│   ├── favicon.png         # PNG favicon (32×32)
│   └── apple-touch-icon.png # Apple touch icon (180×180)
├── docs/
│   └── DESIGN.md           # Design system documentation
└── README.md               # This file
```

## Technology Stack

- **HTML5** — Semantic markup
- **Tailwind CSS** — Utility classes (loaded via CDN)
- **Custom CSS** — Animations, cursor, responsive overrides
- **Vanilla JavaScript** — Mobile menu, custom cursor, scroll animations
- **Three.js** — 3D hero background animation (loaded via CDN)
- **Google Fonts** — Hanken Grotesk, Inter, Geist
- **Material Symbols** — Icon set (loaded via CDN)

## How to Run Locally

Open `index.html` directly in a browser, or use any local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve .

# Using VS Code
# Install "Live Server" extension, then right-click index.html → "Open with Live Server"
```

## Deployment

This is a static site — deploy by uploading all files to any static hosting provider (Cloudflare Pages, Netlify, Vercel, GitHub Pages, etc.).

Ensure the full directory structure is preserved during deployment.

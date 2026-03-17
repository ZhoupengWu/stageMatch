# Report: `resources/` folder structure and styling

## ✅ Overview
The `resources/` directory contains a self-contained set of front-end assets that are used by the application.

### Structure
- `resources/css/` — page-specific stylesheets
  - `index.css` — styling for the main map / route planner page
  - `home.css` — styling for the dashboard view (sidebar, cards, layout)
  - `login.css` — styling for the login screen
  - `landing.css` — **new** styling for the public landing/homepage *(added)*

- `resources/js/` — page-specific JavaScript
  - `index.js` — map + route planner interaction
  - `home.js` — dashboard UI interactions (menu toggle, page section navigation)
  - `login.js` — login page form handling (likely validation + submit behavior)
  - `landing.js` — **new** landing page interactions (search, scroll reveal, navbar shadow) *(added)*

- `resources/html/` — HTML templates for each page
  - `index.html` — route planner page, loads Bootstrap + Leaflet + app JS/CSS
  - `home.html` — dashboard UI (sidebar, cards, navigation) and uses app CSS/JS
  - `login.html` — login screen template
  - `landing.html` — **new** homepage / landing page for stageMatch *(added)*

- `resources/img/` — static image assets
  - `bergamoalto.jpg` — appears used as background asset in some page

---

## 🏠 Landing Page (`landing.html`) — Added
A new homepage has been created for the **stageMatch** application. It is a standalone, self-contained HTML file (no external CSS/JS files required at this stage — styles are inlined) that serves as the public-facing entry point before login.

### Sections included
1. **Navbar** — sticky, glassmorphism effect (`backdrop-filter: blur`), logo, nav links, CTA buttons (Accedi / Registrati)
2. **Hero** — full-viewport section with animated gradient blobs, headline, subtitle, search bar with category tags, and a stats strip (offers, partner companies, satisfaction rate)
3. **Features grid** — 6-card grid highlighting key platform features (interactive map, matching, applications, alerts, verified profiles, dashboard)
4. **For students / For companies** — two-column offer cards with feature lists and per-audience CTAs
5. **How it works** — 3-step vertical timeline
6. **CTA banner** — final call-to-action section with gradient card
7. **Footer** — logo, nav links, copyright

### Design choices
- **Dark theme** — background `#0d0f14`, surface `#161a24`, consistent with a modern SaaS aesthetic
- **Typography** — `Syne` (display / headings, 800 weight) + `DM Sans` (body), loaded from Google Fonts via CDN
- **Color palette** — hardcoded values (no CSS custom properties used in other files); `--c-accent: #3b82f6` (blue), `--c-accent2: #06d6a0` (teal/green), purely local to this file
- **Animations** — CSS-only: `fadeUp` keyframes for staggered hero reveal, `float` keyframes for background blobs, `pulse` for the live badge dot
- **Noise texture overlay** — SVG-based `feTurbulence` filter as a `body::before`, adds subtle depth without an image asset
- **Layout** — Flexbox and CSS Grid (`auto-fit / minmax`), no Bootstrap dependency on this page
- **Responsive** — media query at 700px hides nav links and collapses grid to single column

### Flask integration
- All internal links use `url_for(...)` (e.g., `url_for('login')`, `url_for('register')`, `url_for('home')`) matching Flask's routing convention used in other templates
- Static assets (Google Fonts) are loaded via external CDN, consistent with the approach in `index.html` and `home.html`

---

## 🎨 Styling Approach
- Each view has its own dedicated CSS file, which keeps concerns separated. There is no shared `common.css`.
- Styles are mostly modern, using gradients, shadows. The existing pages use hardcoded values; the new landing page introduces local CSS variables scoped to that file only for internal consistency (they do not affect other pages).
- Layouts use a mix of Flexbox and fixed positioning (e.g., `control-panel`, `header-title`, sidebar layout in `home.html`).

## 🔧 JS Organization
- The JS files are also split per page, which matches the CSS and HTML structure.
- The HTML templates load external libraries via CDN (Bootstrap, jQuery, Popper, Leaflet).
- Within templates, static assets are referenced via Flask's `url_for('static', filename='...')`, which implies the real production code lives in `static/` (not in `resources/`).
- The landing page has its own dedicated `landing.js` file, consistent with the per-page convention. It handles: search tag click → input population, Enter/button search redirect, IntersectionObserver scroll reveal for cards and steps, and navbar box-shadow on scroll.

## 🧭 Notes on Project Organization
- `resources/` acts as a "design kit" or prototype directory: it contains complete standalone HTML pages that mirror the app's front-end views.
- Real runtime static assets appear to be served from the `static/` folder (e.g., `static/css/index.css`, `static/js/index.js`). This suggests `resources/` might be used for development preview or as a source-to-static build reference.

## 📌 Suggestions (no changes made)
- If you intend for `resources/` to stay in sync with `static/`, consider an automated sync/copy step or a build script.
- A shared CSS file for common utilities (typography, buttons, layout helpers) could reduce duplication across `index.css`, `home.css`, `login.css`, and the new `landing.html`. In particular, the CSS variables introduced in `landing.html` (`--c-bg`, `--c-accent`, etc.) could form the seed of a future `common.css` design token file.
- The landing page is already split across three dedicated files (`landing.html`, `landing.css`, `landing.js`), fully consistent with the per-page file convention used throughout the project.

---

*Report updated after addition of `landing.html` homepage for stageMatch.*
# Secret Santa Exchange

A small static web project that includes an interactive frontend. It uses `index.html` with styles in `css/style.css` and JavaScript in `js/app.js` and `js/visuals.js`.

**Features**
- Lightweight static site — no build/tools required for basic usage.
- Interactive JavaScript visuals handled in `js/visuals.js`.
- Progressive Web App manifest available via `manifest.json` (optional PWA setup).
# Secret Santa Exchange

Secret Santa is a lightweight, client-side organizer for running a Secret Santa exchange. It's a static web app (HTML/CSS/JS) that runs entirely in the browser — no server required. Add participants, set exclusions, draw Secret Santa pairs, and reveal matches either in a list view or using a "pass the device" flow.

**Live features**
- Add participants one-by-one or bulk-import a list (one name per line).
- Prevent duplicate participants (case-insensitive checks).
- Manage pairwise exclusions (prevent specific giver → receiver matches).
- Deterministic pairing algorithm using backtracking to satisfy exclusions reliably (`js/pairing.js`).
- Two reveal modes: List view (cards) and Pass-Device mode (reveal one-by-one).
- Export results as JSON or CSV.
- Responsive layout and improved mobile UX with a fixed navbar and touch-friendly controls.
- Basic PWA support: `manifest.json` and a service worker for simple offline caching.
- Unit tests for pairing logic (Jest) and a `package.json` with convenience scripts.

**Project structure**
- `index.html` — App shell and UI.
- `css/style.css` — Styling and responsive rules.
- `js/app.js` — Main app logic, UI wiring, persistence, pagination.
- `js/pairing.js` — Deterministic backtracking pair generator.
- `js/visuals.js` — Vanta.js animated background (optional/visual).
- `manifest.json` — Web app manifest.
- `service-worker.js` — Simple cache for offline assets.
- `favicon.svg` — App icon (linked in `index.html`).

**Favicon**
This project now includes a working SVG favicon at `favicon.svg`. Browsers supporting SVG favicons will display it automatically; the file is linked in the page head (`<link rel="icon" href="/favicon.svg" type="image/svg+xml">`).

PWA icons: `manifest.json` now references the local `favicon.svg` for icons so the app doesn't depend on external icon URLs. If you prefer PNG icons for wider install compatibility (recommended for some mobile platforms), I can add `icons/192.png` and `icons/512.png` and update `manifest.json` to point to them.


**Notes & recommendations**
- For very large participant lists (hundreds+), the app now supports pagination in the Participants view. For even larger scales consider virtualization (render only visible rows) to improve performance.
- The PWA service worker uses a basic caching strategy; for production, refine cache versioning and asset strategies.


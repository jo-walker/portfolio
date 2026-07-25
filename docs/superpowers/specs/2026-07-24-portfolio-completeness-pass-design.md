# Portfolio Completeness Pass — Design

**Date:** 2026-07-24
**Status:** Approved (pending spec review)
**Scope:** Focused high-impact pass — one implementation plan.

## Goal

Make the Windows-9x desktop portfolio feel like a real booting OS that a recruiter
instantly "gets," and add the production polish that makes the link shareable. The
success moment: a visitor lands, immediately understands the metaphor, enjoys the
vibe, and can reach the résumé/contact within seconds.

Content is already strong (About, Projects + detail, Résumé, Contact, Recycle Bin);
this pass targets **immersion**, **production-readiness**, and **discoverability** —
not new portfolio content.

## Existing architecture (constraints to follow)

- Apps live in `src/apps/`, each with a co-located `*.test.tsx` (vitest +
  @testing-library/react, jsdom).
- Apps register in `src/apps/registry.tsx`: `WINDOW_DEFAULTS` (size/title/icon/
  singleton) and `APP_REGISTRY` (component factory). App keys are typed in
  `src/types.ts` (`AppKey`).
- Windows are opened/closed/focused via the reducer in
  `src/window-manager/reducer.ts`, consumed through `WindowManagerContext`.
- Styling uses `98.css` plus `src/index.css`.
- Vite `base` is `/portfolio/` (GitHub Pages project site). E2E via Playwright
  (`e2e/`), including a "boot" smoke test.
- New work follows TDD: pure logic unit-tested first, components tested via
  the existing testing-library pattern.

## Components

### 1. Boot sequence — `src/shell/BootScreen.tsx`

A brief Win9x-style boot shown on first load:
BIOS/POST-style text flash → "Starting Jo-DOS…" splash → desktop fades in.

- Boot phase state lives in `App.tsx` (e.g. `booting | desktop`).
- **Skippable**: any click or keypress dismisses it immediately.
- Shown **once per session** (sessionStorage flag `jo95:booted`).
- **Auto-skipped** when `prefers-reduced-motion: reduce` is set (renders desktop
  immediately).
- **Test env**: the existing Playwright "boot" smoke test must still pass. Provide a
  deterministic skip — e.g. honor a `?noboot=1` query param (or the reduced-motion
  media query) so E2E lands directly on the desktop. Update the smoke test if the
  selector/flow changes.

Testing: unit-test the "should we boot?" decision (session flag + reduced-motion +
query param) as a pure helper; component test that a click transitions to desktop.

### 2. Welcome window — new `welcome` app (singleton, auto-open)

A friendly intro window auto-opened right after boot on a visitor's **first visit**.

- First-visit gate: localStorage flag `jo95:welcomed`. Auto-opens once; afterward it
  only opens when launched manually (Start menu / desktop icon).
- Content: short "Welcome to my desktop" blurb + 3 CTA buttons that dispatch
  `openApp`: **View Résumé**, **Contact Me**, **Explore Projects**.
- Registered like other apps: `AppKey` gets `welcome`; entries in `WINDOW_DEFAULTS`
  and `APP_REGISTRY`; add a Start-menu entry.
- Auto-open is triggered after boot completes (in `App.tsx` or a small effect in the
  desktop shell), guarded by the first-visit flag, dispatching `openApp('welcome')`.

Testing: component renders CTAs; clicking a CTA dispatches the correct `openApp`;
first-visit gate logic unit-tested (opens when unset, not when set).

### 3. Terminal / Jo-DOS — new `terminal` app

A working fake command prompt branded "Jo-DOS."

- Commands: `help`, `about`, `projects`, `resume`, `contact`, `whoami`, `ls`,
  `clear`, plus 1–2 easter eggs (e.g. `sudo`, `dir`). Unknown command → friendly
  "Bad command or file name" line.
- Navigation commands (`about`, `projects`, `resume`, `contact`) dispatch `openApp`
  via the window-manager context.
- Architecture: a **pure** command interpreter — `runCommand(input, ctx)` returning
  `{ lines: string[]; action?: { type: 'openApp'; key: AppKey } | { type: 'clear' } }`.
  The component owns the scrollback log + input, calls the interpreter, applies the
  action. Keeps side effects out of the parser so it's fully unit-testable.
- Registered like other apps (`AppKey` gets `terminal`; defaults + registry +
  Start-menu / desktop entry).

Testing: table-driven unit tests over `runCommand` for every command incl. unknown
input and `clear`; component test that typing `about` + Enter opens the About window.

### 4. SEO + Open Graph + favicon — `index.html`, `public/`

- Add meta: description (present), Open Graph (`og:title`, `og:description`,
  `og:image`, `og:url`, `og:type`), Twitter card (`summary_large_image`), and
  `theme-color`.
- `og:url` uses the canonical GitHub Pages URL
  (`https://jo-walker.github.io/portfolio/`). Absolute `og:image` URL under the same
  base so scrapers can fetch it.
- Preview image: a themed 1200×630 PNG in `public/` (e.g. `og-image.png`) — desktop
  motif with name + title.
- Favicon: replace the Vite default with a retro monitor/desktop icon
  (`public/favicon.svg` or `.ico`), referenced from `index.html`.

Testing: no unit tests (static assets); verified in the E2E/build check and by
confirming tags render in the built `index.html`.

### 5. Custom 404 + draggable desktop icons

**404** — `public/404.html`:
- A themed "blue screen / this program has performed an illegal operation" page that
  reads as intentional.
- Doubles as the GitHub Pages SPA fallback (GitHub serves `404.html` for unknown
  paths under the project site). Includes a link back to the desktop
  (`/portfolio/`). Standalone HTML (no bundler), styled to match.

**Draggable icons** — `src/shell/DesktopIcon.tsx` / `Desktop.tsx`:
- Desktop icons become draggable via pointer events; positions persist to
  localStorage (`jo95:iconPositions`). Falls back to default grid layout when no
  saved positions exist.
- Must not interfere with double-click-to-open or window dragging.

Testing: unit-test the position persistence helper (load/save/merge with defaults);
component test that a pointer drag updates and persists position; existing
open-on-click behavior still passes.

## Out of scope (deferred to a possible comprehensive pass)

Startup sound, right-click context menus, BSOD-as-triggered-easter-egg,
additional apps (Minesweeper/Notepad/Paint), analytics, and a full accessibility/
performance audit.

## Risks / notes

- **Boot vs. E2E**: the boot screen sits in front of the desktop; the deterministic
  skip (query param / reduced-motion) is required so the existing Playwright boot
  test and any window tests aren't blocked.
- **Auto-open welcome vs. tests**: gate strictly on the localStorage flag so unit/E2E
  runs (fresh storage) get a predictable state; tests can pre-set the flag when they
  don't want the welcome window.
- **OG image caching**: social scrapers cache aggressively; final image URL must be
  stable before sharing.
- **localStorage keys**: namespace everything under `jo95:` to avoid collisions.

## Success criteria

- First load shows a skippable boot, then the desktop with the welcome window open
  (first visit only).
- Jo-DOS terminal runs all listed commands; navigation commands open the right
  windows; `clear` empties scrollback.
- Sharing the URL renders a proper preview card; a real favicon shows in the tab.
- Unknown paths render the themed 404 (and SPA deep links still resolve).
- Desktop icons drag and remember their positions across reloads.
- All existing + new vitest tests pass; Playwright smoke test passes.

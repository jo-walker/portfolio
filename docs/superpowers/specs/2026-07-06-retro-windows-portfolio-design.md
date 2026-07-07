# Design Spec — "Jo 95": A Bootable Desktop-OS Portfolio

**Date:** 2026-07-06
**Owner:** Jo Gurvantamir
**Status:** Approved for planning

---

## 1. Concept

A personal portfolio website styled as a bootable Windows 95 desktop. Visitors see a
boot sequence, land on a teal desktop, and explore Jo's work by opening draggable
windows: projects are folders, skills are disk drives, the résumé is a document. It is a
portfolio that doubles as a small, playable operating system.

**Purpose:** Job hunting (full-stack / frontend developer) *and* a fun personal site.
The site itself is a proof of frontend skill — a hand-built window manager in React/TS is
the exact competency Jo is hired for.

**Success criteria:**
- A recruiter can find Jo's projects, résumé (downloadable), and contact info within
  seconds — including on a phone.
- The desktop-OS interaction is memorable enough to be shared/remembered.
- Phase 1 is **live on a real URL** quickly, so it can go on applications immediately.
- The site loads fast and does not break on mobile.

---

## 2. Goals & Non-Goals

**Goals**
- Authentic Windows 95/98 aesthetic (teal desktop `#008080`, gray chrome `#c0c0c0`,
  beveled borders, MS Sans Serif).
- A real, hand-built window manager: open, close, minimize, maximize, drag, resize,
  focus/z-index, taskbar.
- Each "app" is an isolated, independently testable React component.
- Graceful, *designed* mobile behavior (not an afterthought).
- Phased delivery: a shippable MVP first, enhancements layered on live.

**Non-Goals**
- Not a pixel-perfect emulation of every Windows 95 behavior — fidelity serves the
  portfolio, not the reverse.
- No user accounts / auth (the guestbook is anonymous-write, public-read).
- The `bio.txt` file in the resume repo (home address, phone, ethnicity, disability/ADHD,
  equity data) is **out of scope and must never be read by any part of this project.**

---

## 3. Hard Privacy Constraints

These are non-negotiable and must be enforced in code and content review:

1. **Public contact surface = email + LinkedIn + GitHub only.** No phone number, no home
   address, no city.
   - Email displayed: `bsnlkhm@gmail.com`
   - LinkedIn: `https://linkedin.com/in/jo-tamir`
   - GitHub: `https://github.com/jo-walker`
2. **`bio.txt` is never a data source.** The About Me content is hand-written for this
   site. No build step, script, or import pulls from the resume repo's `bio.txt`.
3. Any equity/ethnicity/disability data stays entirely off the public site.

---

## 4. Architecture

### 4.1 Stack
- **React + TypeScript + Vite** (SPA).
- **98.css** for the Windows 95 chrome (styling foundation only).
- Hand-built **window manager** and all "apps" (the logic/behavior is Jo's own code).
- **Vercel** hosting, git-based deploys.
- **Guestbook backend (Phase 2):** a Vercel serverless function backed by **Vercel
  Postgres**. (Documented fallback: Supabase.)

### 4.2 Window manager (the core system)
A React context (`WindowManagerProvider`) owns all window state and exposes actions.

- **State:** a list of open windows, each `{ id, appKey, title, icon, x, y, w, h, z,
  minimized, maximized }`, plus `focusedId` and a monotonically increasing `zCounter`.
- **Reducer** (pure, unit-tested) handles: `OPEN`, `CLOSE`, `FOCUS`, `MINIMIZE`,
  `RESTORE`, `TOGGLE_MAXIMIZE`, `MOVE`, `RESIZE`.
- **`<Window>`** — the reusable chrome frame: title bar (icon + title + min/max/close),
  draggable by the title bar, resizable from the corner, raises z-index on
  mousedown. Renders its app component as children.
- **`<Desktop>`** — teal background, desktop icons (double-click → `OPEN`).
- **`<Taskbar>`** — Start button + Start menu, one button per open window (click to
  focus/restore, active state), live clock.
- **App registry** — a map from `appKey` → `{ component, defaultTitle, icon,
  defaultSize }`. Adding an app = one registry entry. This is the seam that keeps every
  app isolated and makes the system easy to extend across phases.

### 4.3 App component model
Each app is a self-contained component that receives its window id and renders its own
UI. It knows nothing about other apps or the window manager internals beyond the actions
it's handed. What each app does, how it's used, and what it depends on is answerable in
isolation.

### 4.4 Data
- **Static content** (projects, skills, about, résumé metadata) lives in typed data
  files (`src/data/*.ts`) — no CMS. Editing content = editing a typed object.
- **Résumé PDF** served as a static asset with a Download button.
- **Guestbook** (Phase 2): `GET /api/guestbook` (list) and `POST /api/guestbook`
  (add, with length limit + basic sanitization/rate-limit). Read-public, write-anonymous.

---

## 5. Content Map (Desktop → Apps)

| Desktop icon | App | Content |
|---|---|---|
| 👤 About Me | `AboutApp` | Hand-written WordPad-style bio: Algonquin CS diploma (3.9 GPA, Dean's List), Ideabytes/Neology toll-system full-stack work, ML/OCR internship, Hack the Hill 1st place, SyberPong game studio. |
| 📁 My Projects | `ProjectsApp` | Folder of project icons; each opens a `ProjectDetail` window (stack, highlights, links, screenshot). |
| 📄 Résumé | `ResumeApp` | Document viewer + **Download PDF**. |
| ✉️ Contact | `ContactApp` | Email + LinkedIn + GitHub (per §3). |
| 🖥️ My Computer | `MyComputerApp` | Skills as drives/specs: `C:\ Languages`, `D:\ Frameworks`, `E:\ DevOps/Cloud`, etc. |
| 🗑️ Recycle Bin | `RecycleBinApp` | Light joke — "abandoned side-projects". |
| ⊞ Start / Taskbar | system | Navigation, running windows, clock, "Shut Down". |

### 5.1 Featured projects
**Creative/personal:**
- **Parkopticon** — crowdsourced real-time street-parking + enforcement-alert mobile app; future edge-AI sentinel (mmWave radar, edge inference).
- **Raindropticon** — production workforce-management monorepo: NestJS + GraphQL + PostgreSQL/PostGIS + Prisma + Redis + MinIO; React 19 dashboard; React Native field app; Dockerized.
- **Put It Down** — desktop focus/distraction monitor: app-usage tracking + webcam head-pose estimation (OpenCV, MediaPipe), Tkinter dashboard (Python).
- **note-splicer** — notes → RAG knowledge base: ChromaDB vector store + LLM (litellm) (Python).
- **kaya-auto** — Autotrader-style vehicle marketplace (Node/Express, multi-role).

**Professional:**
- **Inventory Management System** — React/TS/Node/Express/MySQL: transaction-based stock, CODE128 barcode + thermal labels, vendor financials & landed-cost, fuzzy CSV import, reporting suite.
- **Project Management Repository** — Java/Hibernate/PostgreSQL: 25+ endpoint REST API, JWT refresh rotation, RBAC, index-tuned dashboards (3.2s → 0.8s).
- **Medical Education School Management** — Java EE/JPA: 76 endpoints, 100% test coverage.
- **E-commerce POS System** — Angular/Node/MySQL: back-office POS, full-text index tuning (−75% load).

---

## 6. Toys / Personality (Phase 2)

Each is an isolated app in the registry:
- **Boot sequence** — BIOS/loading screen → "Welcome" splash on first visit (skippable; remembered via localStorage).
- **MS-DOS Prompt** (`DosPrompt`) — working command line: `help`, `whoami`, `projects`, `ls`, `open <app>`, `cls`.
- **Minesweeper** (`Minesweeper`) — playable; pure board logic unit-tested.
- **Clippy assistant** — context tips as the user explores.
- **Winamp-style player** — chiptune loop + simple visualizer.
- **BSOD easter egg** — hidden trigger → harmless fake blue screen → recovers.
- **Guestbook** (Notepad) — shared, persistent; serverless + Vercel Postgres.

---

## 7. Mobile Behavior (designed, not degraded)

On viewports below a breakpoint (~768px):
- Windows open **maximized and full-screen stacked** — no dragging or free resize.
- The **taskbar becomes an app switcher**; tapping a taskbar item brings that app to
  front; close returns to the desktop.
- Desktop icons remain tap-to-open.
- Boot splash still plays (shortened).

This is a real, tested layout mode — recruiters will open the site on phones.

---

## 8. Error Handling
- **Guestbook API failures** → in-window error state ("Couldn't reach the server —
  try again"), never a broken UI; input preserved.
- **Missing/oversized guestbook input** → validated client + server; server enforces
  length limit and basic sanitization.
- **Unknown DOS command** → friendly `'<cmd>' is not recognized…` message.
- **Résumé PDF fails to load** → fallback download link.
- **Window manager** is pure/deterministic; invalid actions are no-ops.

---

## 9. Testing Strategy
- **Unit (Vitest):** window-manager reducer (all actions + edge cases), Minesweeper
  board logic, DOS command parser, guestbook input validation.
- **API:** guestbook `GET`/`POST` — happy path, validation failure, oversize input.
- **E2E (Playwright smoke):** boot → desktop renders → open a window → drag it →
  close it; mobile viewport → window opens maximized.
- Content data files are typed, so broken references fail at compile time.

---

## 10. Deployment
- Vercel project connected to the git repo; preview deploys per branch, production on
  `main`/`master`.
- Phase 1 ships as a static SPA (no backend needed).
- Phase 2 adds the `/api/guestbook` serverless function + Vercel Postgres.
- Custom domain optional/later.

---

## 11. Phasing (delivery order)

**Phase 1 — MVP (ship this live first):**
1. Vite + React + TS + 98.css scaffold; deploy an empty shell to Vercel.
2. Window manager (context, reducer, `<Window>`, drag/resize/focus).
3. `<Desktop>` + icons; `<Taskbar>` + Start menu + clock.
4. Core apps: About Me, My Projects (+ project detail), Résumé (+ PDF download), Contact.
5. Recycle Bin.
6. Mobile maximized-stack mode.
7. Unit tests for the reducer + Playwright smoke test. **Launch.**

**Phase 2 — Toys (layered on the live site):**
Boot sequence → My Computer (skills) → MS-DOS Prompt → Minesweeper → Winamp → Clippy →
BSOD easter egg → Guestbook (serverless + Postgres). Each ships independently.

---

## 12. Open Items to Confirm During Implementation
- Vercel Postgres vs Supabase for the guestbook (Phase 2 — either works; decide when
  building it).
- Project screenshots: gather real images, else use tasteful placeholders.
- Final résumé PDF file to bundle (from the resume repo).

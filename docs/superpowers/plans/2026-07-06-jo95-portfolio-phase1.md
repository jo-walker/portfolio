# Jo 95 Portfolio — Phase 1 (MVP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a live Windows 95-styled desktop portfolio with a hand-built React/TS window manager and four core apps (About, Projects, Résumé, Contact) + Recycle Bin, working on desktop and mobile.

**Architecture:** A React SPA where a pure reducer owns all window state (open/close/focus/minimize/maximize/move/resize). A `WindowManagerProvider` exposes that state via context; a `<Desktop>` renders icons + open `<Window>` frames; a `<Taskbar>` shows running windows + Start menu + clock. Each "app" is an isolated component mounted from a registry. On phones, windows render maximized-and-stacked with the taskbar acting as an app switcher.

**Tech Stack:** Vite + React 19 + TypeScript, 98.css (chrome styling), Vitest + Testing Library (unit/component), Playwright (e2e smoke), Vercel (hosting).

---

## File Structure

```
portfolio_ib_windows/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts
├── vercel.json
├── public/
│   └── resume.pdf                       # copied from the resume repo
├── src/
│   ├── main.tsx                         # React entry; imports 98.css
│   ├── App.tsx                          # mounts WindowManagerProvider + Desktop + Taskbar
│   ├── index.css                        # desktop/taskbar/mobile global styles
│   ├── test-setup.ts                    # jest-dom matchers
│   ├── types.ts                         # WindowState, WMState, WMAction, AppKey
│   ├── window-manager/
│   │   ├── reducer.ts                   # pure reducer + initial state (unit-tested)
│   │   ├── reducer.test.ts
│   │   ├── WindowManagerContext.tsx     # context, provider, useWindowManager hook
│   │   ├── useMediaQuery.ts             # useIsMobile()
│   │   └── Window.tsx                   # chrome frame: title bar, drag, resize, buttons
│   ├── shell/
│   │   ├── Desktop.tsx                  # teal bg, desktop icons, renders open windows
│   │   ├── DesktopIcon.tsx              # single double-clickable icon
│   │   ├── Taskbar.tsx                  # start button, window buttons, clock
│   │   ├── StartMenu.tsx                # start menu list
│   │   └── Clock.tsx                    # live HH:MM clock
│   ├── apps/
│   │   ├── registry.tsx                 # AppKey -> { component, title, icon, size, singleton }
│   │   ├── AboutApp.tsx
│   │   ├── ProjectsApp.tsx              # folder of project icons -> opens ProjectDetail
│   │   ├── ProjectDetail.tsx            # one project's detail view
│   │   ├── ResumeApp.tsx                # PDF viewer + download
│   │   ├── ContactApp.tsx
│   │   └── RecycleBinApp.tsx
│   └── data/
│       ├── about.ts                     # hand-written bio (NEVER from bio.txt)
│       ├── projects.ts                  # typed project list
│       └── contact.ts                   # email + linkedin + github ONLY
└── e2e/
    └── smoke.spec.ts                    # boot -> open -> drag -> close; mobile maximize
```

**Privacy rule (enforced in Task 8 & 11):** the public contact surface is email + LinkedIn + GitHub only. No phone, no address. The resume repo's `bio.txt` is never read by any file here.

---

## Task 0: Project scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/test-setup.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "jo95-portfolio",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  },
  "dependencies": {
    "98.css": "^0.1.20",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.1",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "typescript": "^5.7.2",
    "vite": "^6.0.5",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
});
```

- [ ] **Step 4: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Jo Gurvantamir — Portfolio</title>
    <meta name="description" content="Jo Gurvantamir — full-stack developer. A Windows 95-style desktop portfolio." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `src/test-setup.ts`**

```ts
import '@testing-library/jest-dom';

// jsdom doesn't implement matchMedia; stub it so useMediaQuery/useIsMobile work in tests.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
```

> Note: Task 0 was executed before this stub was added, so the running repo's `test-setup.ts` is updated in Task 4 (the first task whose tests render `Desktop`/`useIsMobile`).

- [ ] **Step 6: Create `src/index.css`** (desktop shell styles; extended in later tasks)

```css
:root {
  --desktop-teal: #008080;
  --taskbar-h: 32px;
}

html, body, #root {
  margin: 0;
  height: 100%;
  overflow: hidden;
  font-family: 'Pixelated MS Sans Serif', 'MS Sans Serif', Tahoma, sans-serif;
}

.desktop {
  position: fixed;
  inset: 0 0 var(--taskbar-h) 0;
  background: var(--desktop-teal);
  overflow: hidden;
}

.window {
  position: absolute;
  display: flex;
  flex-direction: column;
}

.window .window-body {
  flex: 1;
  overflow: auto;
  margin: 0;
}

.title-bar { cursor: default; }
.title-bar-text { user-select: none; }
```

- [ ] **Step 7: Create `src/App.tsx`** (temporary placeholder, replaced in Task 6)

```tsx
export function App() {
  return <div className="desktop" />;
}
```

- [ ] **Step 8: Create `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '98.css';
import './index.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 9: Install dependencies**

Run: `npm install`
Expected: dependencies install with no errors; `node_modules/` created.

- [ ] **Step 10: Verify dev build compiles**

Run: `npm run build`
Expected: `tsc` passes and Vite writes `dist/` with no errors.

- [ ] **Step 11: Commit**

```bash
git add package.json tsconfig.json vite.config.ts index.html src/ package-lock.json
git commit -m "chore: scaffold Vite + React + TS + 98.css"
```

---

## Task 1: Types + window-manager reducer (TDD)

**Files:**
- Create: `src/types.ts`
- Create: `src/window-manager/reducer.ts`
- Test: `src/window-manager/reducer.test.ts`

- [ ] **Step 1: Create `src/types.ts`**

```ts
export type AppKey =
  | 'about'
  | 'projects'
  | 'projectDetail'
  | 'resume'
  | 'contact'
  | 'recycleBin';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  appKey: AppKey;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  prev?: Rect;                      // rect saved before maximize
  props?: Record<string, unknown>; // e.g. projectDetail: { projectId }
}

export interface WMState {
  windows: WindowState[];
  focusedId: string | null;
  zCounter: number;
  nextId: number;
}

export type WMAction =
  | { type: 'OPEN'; appKey: AppKey; title: string; icon: string; width: number; height: number; singleton?: boolean; props?: Record<string, unknown> }
  | { type: 'CLOSE'; id: string }
  | { type: 'FOCUS'; id: string }
  | { type: 'MINIMIZE'; id: string }
  | { type: 'TOGGLE_MAXIMIZE'; id: string }
  | { type: 'MOVE'; id: string; x: number; y: number }
  | { type: 'RESIZE'; id: string; width: number; height: number };
```

- [ ] **Step 2: Write the failing test `src/window-manager/reducer.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { wmReducer, initialWMState } from './reducer';
import type { AppKey } from '../types';

// appKey is annotated AppKey (not left to widen to `string`) so the returned
// action is assignable to WMAction under `tsc -b`.
const open = (appKey: AppKey = 'about', extra = {}) =>
  ({ type: 'OPEN', appKey, title: 'T', icon: '👤', width: 400, height: 300, ...extra }) as const;

describe('wmReducer', () => {
  it('OPEN adds a focused window with id win-1 and z 1', () => {
    const s = wmReducer(initialWMState, open());
    expect(s.windows).toHaveLength(1);
    expect(s.windows[0].id).toBe('win-1');
    expect(s.windows[0].z).toBe(1);
    expect(s.windows[0].minimized).toBe(false);
    expect(s.focusedId).toBe('win-1');
  });

  it('OPEN twice creates two windows and focuses the second (higher z)', () => {
    let s = wmReducer(initialWMState, open());
    s = wmReducer(s, open('contact'));
    expect(s.windows).toHaveLength(2);
    expect(s.focusedId).toBe('win-2');
    expect(s.windows[1].z).toBeGreaterThan(s.windows[0].z);
  });

  it('OPEN singleton focuses the existing window instead of duplicating', () => {
    let s = wmReducer(initialWMState, open('about', { singleton: true }));
    s = wmReducer(s, open('about', { singleton: true }));
    expect(s.windows).toHaveLength(1);
    expect(s.focusedId).toBe('win-1');
  });

  it('FOCUS raises z and restores a minimized window', () => {
    let s = wmReducer(initialWMState, open());
    s = wmReducer(s, open('contact'));
    s = wmReducer(s, { type: 'MINIMIZE', id: 'win-1' });
    expect(s.windows.find((w) => w.id === 'win-1')!.minimized).toBe(true);
    s = wmReducer(s, { type: 'FOCUS', id: 'win-1' });
    const w1 = s.windows.find((w) => w.id === 'win-1')!;
    const w2 = s.windows.find((w) => w.id === 'win-2')!;
    expect(w1.minimized).toBe(false);
    expect(s.focusedId).toBe('win-1');
    expect(w1.z).toBeGreaterThan(w2.z);
  });

  it('MINIMIZE moves focus to the top remaining visible window', () => {
    let s = wmReducer(initialWMState, open());
    s = wmReducer(s, open('contact'));
    s = wmReducer(s, { type: 'MINIMIZE', id: 'win-2' });
    expect(s.focusedId).toBe('win-1');
  });

  it('TOGGLE_MAXIMIZE saves and restores the previous rect', () => {
    let s = wmReducer(initialWMState, open());
    const before = { ...s.windows[0] };
    s = wmReducer(s, { type: 'TOGGLE_MAXIMIZE', id: 'win-1' });
    expect(s.windows[0].maximized).toBe(true);
    s = wmReducer(s, { type: 'TOGGLE_MAXIMIZE', id: 'win-1' });
    expect(s.windows[0].maximized).toBe(false);
    expect(s.windows[0].x).toBe(before.x);
    expect(s.windows[0].width).toBe(before.width);
  });

  it('MOVE updates position but is ignored while maximized', () => {
    let s = wmReducer(initialWMState, open());
    s = wmReducer(s, { type: 'MOVE', id: 'win-1', x: 200, y: 150 });
    expect(s.windows[0].x).toBe(200);
    s = wmReducer(s, { type: 'TOGGLE_MAXIMIZE', id: 'win-1' });
    s = wmReducer(s, { type: 'MOVE', id: 'win-1', x: 999, y: 999 });
    expect(s.windows[0].x).not.toBe(999);
  });

  it('RESIZE clamps to minimum dimensions', () => {
    let s = wmReducer(initialWMState, open());
    s = wmReducer(s, { type: 'RESIZE', id: 'win-1', width: 10, height: 10 });
    expect(s.windows[0].width).toBe(160);
    expect(s.windows[0].height).toBe(120);
  });

  it('CLOSE removes the window and refocuses the top remaining', () => {
    let s = wmReducer(initialWMState, open());
    s = wmReducer(s, open('contact'));
    s = wmReducer(s, { type: 'CLOSE', id: 'win-2' });
    expect(s.windows).toHaveLength(1);
    expect(s.focusedId).toBe('win-1');
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- reducer`
Expected: FAIL — `Failed to resolve import './reducer'` / `wmReducer is not defined`.

- [ ] **Step 4: Implement `src/window-manager/reducer.ts`**

```ts
import type { WMState, WMAction, WindowState } from '../types';

export const initialWMState: WMState = {
  windows: [],
  focusedId: null,
  zCounter: 0,
  nextId: 1,
};

function topWindowId(windows: WindowState[]): string | null {
  if (windows.length === 0) return null;
  return windows.reduce((top, w) => (w.z > top.z ? w : top)).id;
}

function focusWindow(state: WMState, id: string): WMState {
  if (!state.windows.some((w) => w.id === id)) return state;
  const z = state.zCounter + 1;
  const windows = state.windows.map((w) =>
    w.id === id ? { ...w, z, minimized: false } : w,
  );
  return { ...state, windows, focusedId: id, zCounter: z };
}

export function wmReducer(state: WMState, action: WMAction): WMState {
  switch (action.type) {
    case 'OPEN': {
      if (action.singleton) {
        const existing = state.windows.find((w) => w.appKey === action.appKey);
        if (existing) return focusWindow(state, existing.id);
      }
      const id = `win-${state.nextId}`;
      const z = state.zCounter + 1;
      const offset = ((state.nextId - 1) % 6) * 24;
      const win: WindowState = {
        id,
        appKey: action.appKey,
        title: action.title,
        icon: action.icon,
        x: 80 + offset,
        y: 60 + offset,
        width: action.width,
        height: action.height,
        z,
        minimized: false,
        maximized: false,
        props: action.props,
      };
      return {
        ...state,
        windows: [...state.windows, win],
        focusedId: id,
        zCounter: z,
        nextId: state.nextId + 1,
      };
    }
    case 'CLOSE': {
      const windows = state.windows.filter((w) => w.id !== action.id);
      const focusedId =
        state.focusedId === action.id ? topWindowId(windows.filter((w) => !w.minimized)) : state.focusedId;
      return { ...state, windows, focusedId };
    }
    case 'FOCUS':
      return focusWindow(state, action.id);
    case 'MINIMIZE': {
      const windows = state.windows.map((w) =>
        w.id === action.id ? { ...w, minimized: true } : w,
      );
      const focusedId =
        state.focusedId === action.id
          ? topWindowId(windows.filter((w) => !w.minimized))
          : state.focusedId;
      return { ...state, windows, focusedId };
    }
    case 'TOGGLE_MAXIMIZE': {
      const windows = state.windows.map((w) => {
        if (w.id !== action.id) return w;
        if (w.maximized) {
          const prev = w.prev ?? { x: w.x, y: w.y, width: w.width, height: w.height };
          return { ...w, maximized: false, ...prev, prev: undefined };
        }
        return { ...w, maximized: true, prev: { x: w.x, y: w.y, width: w.width, height: w.height } };
      });
      return { ...state, windows };
    }
    case 'MOVE': {
      const windows = state.windows.map((w) =>
        w.id === action.id && !w.maximized ? { ...w, x: action.x, y: action.y } : w,
      );
      return { ...state, windows };
    }
    case 'RESIZE': {
      const windows = state.windows.map((w) =>
        w.id === action.id && !w.maximized
          ? { ...w, width: Math.max(160, action.width), height: Math.max(120, action.height) }
          : w,
      );
      return { ...state, windows };
    }
    default:
      return state;
  }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- reducer`
Expected: PASS — all reducer tests green.

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/window-manager/reducer.ts src/window-manager/reducer.test.ts
git commit -m "feat: window-manager reducer with full test coverage"
```

---

## Task 2: WindowManager context + provider + hook

**Files:**
- Create: `src/window-manager/WindowManagerContext.tsx`
- Test: `src/window-manager/WindowManagerContext.test.tsx`

- [ ] **Step 1: Write the failing test `src/window-manager/WindowManagerContext.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { WindowManagerProvider, useWindowManager } from './WindowManagerContext';

function Probe() {
  const wm = useWindowManager();
  return (
    <div>
      <button onClick={() => wm.openApp('about')}>open</button>
      <span data-testid="count">{wm.state.windows.length}</span>
      <span data-testid="focused">{wm.state.focusedId ?? 'none'}</span>
    </div>
  );
}

describe('WindowManagerProvider', () => {
  it('openApp adds a window from the registry and focuses it', () => {
    render(
      <WindowManagerProvider>
        <Probe />
      </WindowManagerProvider>,
    );
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    act(() => {
      screen.getByText('open').click();
    });
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('focused')).toHaveTextContent('win-1');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- WindowManagerContext`
Expected: FAIL — cannot resolve `./WindowManagerContext`.

- [ ] **Step 3: Implement `src/window-manager/WindowManagerContext.tsx`**

Note: `openApp` reads window defaults (title/icon/size/singleton) from the app registry (Task 6). To avoid a circular import, the registry is imported lazily via a setter the registry calls on load. For now define a minimal default map inline; Task 6 replaces `WINDOW_DEFAULTS` import.

```tsx
import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { AppKey, WMState } from '../types';
import { wmReducer, initialWMState } from './reducer';
import { WINDOW_DEFAULTS } from '../apps/registry';

interface WindowManagerValue {
  state: WMState;
  openApp: (appKey: AppKey, props?: Record<string, unknown>, titleOverride?: string) => void;
  close: (id: string) => void;
  focus: (id: string) => void;
  minimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  resize: (id: string, width: number, height: number) => void;
}

const WindowManagerContext = createContext<WindowManagerValue | null>(null);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wmReducer, initialWMState);

  const openApp = useCallback(
    (appKey: AppKey, props?: Record<string, unknown>, titleOverride?: string) => {
      const def = WINDOW_DEFAULTS[appKey];
      dispatch({
        type: 'OPEN',
        appKey,
        title: titleOverride ?? def.title,
        icon: def.icon,
        width: def.width,
        height: def.height,
        singleton: def.singleton,
        props,
      });
    },
    [],
  );

  const close = useCallback((id: string) => dispatch({ type: 'CLOSE', id }), []);
  const focus = useCallback((id: string) => dispatch({ type: 'FOCUS', id }), []);
  const minimize = useCallback((id: string) => dispatch({ type: 'MINIMIZE', id }), []);
  const toggleMaximize = useCallback((id: string) => dispatch({ type: 'TOGGLE_MAXIMIZE', id }), []);
  const move = useCallback((id: string, x: number, y: number) => dispatch({ type: 'MOVE', id, x, y }), []);
  const resize = useCallback(
    (id: string, width: number, height: number) => dispatch({ type: 'RESIZE', id, width, height }),
    [],
  );

  return (
    <WindowManagerContext.Provider
      value={{ state, openApp, close, focus, minimize, toggleMaximize, move, resize }}
    >
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager(): WindowManagerValue {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error('useWindowManager must be used within WindowManagerProvider');
  return ctx;
}
```

- [ ] **Step 4: Create a minimal `src/apps/registry.tsx` so the import resolves** (fully populated in Task 6)

```tsx
import type { AppKey } from '../types';

export interface AppDef {
  title: string;
  icon: string;
  width: number;
  height: number;
  singleton?: boolean;
}

export const WINDOW_DEFAULTS: Record<AppKey, AppDef> = {
  about: { title: 'About Me', icon: '👤', width: 460, height: 360, singleton: true },
  projects: { title: 'My Projects', icon: '📁', width: 520, height: 400, singleton: true },
  projectDetail: { title: 'Project', icon: '📄', width: 480, height: 420 },
  resume: { title: 'Résumé', icon: '📄', width: 560, height: 620, singleton: true },
  contact: { title: 'Contact', icon: '✉️', width: 380, height: 300, singleton: true },
  recycleBin: { title: 'Recycle Bin', icon: '🗑️', width: 420, height: 300, singleton: true },
};
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- WindowManagerContext`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/window-manager/WindowManagerContext.tsx src/window-manager/WindowManagerContext.test.tsx src/apps/registry.tsx
git commit -m "feat: window manager context, provider, and hook"
```

---

## Task 3: Window chrome (drag, resize, controls)

**Files:**
- Create: `src/window-manager/useMediaQuery.ts`
- Create: `src/window-manager/Window.tsx`
- Test: `src/window-manager/Window.test.tsx`

- [ ] **Step 1: Create `src/window-manager/useMediaQuery.ts`**

```ts
import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
```

- [ ] **Step 2: Write the failing test `src/window-manager/Window.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Window } from './Window';
import type { WindowState } from '../types';

const win: WindowState = {
  id: 'win-1', appKey: 'about', title: 'About Me', icon: '👤',
  x: 40, y: 40, width: 400, height: 300, z: 1, minimized: false, maximized: false,
};

function setup() {
  const handlers = { onClose: vi.fn(), onMinimize: vi.fn(), onToggleMaximize: vi.fn(), onFocus: vi.fn(), onMove: vi.fn(), onResize: vi.fn() };
  render(
    <Window win={win} focused isMobile={false} {...handlers}>
      <p>Body content</p>
    </Window>,
  );
  return handlers;
}

describe('Window', () => {
  it('renders the title and body', () => {
    setup();
    // title renders as "👤 About Me", so match a substring, not an exact string
    expect(screen.getByText(/About Me/)).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('close button calls onClose', async () => {
    const h = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(h.onClose).toHaveBeenCalledWith('win-1');
  });

  it('minimize button calls onMinimize', async () => {
    const h = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Minimize' }));
    expect(h.onMinimize).toHaveBeenCalledWith('win-1');
  });

  it('maximize button calls onToggleMaximize', async () => {
    const h = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Maximize' }));
    expect(h.onToggleMaximize).toHaveBeenCalledWith('win-1');
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- Window`
Expected: FAIL — cannot resolve `./Window`.

- [ ] **Step 4: Implement `src/window-manager/Window.tsx`**

```tsx
import { useRef, type ReactNode, type PointerEvent, type CSSProperties } from 'react';
import type { WindowState } from '../types';

interface WindowProps {
  win: WindowState;
  focused: boolean;
  isMobile: boolean;
  children: ReactNode;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onToggleMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
}

export function Window(props: WindowProps) {
  const { win, focused, isMobile, children, onClose, onMinimize, onToggleMaximize, onFocus, onMove, onResize } = props;
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const resizeRef = useRef<{ sx: number; sy: number; sw: number; sh: number } | null>(null);

  // On mobile (or maximized) the window fills the desktop area; no drag/resize.
  const fill = isMobile || win.maximized;
  const style: CSSProperties = fill
    ? { position: 'absolute', inset: 0, width: 'auto', height: 'auto', zIndex: win.z }
    : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.z };

  const startDrag = (e: PointerEvent) => {
    if (fill) return;
    onFocus(win.id);
    drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onDragMove = (e: PointerEvent) => {
    if (!drag.current) return;
    onMove(win.id, e.clientX - drag.current.dx, e.clientY - drag.current.dy);
  };
  const endDrag = (e: PointerEvent) => {
    drag.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const startResize = (e: PointerEvent) => {
    e.stopPropagation();
    onFocus(win.id);
    resizeRef.current = { sx: e.clientX, sy: e.clientY, sw: win.width, sh: win.height };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onResizeMove = (e: PointerEvent) => {
    const r = resizeRef.current;
    if (!r) return;
    onResize(win.id, r.sw + (e.clientX - r.sx), r.sh + (e.clientY - r.sy));
  };
  const endResize = (e: PointerEvent) => {
    resizeRef.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      className="window"
      style={style}
      onPointerDown={() => onFocus(win.id)}
      role="dialog"
      aria-label={win.title}
    >
      <div
        className={`title-bar${focused ? '' : ' inactive'}`}
        onPointerDown={startDrag}
        onPointerMove={onDragMove}
        onPointerUp={endDrag}
        onDoubleClick={() => onToggleMaximize(win.id)}
      >
        <div className="title-bar-text">{win.icon} {win.title}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={() => onMinimize(win.id)} />
          <button aria-label="Maximize" onClick={() => onToggleMaximize(win.id)} />
          <button aria-label="Close" onClick={() => onClose(win.id)} />
        </div>
      </div>
      <div className="window-body">{children}</div>
      {!fill && (
        <div
          className="resize-handle"
          onPointerDown={startResize}
          onPointerMove={onResizeMove}
          onPointerUp={endResize}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 5: Add resize-handle styles to `src/index.css`**

```css
.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 14px;
  height: 14px;
  cursor: nwse-resize;
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- Window`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/window-manager/Window.tsx src/window-manager/useMediaQuery.ts src/window-manager/Window.test.tsx src/index.css
git commit -m "feat: draggable/resizable window chrome with controls"
```

---

## Task 4: Desktop + desktop icons

**Files:**
- Create: `src/shell/DesktopIcon.tsx`
- Create: `src/shell/Desktop.tsx`
- Test: `src/shell/Desktop.test.tsx`

- [ ] **Step 1: Create `src/shell/DesktopIcon.tsx`**

```tsx
interface DesktopIconProps {
  icon: string;
  label: string;
  onOpen: () => void;
}

export function DesktopIcon({ icon, label, onOpen }: DesktopIconProps) {
  return (
    <button
      className="desktop-icon"
      onDoubleClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen();
      }}
    >
      <span className="desktop-icon-glyph" aria-hidden>{icon}</span>
      <span className="desktop-icon-label">{label}</span>
    </button>
  );
}
```

- [ ] **Step 2: Write the failing test `src/shell/Desktop.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WindowManagerProvider } from '../window-manager/WindowManagerContext';
import { Desktop } from './Desktop';

describe('Desktop', () => {
  it('renders all core desktop icons', () => {
    render(<WindowManagerProvider><Desktop /></WindowManagerProvider>);
    ['About Me', 'My Projects', 'Résumé', 'Contact', 'Recycle Bin'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('double-clicking an icon opens its window', async () => {
    render(<WindowManagerProvider><Desktop /></WindowManagerProvider>);
    await userEvent.dblClick(screen.getByText('About Me'));
    expect(screen.getByRole('dialog', { name: 'About Me' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- Desktop`
Expected: FAIL — cannot resolve `./Desktop`.

- [ ] **Step 4: Implement `src/shell/Desktop.tsx`**

```tsx
import type { AppKey } from '../types';
import { useWindowManager } from '../window-manager/WindowManagerContext';
import { useIsMobile } from '../window-manager/useMediaQuery';
import { Window } from '../window-manager/Window';
import { DesktopIcon } from './DesktopIcon';
import { APP_REGISTRY, WINDOW_DEFAULTS } from '../apps/registry';

const DESKTOP_ICONS: AppKey[] = ['about', 'projects', 'resume', 'contact', 'recycleBin'];

export function Desktop() {
  const wm = useWindowManager();
  const isMobile = useIsMobile();
  const { state } = wm;

  return (
    <div className="desktop">
      <div className="desktop-icons">
        {DESKTOP_ICONS.map((key) => (
          <DesktopIcon
            key={key}
            icon={WINDOW_DEFAULTS[key].icon}
            label={WINDOW_DEFAULTS[key].title}
            onOpen={() => wm.openApp(key)}
          />
        ))}
      </div>

      {state.windows
        .filter((w) => !w.minimized)
        .filter((w) => !isMobile || w.id === state.focusedId)
        .map((w) => {
          const AppComponent = APP_REGISTRY[w.appKey];
          return (
            <Window
              key={w.id}
              win={w}
              focused={w.id === state.focusedId}
              isMobile={isMobile}
              onClose={wm.close}
              onMinimize={wm.minimize}
              onToggleMaximize={wm.toggleMaximize}
              onFocus={wm.focus}
              onMove={wm.move}
              onResize={wm.resize}
            >
              <AppComponent win={w} />
            </Window>
          );
        })}
    </div>
  );
}
```

- [ ] **Step 5: Extend `src/apps/registry.tsx`** — add the component map (uses placeholder apps until Tasks 8–12; each app is a component taking `{ win }`).

```tsx
import type { ReactNode } from 'react';
import type { AppKey, WindowState } from '../types';

export interface AppDef {
  title: string;
  icon: string;
  width: number;
  height: number;
  singleton?: boolean;
}

export const WINDOW_DEFAULTS: Record<AppKey, AppDef> = {
  about: { title: 'About Me', icon: '👤', width: 460, height: 360, singleton: true },
  projects: { title: 'My Projects', icon: '📁', width: 520, height: 400, singleton: true },
  projectDetail: { title: 'Project', icon: '📄', width: 480, height: 420 },
  resume: { title: 'Résumé', icon: '📄', width: 560, height: 620, singleton: true },
  contact: { title: 'Contact', icon: '✉️', width: 380, height: 300, singleton: true },
  recycleBin: { title: 'Recycle Bin', icon: '🗑️', width: 420, height: 300, singleton: true },
};

export type AppComponent = (props: { win: WindowState }) => ReactNode;

const Placeholder =
  (label: string): AppComponent =>
  () => <p style={{ padding: 8 }}>{label} — coming soon.</p>;

// Replaced with real components in Tasks 8–12.
export const APP_REGISTRY: Record<AppKey, AppComponent> = {
  about: Placeholder('About'),
  projects: Placeholder('Projects'),
  projectDetail: Placeholder('Project'),
  resume: Placeholder('Résumé'),
  contact: Placeholder('Contact'),
  recycleBin: Placeholder('Recycle Bin'),
};
```

- [ ] **Step 6: Add desktop icon styles to `src/index.css`**

```css
.desktop-icons {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 18px;
  padding: 12px;
  height: 100%;
  align-content: flex-start;
}
.desktop-icon {
  width: 76px;
  background: transparent;
  border: 1px solid transparent;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: default;
  color: #fff;
  padding: 4px;
}
.desktop-icon:active,
.desktop-icon:focus { border: 1px dotted #fff; background: rgba(0,0,120,0.35); outline: none; }
.desktop-icon-glyph { font-size: 30px; text-shadow: 1px 1px 0 rgba(0,0,0,.4); }
.desktop-icon-label { font-size: 12px; text-align: center; text-shadow: 1px 1px 0 rgba(0,0,0,.5); }
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test -- Desktop`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/shell/Desktop.tsx src/shell/DesktopIcon.tsx src/shell/Desktop.test.tsx src/apps/registry.tsx src/index.css
git commit -m "feat: desktop with icons that open app windows"
```

---

## Task 5: Taskbar + Start menu + clock

**Files:**
- Create: `src/shell/Clock.tsx`
- Create: `src/shell/StartMenu.tsx`
- Create: `src/shell/Taskbar.tsx`
- Test: `src/shell/Taskbar.test.tsx`

- [ ] **Step 1: Create `src/shell/Clock.tsx`**

```tsx
import { useEffect, useState } from 'react';

function formatTime(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);
  return <div className="clock" aria-label="clock">🔊 {formatTime(now)}</div>;
}
```

- [ ] **Step 2: Create `src/shell/StartMenu.tsx`**

```tsx
import type { AppKey } from '../types';
import { contact } from '../data/contact';

interface StartMenuProps {
  onOpen: (key: AppKey) => void;
  onClose: () => void;
}

const ITEMS: { key: AppKey; label: string }[] = [
  { key: 'about', label: '👤 About Jo' },
  { key: 'projects', label: '📁 Projects' },
  { key: 'resume', label: '📄 Résumé' },
  { key: 'contact', label: '✉️ Contact' },
];

export function StartMenu({ onOpen, onClose }: StartMenuProps) {
  return (
    <div className="start-menu" role="menu">
      <div className="start-menu-banner">Jo 95</div>
      <ul>
        {ITEMS.map((it) => (
          <li key={it.key}>
            <button role="menuitem" onClick={() => { onOpen(it.key); onClose(); }}>{it.label}</button>
          </li>
        ))}
        <li className="start-menu-sep" />
        <li>
          <a role="menuitem" href={contact.github} target="_blank" rel="noreferrer" onClick={onClose}>🌐 GitHub</a>
        </li>
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: Write the failing test `src/shell/Taskbar.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WindowManagerProvider } from '../window-manager/WindowManagerContext';
import { Desktop } from './Desktop';
import { Taskbar } from './Taskbar';

function App() {
  return (
    <WindowManagerProvider>
      <Desktop />
      <Taskbar />
    </WindowManagerProvider>
  );
}

describe('Taskbar', () => {
  it('shows the Start button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('opening a window adds a taskbar button for it', async () => {
    render(<App />);
    await userEvent.dblClick(screen.getByText('About Me'));
    // scope to the taskbar so we don't match the desktop icon of the same name
    const taskbar = screen.getByRole('toolbar', { name: 'Taskbar' });
    expect(within(taskbar).getByRole('button', { name: /About Me/ })).toBeInTheDocument();
  });

  it('Start button toggles the start menu', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /start/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npm test -- Taskbar`
Expected: FAIL — cannot resolve `./Taskbar`.

- [ ] **Step 5: Implement `src/shell/Taskbar.tsx`**

```tsx
import { useState } from 'react';
import { useWindowManager } from '../window-manager/WindowManagerContext';
import { StartMenu } from './StartMenu';
import { Clock } from './Clock';

export function Taskbar() {
  const wm = useWindowManager();
  const [menuOpen, setMenuOpen] = useState(false);
  const { state } = wm;

  const onTaskClick = (id: string) => {
    const w = state.windows.find((x) => x.id === id);
    if (!w) return;
    if (w.minimized) wm.focus(id);
    else if (state.focusedId === id) wm.minimize(id);
    else wm.focus(id);
  };

  return (
    <>
      {menuOpen && <StartMenu onOpen={wm.openApp} onClose={() => setMenuOpen(false)} />}
      <div className="taskbar" role="toolbar" aria-label="Taskbar">
        <button
          className={`start-button${menuOpen ? ' active' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
        >
          ⊞ Start
        </button>
        <div className="taskbar-windows">
          {state.windows.map((w) => (
            <button
              key={w.id}
              className={`task-button${state.focusedId === w.id && !w.minimized ? ' active' : ''}`}
              onClick={() => onTaskClick(w.id)}
            >
              {w.icon} {w.title}
            </button>
          ))}
        </div>
        <Clock />
      </div>
    </>
  );
}
```

- [ ] **Step 6: Add taskbar/start-menu styles to `src/index.css`**

```css
.taskbar {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  height: var(--taskbar-h);
  background: #c0c0c0;
  border-top: 2px solid #dfdfdf;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 4px;
  box-sizing: border-box;
  z-index: 10000;
}
.start-button { font-weight: bold; }
.taskbar-windows { display: flex; gap: 4px; flex: 1; overflow: hidden; }
.task-button {
  max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left;
}
.task-button.active { border-style: inset; font-weight: bold; }
.clock { border: 1px inset #808080; padding: 2px 6px; font-size: 12px; }
.start-menu {
  position: fixed;
  left: 4px;
  bottom: var(--taskbar-h);
  width: 180px;
  background: #c0c0c0;
  border: 2px solid #dfdfdf;
  border-right-color: #000; border-bottom-color: #000;
  box-shadow: 2px 2px 0 rgba(0,0,0,.4);
  z-index: 10001;
  display: flex;
}
.start-menu-banner {
  writing-mode: vertical-rl; transform: rotate(180deg);
  background: linear-gradient(#000080, #1084d0); color: #fff;
  font-weight: bold; padding: 8px 4px; font-size: 14px;
}
.start-menu ul { list-style: none; margin: 0; padding: 2px; flex: 1; }
.start-menu li button, .start-menu li a {
  display: block; width: 100%; text-align: left; background: none; border: none; box-shadow: none;
  padding: 5px 8px; font-size: 12px; color: #000; text-decoration: none; cursor: default;
}
.start-menu li button:hover, .start-menu li a:hover { background: #000080; color: #fff; }
.start-menu-sep { border-top: 1px solid #808080; margin: 3px 0; }
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test -- Taskbar`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/shell/Taskbar.tsx src/shell/StartMenu.tsx src/shell/Clock.tsx src/shell/Taskbar.test.tsx src/index.css
git commit -m "feat: taskbar with running windows, start menu, and clock"
```

---

## Task 6: Wire the shell into App

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace `src/App.tsx`**

```tsx
import { WindowManagerProvider } from './window-manager/WindowManagerContext';
import { Desktop } from './shell/Desktop';
import { Taskbar } from './shell/Taskbar';

export function App() {
  return (
    <WindowManagerProvider>
      <Desktop />
      <Taskbar />
    </WindowManagerProvider>
  );
}
```

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS — all suites green.

- [ ] **Step 3: Manually verify in the browser**

Run: `npm run dev`, open the printed localhost URL.
Expected: teal desktop with 5 icons; double-click opens a draggable window with a "coming soon" body; taskbar shows the window; Start toggles a menu.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: assemble desktop shell in App"
```

---

## Task 7: Content data files

**Files:**
- Create: `src/data/contact.ts`
- Create: `src/data/about.ts`
- Create: `src/data/projects.ts`

- [ ] **Step 1: Create `src/data/contact.ts`** (privacy: email + LinkedIn + GitHub ONLY)

```ts
export const contact = {
  email: 'bsnlkhm@gmail.com',
  linkedin: 'https://linkedin.com/in/jo-tamir',
  github: 'https://github.com/jo-walker',
} as const;
```

- [ ] **Step 2: Create `src/data/about.ts`** (hand-written — never sourced from bio.txt)

```ts
export const about = {
  name: 'Jo Gurvantamir',
  title: 'Full-Stack Developer',
  location: 'Ottawa, ON',
  paragraphs: [
    "Hi — I'm Jo, a full-stack developer in Ottawa who likes building data-intensive systems end to end, from the database up to the pixels.",
    'Most recently I was a full-stack developer at Ideabytes on the Neology ETBOS highway toll platform — building real-time microservices for traffic-sensor data, event-driven pipelines on ActiveMQ, and enterprise auth with Keycloak/OAuth 2.0. Earlier, as an ML/OCR intern, I trained a custom Tesseract model to read MICR cheque characters, pushing accuracy from 67% to 91%.',
    "I earned a Computer Programming Diploma at Algonquin College (3.9 GPA, Dean's Honour List), took 1st place at Hack the Hill 2023, and co-founded SyberPong, a small game studio, back in Mongolia.",
    'Outside of work I tinker with hackathons, LeetCode, and side projects across AI/ML, cloud, and a bit of hardware.',
  ],
  skills: {
    Languages: ['Java', 'Python', 'C++', 'JavaScript', 'TypeScript', 'SQL', 'Dart'],
    Frameworks: ['Spring Boot', 'React', 'Angular', 'NestJS', 'Node.js', 'Express', 'Flask'],
    'DevOps & Cloud': ['Docker', 'Kubernetes', 'AWS', 'Git', 'CI/CD', 'Keycloak'],
    Data: ['PostgreSQL', 'MySQL', 'MongoDB', 'Neo4j', 'Redis'],
  },
} as const;
```

- [ ] **Step 3: Create `src/data/projects.ts`**

```ts
export interface Project {
  id: string;
  name: string;
  icon: string;
  category: 'creative' | 'professional';
  tagline: string;
  stack: string[];
  highlights: string[];
  href?: string; // omit when there's no public repo/demo yet
}

export const projects: Project[] = [
  {
    id: 'parkopticon',
    name: 'Parkopticon',
    icon: '🅿️',
    category: 'creative',
    tagline: 'Find parking, avoid tickets — crowdsourced, real-time.',
    stack: ['React Native', 'Expo', 'Edge AI', 'mmWave radar'],
    highlights: [
      'Cross-platform mobile app for real-time street-parking and enforcement alerts, driven by community reports.',
      'Designed toward an edge-inference vehicle sentinel using mmWave radar and distributed IoT nodes under strict low-power constraints.',
    ],
  },
  {
    id: 'raindropticon',
    name: 'Raindropticon',
    icon: '🌧️',
    category: 'creative',
    tagline: 'Production-grade workforce management for cleaning ops.',
    stack: ['NestJS', 'GraphQL', 'PostgreSQL/PostGIS', 'Prisma', 'React 19', 'React Native', 'Docker'],
    highlights: [
      'Monorepo: geospatial NestJS/GraphQL backend, React 19 ops dashboard, and a React Native field app — fully containerized.',
      'Sub-meter geofence validation with raw PostGIS queries prevents false clock-ins; end-to-end type safety via code-first GraphQL.',
    ],
  },
  {
    id: 'put-it-down',
    name: 'Put It Down',
    icon: '📱',
    category: 'creative',
    tagline: 'A focus monitor that notices when you pick up your phone.',
    stack: ['Python', 'OpenCV', 'MediaPipe', 'Tkinter'],
    highlights: [
      'Desktop app combining app-usage tracking with webcam head-pose estimation to infer focus vs. distraction.',
      'Classifies head pose (screen / phone / limbo / away) from facial landmark depth and tracks time per state.',
    ],
  },
  {
    id: 'note-splicer',
    name: 'note-splicer',
    icon: '🗒️',
    category: 'creative',
    tagline: 'Turn messy notes into a searchable RAG knowledge base.',
    stack: ['Python', 'ChromaDB', 'litellm', 'RAG'],
    highlights: [
      'Pipeline that structures raw text notes with generative AI and indexes them into a persistent vector database.',
      'Retrieval-augmented generation answers questions grounded in your own notes.',
    ],
  },
  {
    id: 'inventory',
    name: 'Inventory Management System',
    icon: '📦',
    category: 'professional',
    tagline: 'Transaction-based stock with barcode + vendor financials.',
    stack: ['React', 'TypeScript', 'Node.js', 'Express', 'MySQL', 'Sequelize'],
    highlights: [
      'Stock derived from invoice receipts minus sales — eliminating quantity drift from manual edits.',
      'CODE128 barcode generation with thermal label printing, vendor payment allocation, and landed-cost analysis.',
      'Bulk CSV/Excel import with confidence-scored fuzzy column matching, plus a custom report builder.',
    ],
  },
  {
    id: 'pm-repo',
    name: 'Project Management API',
    icon: '🗂️',
    category: 'professional',
    tagline: '25+ endpoint REST API with JWT auth and tuned queries.',
    stack: ['Java', 'JAX-RS', 'Hibernate', 'PostgreSQL'],
    highlights: [
      'JWT auth with refresh-token rotation and role-based access (Admin / PM / Client).',
      'Composite indexes cut dashboard load from 3.2s to 0.8s for users with 1000+ tasks; 85% test coverage.',
    ],
  },
  {
    id: 'med-ed',
    name: 'Medical Education School Mgmt',
    icon: '🏥',
    category: 'professional',
    tagline: '76-endpoint Java EE API with 100% test coverage.',
    stack: ['Java EE', 'JPA', 'Maven', 'JUnit'],
    highlights: [
      'RESTful API spanning 8 resource domains managing 1000+ records.',
      '100% code coverage via JUnit and Maven Surefire in a Linux CI environment.',
    ],
  },
  {
    id: 'pos',
    name: 'E-commerce POS System',
    icon: '🧾',
    category: 'professional',
    tagline: 'Back-office POS with full-text-tuned catalog search.',
    stack: ['Angular', 'Node.js', 'MySQL'],
    highlights: [
      'Point-of-sale with inventory management and sales reporting for a retail business.',
      'MySQL full-text indexes on product names/descriptions cut average page load by 75%.',
    ],
  },
];
```

- [ ] **Step 4: Verify types compile**

Run: `npm run build`
Expected: `tsc` passes with no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/data/
git commit -m "feat: typed content data for about, projects, and contact"
```

---

## Task 8: About app

**Files:**
- Create: `src/apps/AboutApp.tsx`
- Modify: `src/apps/registry.tsx`
- Test: `src/apps/AboutApp.test.tsx`

- [ ] **Step 1: Write the failing test `src/apps/AboutApp.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AboutApp } from './AboutApp';

describe('AboutApp', () => {
  it('shows the name, title, and at least one bio paragraph', () => {
    render(<AboutApp />);
    expect(screen.getByText(/Jo Gurvantamir/)).toBeInTheDocument();
    expect(screen.getByText(/Full-Stack Developer/)).toBeInTheDocument();
    expect(screen.getByText(/Ideabytes/)).toBeInTheDocument();
  });

  it('does NOT render any home address or phone number', () => {
    render(<AboutApp />);
    expect(screen.queryByText(/Pineridge/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/613/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- AboutApp`
Expected: FAIL — cannot resolve `./AboutApp`.

- [ ] **Step 3: Implement `src/apps/AboutApp.tsx`**

```tsx
import { about } from '../data/about';

export function AboutApp() {
  return (
    <div className="app-pad">
      <h2 style={{ margin: '0 0 2px' }}>{about.name}</h2>
      <p style={{ margin: '0 0 12px', color: '#333' }}>
        {about.title} · {about.location}
      </p>
      {about.paragraphs.map((p, i) => (
        <p key={i} style={{ marginBottom: 8 }}>{p}</p>
      ))}
      <fieldset style={{ marginTop: 8 }}>
        <legend>Skills</legend>
        {Object.entries(about.skills).map(([group, items]) => (
          <p key={group} style={{ margin: '4px 0' }}>
            <strong>{group}:</strong> {items.join(', ')}
          </p>
        ))}
      </fieldset>
    </div>
  );
}
```

- [ ] **Step 4: Register it in `src/apps/registry.tsx`** — replace the `about` placeholder.

Change the import block at the top to add:
```tsx
import { AboutApp } from './AboutApp';
```
And in `APP_REGISTRY`, replace `about: Placeholder('About'),` with:
```tsx
  about: () => <AboutApp />,
```

- [ ] **Step 5: Add `.app-pad` style to `src/index.css`**

```css
.app-pad { padding: 10px 12px; font-size: 13px; line-height: 1.5; }
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- AboutApp`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/apps/AboutApp.tsx src/apps/AboutApp.test.tsx src/apps/registry.tsx src/index.css
git commit -m "feat: About app (privacy-safe bio)"
```

---

## Task 9: Projects app + project detail

**Files:**
- Create: `src/apps/ProjectDetail.tsx`
- Create: `src/apps/ProjectsApp.tsx`
- Modify: `src/apps/registry.tsx`
- Test: `src/apps/ProjectsApp.test.tsx`

- [ ] **Step 1: Create `src/apps/ProjectDetail.tsx`**

```tsx
import type { WindowState } from '../types';
import { projects } from '../data/projects';

export function ProjectDetail({ win }: { win: WindowState }) {
  const id = win.props?.projectId as string | undefined;
  const project = projects.find((p) => p.id === id);
  if (!project) return <p className="app-pad">Project not found.</p>;
  return (
    <div className="app-pad">
      <h2 style={{ margin: '0 0 2px' }}>{project.icon} {project.name}</h2>
      <p style={{ margin: '0 0 8px', fontStyle: 'italic' }}>{project.tagline}</p>
      <p style={{ margin: '0 0 8px' }}>
        {project.stack.map((s) => (
          <span key={s} className="chip">{s}</span>
        ))}
      </p>
      <ul style={{ margin: '0 0 10px', paddingLeft: 18 }}>
        {project.highlights.map((h, i) => <li key={i} style={{ marginBottom: 4 }}>{h}</li>)}
      </ul>
      {project.href && (
        <a href={project.href} target="_blank" rel="noreferrer"><button>Open ↗</button></a>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write the failing test `src/apps/ProjectsApp.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WindowManagerProvider } from '../window-manager/WindowManagerContext';
import { Desktop } from '../shell/Desktop';

describe('ProjectsApp', () => {
  it('lists project folders and opens a detail window on double-click', async () => {
    render(<WindowManagerProvider><Desktop /></WindowManagerProvider>);
    await userEvent.dblClick(screen.getByText('My Projects'));
    // A known project appears in the folder
    const parkopticon = await screen.findByText('Parkopticon');
    await userEvent.dblClick(parkopticon);
    // Its detail window opens showing the tagline
    expect(await screen.findByText(/Find parking/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- ProjectsApp`
Expected: FAIL — projects placeholder has no "Parkopticon" text.

- [ ] **Step 4: Implement `src/apps/ProjectsApp.tsx`**

```tsx
import { projects } from '../data/projects';
import { useWindowManager } from '../window-manager/WindowManagerContext';

export function ProjectsApp() {
  const wm = useWindowManager();
  const open = (id: string, name: string) =>
    wm.openApp('projectDetail', { projectId: id }, name);

  const groups = [
    { key: 'creative', label: 'Personal & Creative' },
    { key: 'professional', label: 'Professional' },
  ] as const;

  return (
    <div className="app-pad">
      {groups.map((g) => (
        <section key={g.key}>
          <h3 className="folder-heading">{g.label}</h3>
          <div className="folder-grid">
            {projects.filter((p) => p.category === g.key).map((p) => (
              <button
                key={p.id}
                className="folder-item"
                onDoubleClick={() => open(p.id, p.name)}
                title={p.tagline}
              >
                <span className="folder-glyph" aria-hidden>{p.icon}</span>
                <span className="folder-label">{p.name}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Register both in `src/apps/registry.tsx`**

Add imports:
```tsx
import { ProjectsApp } from './ProjectsApp';
import { ProjectDetail } from './ProjectDetail';
```
Replace the placeholders:
```tsx
  projects: () => <ProjectsApp />,
  projectDetail: (props) => <ProjectDetail win={props.win} />,
```

- [ ] **Step 6: Add folder styles to `src/index.css`**

```css
.folder-heading { margin: 6px 0 4px; font-size: 13px; }
.folder-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; }
.folder-item {
  width: 92px; background: none; border: 1px solid transparent; box-shadow: none;
  display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 6px; cursor: default;
}
.folder-item:hover, .folder-item:focus { border: 1px dotted #000080; background: #d7e4f2; outline: none; }
.folder-glyph { font-size: 26px; }
.folder-label { font-size: 11px; text-align: center; }
.chip {
  display: inline-block; font-size: 11px; background: #000080; color: #fff;
  padding: 1px 6px; margin: 2px 3px 2px 0; border-radius: 2px;
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test -- ProjectsApp`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/apps/ProjectsApp.tsx src/apps/ProjectDetail.tsx src/apps/ProjectsApp.test.tsx src/apps/registry.tsx src/index.css
git commit -m "feat: Projects folder with per-project detail windows"
```

---

## Task 10: Résumé app + PDF

**Files:**
- Create: `public/resume.pdf` (copied from the resume repo)
- Create: `src/apps/ResumeApp.tsx`
- Modify: `src/apps/registry.tsx`
- Test: `src/apps/ResumeApp.test.tsx`

- [ ] **Step 1: Copy the résumé PDF into `public/`**

Run (Git Bash): `mkdir -p public && cp "/c/Users/jotam/projects/resume_builder/resume.pdf" public/resume.pdf`
Run (PowerShell alt): `New-Item -ItemType Directory -Force public; Copy-Item "C:\Users\jotam\projects\resume_builder\resume.pdf" public\resume.pdf`
Expected: `public/resume.pdf` exists. (If a newer résumé PDF is preferred, copy that file to `public/resume.pdf` instead — the app always references `/resume.pdf`.)

- [ ] **Step 2: Write the failing test `src/apps/ResumeApp.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResumeApp } from './ResumeApp';

describe('ResumeApp', () => {
  it('embeds the résumé and offers a download link to /resume.pdf', () => {
    render(<ResumeApp />);
    // "download pdf" avoids matching the <object> fallback's "Download it here" link
    const download = screen.getByRole('link', { name: /download pdf/i });
    expect(download).toHaveAttribute('href', '/resume.pdf');
    expect(download).toHaveAttribute('download');
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- ResumeApp`
Expected: FAIL — cannot resolve `./ResumeApp`.

- [ ] **Step 4: Implement `src/apps/ResumeApp.tsx`**

```tsx
export function ResumeApp() {
  return (
    <div className="resume-app">
      <div className="resume-toolbar">
        <a href="/resume.pdf" download="JoGurvantamir_Resume.pdf">
          <button>⬇ Download PDF</button>
        </a>
        <a href="/resume.pdf" target="_blank" rel="noreferrer">
          <button>↗ Open in new tab</button>
        </a>
      </div>
      <object data="/resume.pdf" type="application/pdf" className="resume-embed" aria-label="Résumé PDF">
        <p className="app-pad">
          Your browser can't display the embedded PDF.{' '}
          <a href="/resume.pdf" download>Download it here.</a>
        </p>
      </object>
    </div>
  );
}
```

- [ ] **Step 5: Register it in `src/apps/registry.tsx`**

Add import:
```tsx
import { ResumeApp } from './ResumeApp';
```
Replace placeholder:
```tsx
  resume: () => <ResumeApp />,
```

- [ ] **Step 6: Add résumé styles to `src/index.css`**

```css
.resume-app { display: flex; flex-direction: column; height: 100%; }
.resume-toolbar { display: flex; gap: 6px; padding: 6px; border-bottom: 1px solid #808080; }
.resume-embed { flex: 1; width: 100%; border: none; }
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test -- ResumeApp`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add public/resume.pdf src/apps/ResumeApp.tsx src/apps/ResumeApp.test.tsx src/apps/registry.tsx src/index.css
git commit -m "feat: Résumé viewer with PDF download"
```

---

## Task 11: Contact app

**Files:**
- Create: `src/apps/ContactApp.tsx`
- Modify: `src/apps/registry.tsx`
- Test: `src/apps/ContactApp.test.tsx`

- [ ] **Step 1: Write the failing test `src/apps/ContactApp.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactApp } from './ContactApp';

describe('ContactApp', () => {
  it('shows email, LinkedIn, and GitHub links', () => {
    render(<ContactApp />);
    expect(screen.getByRole('link', { name: /bsnlkhm@gmail.com/ })).toHaveAttribute('href', 'mailto:bsnlkhm@gmail.com');
    expect(screen.getByRole('link', { name: /LinkedIn/i })).toHaveAttribute('href', 'https://linkedin.com/in/jo-tamir');
    expect(screen.getByRole('link', { name: /GitHub/i })).toHaveAttribute('href', 'https://github.com/jo-walker');
  });

  it('does NOT expose a phone number or street address', () => {
    render(<ContactApp />);
    expect(screen.queryByText(/613/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Pineridge/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- ContactApp`
Expected: FAIL — cannot resolve `./ContactApp`.

- [ ] **Step 3: Implement `src/apps/ContactApp.tsx`**

```tsx
import { contact } from '../data/contact';

export function ContactApp() {
  return (
    <div className="app-pad">
      <p>Want to talk? The fastest way to reach me:</p>
      <ul className="contact-list">
        <li>✉️ <a href={`mailto:${contact.email}`}>{contact.email}</a></li>
        <li>🔗 <a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
        <li>🐙 <a href={contact.github} target="_blank" rel="noreferrer">GitHub</a></li>
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Register it in `src/apps/registry.tsx`**

Add import:
```tsx
import { ContactApp } from './ContactApp';
```
Replace placeholder:
```tsx
  contact: () => <ContactApp />,
```

- [ ] **Step 5: Add contact styles to `src/index.css`**

```css
.contact-list { list-style: none; padding: 0; margin: 10px 0; font-size: 14px; line-height: 2; }
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- ContactApp`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/apps/ContactApp.tsx src/apps/ContactApp.test.tsx src/apps/registry.tsx src/index.css
git commit -m "feat: Contact app (email + LinkedIn + GitHub only)"
```

---

## Task 12: Recycle Bin app

**Files:**
- Create: `src/apps/RecycleBinApp.tsx`
- Modify: `src/apps/registry.tsx`
- Test: `src/apps/RecycleBinApp.test.tsx`

- [ ] **Step 1: Write the failing test `src/apps/RecycleBinApp.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecycleBinApp } from './RecycleBinApp';

describe('RecycleBinApp', () => {
  it('renders the joke "abandoned side-projects" contents', () => {
    render(<RecycleBinApp />);
    expect(screen.getByText(/abandoned/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- RecycleBinApp`
Expected: FAIL — cannot resolve `./RecycleBinApp`.

- [ ] **Step 3: Implement `src/apps/RecycleBinApp.tsx`**

```tsx
const ABANDONED = [
  '🕹️ another-tetris-clone/',
  '🤖 discord-bot-v1/',
  '📈 crypto-tracker-i-swear-this-time/',
  '🧪 weekend-framework-experiment/',
];

export function RecycleBinApp() {
  return (
    <div className="app-pad">
      <p>🗑️ Abandoned side-projects (do not restore):</p>
      <ul style={{ paddingLeft: 18, lineHeight: 1.8 }}>
        {ABANDONED.map((f) => <li key={f}>{f}</li>)}
      </ul>
      <p style={{ color: '#666' }}>Every one taught me something. Mostly what not to do.</p>
    </div>
  );
}
```

- [ ] **Step 4: Register it in `src/apps/registry.tsx`**

Add import:
```tsx
import { RecycleBinApp } from './RecycleBinApp';
```
Replace placeholder:
```tsx
  recycleBin: () => <RecycleBinApp />,
```
Also remove the now-unused `Placeholder` helper if no placeholders remain.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- RecycleBinApp`
Expected: PASS.

- [ ] **Step 6: Full suite + build**

Run: `npm test && npm run build`
Expected: all tests PASS; build succeeds with no type errors.

- [ ] **Step 7: Commit**

```bash
git add src/apps/RecycleBinApp.tsx src/apps/RecycleBinApp.test.tsx src/apps/registry.tsx
git commit -m "feat: Recycle Bin app"
```

---

## Task 13: Mobile polish

The reducer/Window/Desktop already implement maximized-stack behavior on mobile (Tasks 3–4: `useIsMobile`, `fill`, and the `!isMobile || w.id === focusedId` filter). This task verifies and tunes it.

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add mobile CSS refinements**

```css
@media (max-width: 768px) {
  .desktop-icons { flex-direction: row; }
  .task-button { max-width: 44vw; }
  .start-menu { width: 70vw; }
}
```

- [ ] **Step 2: Manually verify mobile mode**

Run: `npm run dev`, open the URL, open browser devtools, toggle a phone viewport (≤768px wide).
Expected: opening an icon fills the screen (no title-bar drag handle offset issues); the taskbar switches between open apps; only the focused window is visible.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: mobile refinements for maximized-stack mode"
```

---

## Task 14: Playwright smoke test

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/smoke.spec.ts`

- [ ] **Step 1: Install the Playwright browser**

Run: `npx playwright install chromium`
Expected: Chromium downloads.

- [ ] **Step 2: Create `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: { baseURL: 'http://localhost:5173' },
});
```

- [ ] **Step 3: Create `e2e/smoke.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test('desktop boots, opens a window, and closes it', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('About Me')).toBeVisible();
  await page.getByText('About Me').dblclick();
  const dialog = page.getByRole('dialog', { name: 'About Me' });
  await expect(dialog).toBeVisible();
  await expect(page.getByText(/Jo Gurvantamir/)).toBeVisible();
  await dialog.getByLabel('Close').click();
  await expect(dialog).toHaveCount(0);
});

test('mobile viewport opens windows maximized', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 });
  await page.goto('/');
  await page.getByText('My Projects').dblclick();
  const dialog = page.getByRole('dialog', { name: 'My Projects' });
  const box = await dialog.boundingBox();
  expect(box!.width).toBeGreaterThan(340); // fills the narrow viewport
});
```

- [ ] **Step 4: Run the e2e tests**

Run: `npm run e2e`
Expected: both tests PASS (Playwright starts the dev server automatically).

- [ ] **Step 5: Add Playwright artifacts to `.gitignore`**

Append to `.gitignore`:
```
# Playwright
/test-results/
/playwright-report/
/playwright/.cache/
```

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts e2e/smoke.spec.ts .gitignore
git commit -m "test: Playwright smoke test for boot/open/close + mobile"
```

---

## Task 15: Vercel deploy

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create `vercel.json`** (SPA rewrite so deep links serve index.html)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/((?!resume.pdf|assets/).*)", "destination": "/index.html" }]
}
```

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "chore: Vercel SPA config"
```

- [ ] **Step 3: Deploy (interactive — user runs this)**

The engineer prompts Jo to run these in the terminal (they require login/account choices):
```
npx vercel login
npx vercel            # preview deploy — confirm project settings
npx vercel --prod     # production deploy
```
Expected: Vercel prints a live URL. Open it and confirm: desktop loads, all five icons open working windows, résumé downloads, contact links work, mobile viewport maximizes.

- [ ] **Step 4: Final verification checklist**

Run: `npm test && npm run build && npm run e2e`
Expected: all green. The live URL renders the portfolio.

---

## Self-Review Notes (completed by plan author)

- **Spec coverage:** boot/desktop metaphor (Tasks 4–6), window manager with drag/resize/focus/min/max (Tasks 1–3), About/Projects/Résumé/Contact/Recycle Bin (Tasks 8–12), mobile maximized-stack (Tasks 3, 4, 13), privacy rules — email+LinkedIn+GitHub only, no bio.txt (Tasks 7, 8, 11 with negative assertions), testing (unit throughout + Playwright Task 14), Vercel deploy (Task 15). Phase-2 toys intentionally excluded (separate plan).
- **Type consistency:** `WMAction`, `WindowState`, `AppKey` defined once in `types.ts`; `WINDOW_DEFAULTS`/`APP_REGISTRY` keyed by the same `AppKey`; `openApp(appKey, props?, titleOverride?)` signature used consistently by Desktop, StartMenu, and ProjectsApp; `Window` prop handler names (`onMove`, `onResize`, …) match Desktop's wiring.
- **No placeholders:** every code step contains complete code; the only intentional stubs are the registry `Placeholder` entries in Tasks 2/4, each explicitly replaced in Tasks 8–12 and the helper removed in Task 12.

## Open items to confirm at build time
- If a newer résumé PDF than `resume_builder/resume.pdf` is preferred, drop it in as `public/resume.pdf` (Task 10 Step 1).
- Project repo/demo URLs: `Project.href` is optional and currently omitted; add public links to `src/data/projects.ts` when available and the "Open ↗" button appears automatically.

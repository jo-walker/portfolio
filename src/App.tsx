import { useEffect, useState } from 'react';
import { WindowManagerProvider, useWindowManager } from './window-manager/WindowManagerContext';
import { Desktop } from './shell/Desktop';
import { DisplayProvider } from './shell/DisplayContext';
import { Taskbar } from './shell/Taskbar';
import { BootScreen } from './shell/BootScreen';
import { shouldBoot, shouldAutoWelcome } from './shell/boot';
import { parseOpenParam, openParamFor, withOpenParam } from './shell/deepLink';
import { storage, session } from './lib/storage';

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

function Shell() {
  const { openApp, state } = useWindowManager();
  const [booting, setBooting] = useState(() =>
    shouldBoot({
      search: window.location.search,
      reducedMotion: prefersReducedMotion(),
      alreadyBooted: session.get('booted', false),
    }),
  );

  // Once the desktop is visible: honour a ?open= deep link, else auto-open the
  // welcome window on a first visit. A deep link wins — someone following a
  // shared résumé link shouldn't land under a greeting they didn't ask for.
  useEffect(() => {
    if (booting) return;
    session.set('booted', true);

    const target = parseOpenParam(window.location.search);
    if (target) {
      storage.set('welcomed', true);
      openApp(target.appKey, target.props, target.title);
      return;
    }

    if (shouldAutoWelcome({ search: window.location.search, welcomed: storage.get('welcomed', false) })) {
      storage.set('welcomed', true);
      openApp('welcome');
    }
  }, [booting, openApp]);

  // Keep ?open= pointing at the focused window so the address bar is always
  // copy-pasteable. replaceState (not push) — the back button should leave the
  // site rather than walk a history entry per window focus.
  const focused = state.windows.find((w) => w.id === state.focusedId) ?? null;
  const openValue = openParamFor(focused);
  useEffect(() => {
    if (booting) return;
    const search = withOpenParam(window.location.search, openValue);
    window.history.replaceState(null, '', window.location.pathname + search + window.location.hash);
  }, [booting, openValue]);

  return (
    <>
      {booting && <BootScreen onDone={() => setBooting(false)} />}
      <Desktop />
      <Taskbar />
    </>
  );
}

export function App() {
  return (
    <DisplayProvider>
      <WindowManagerProvider>
        <Shell />
      </WindowManagerProvider>
    </DisplayProvider>
  );
}

import { useEffect, useState } from 'react';
import { WindowManagerProvider, useWindowManager } from './window-manager/WindowManagerContext';
import { Desktop } from './shell/Desktop';
import { Taskbar } from './shell/Taskbar';
import { BootScreen } from './shell/BootScreen';
import { shouldBoot, shouldAutoWelcome } from './shell/boot';
import { storage, session } from './lib/storage';

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

function Shell() {
  const { openApp } = useWindowManager();
  const [booting, setBooting] = useState(() =>
    shouldBoot({
      search: window.location.search,
      reducedMotion: prefersReducedMotion(),
      alreadyBooted: session.get('booted', false),
    }),
  );

  // Auto-open the welcome window once the desktop is visible, on first visit.
  useEffect(() => {
    if (booting) return;
    session.set('booted', true);
    if (shouldAutoWelcome({ search: window.location.search, welcomed: storage.get('welcomed', false) })) {
      storage.set('welcomed', true);
      openApp('welcome');
    }
  }, [booting, openApp]);

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
    <WindowManagerProvider>
      <Shell />
    </WindowManagerProvider>
  );
}

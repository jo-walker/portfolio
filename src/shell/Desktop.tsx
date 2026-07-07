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

import { useState, type MouseEvent as ReactMouseEvent } from 'react';
import type { AppKey } from '../types';
import { useWindowManager } from '../window-manager/WindowManagerContext';
import { useIsMobile } from '../window-manager/useMediaQuery';
import { Window } from '../window-manager/Window';
import { DesktopIcon } from './DesktopIcon';
import { ContextMenu, type MenuItem } from './ContextMenu';
import { APP_REGISTRY, WINDOW_DEFAULTS } from '../apps/registry';
import { clearPositions, defaultPosition, loadPositions, savePosition, type Point } from './iconLayout';

const DESKTOP_ICONS: AppKey[] = ['about', 'projects', 'resume', 'contact', 'terminal', 'recycleBin'];

export function Desktop() {
  const wm = useWindowManager();
  const isMobile = useIsMobile();
  const { state } = wm;

  const [positions, setPositions] = useState<Record<string, Point>>(() => {
    const saved = loadPositions();
    const initial: Record<string, Point> = {};
    DESKTOP_ICONS.forEach((key, i) => {
      initial[key] = saved[key] ?? defaultPosition(i);
    });
    return initial;
  });

  // Live update during a drag (cheap, state only); persistence happens on drop.
  const moveIcon = (key: AppKey, point: Point) => {
    setPositions((prev) => ({ ...prev, [key]: point }));
  };

  const commitIcon = (key: AppKey, point: Point) => {
    setPositions((prev) => ({ ...prev, [key]: point }));
    savePosition(key, point);
  };

  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  const arrangeIcons = () => {
    const reset: Record<string, Point> = {};
    DESKTOP_ICONS.forEach((key, i) => {
      reset[key] = defaultPosition(i);
    });
    setPositions(reset);
    clearPositions(); // state alone would be undone by the next reload
  };

  const menuItems: MenuItem[] = [
    { label: 'Arrange Icons', onSelect: arrangeIcons },
    { label: 'Open Jo-DOS Prompt', onSelect: () => wm.openApp('terminal') },
    { label: 'Close All Windows', onSelect: wm.closeAll },
    { label: 'About This Desktop', onSelect: () => wm.openApp('welcome'), separatorBefore: true },
  ];

  // Only the bare desktop gets our menu. Anywhere inside a window (terminal input,
  // selectable résumé text) keeps the browser's native menu, and long-press on
  // mobile must not fire this at all.
  const onContextMenu = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const target = e.target as HTMLElement;
    if (!target.classList.contains('desktop') && !target.classList.contains('desktop-icons')) return;
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="desktop" onContextMenu={onContextMenu}>
      <div className="desktop-icons">
        {DESKTOP_ICONS.map((key) => (
          <DesktopIcon
            key={key}
            icon={WINDOW_DEFAULTS[key].icon}
            label={WINDOW_DEFAULTS[key].title}
            position={positions[key]}
            draggable={!isMobile}
            onOpen={() => wm.openApp(key)}
            onMove={(p) => moveIcon(key, p)}
            onMoveEnd={(p) => commitIcon(key, p)}
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

      {menu && (
        <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} />
      )}
    </div>
  );
}

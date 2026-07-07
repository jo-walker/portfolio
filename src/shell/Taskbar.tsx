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

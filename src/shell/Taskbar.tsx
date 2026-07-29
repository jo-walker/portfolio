import { useState } from 'react';
import { useWindowManager } from '../window-manager/WindowManagerContext';
import { StartMenu } from './StartMenu';
import { Clock } from './Clock';
import { isEnabled, setEnabled } from '../lib/sound';

export function Taskbar() {
  const wm = useWindowManager();
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isEnabled);
  const { state } = wm;

  const toggleSound = () => {
    const next = !soundOn;
    setEnabled(next); // this click is the user gesture that unlocks Web Audio
    setSoundOn(next);
  };

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
        <button
          className="tray-button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
          title={soundOn ? 'Sound on' : 'Sound off'}
        >
          <span aria-hidden>{soundOn ? '🔊' : '🔇'}</span>
        </button>
        <Clock />
      </div>
    </>
  );
}

import { useWindowManager } from '../window-manager/WindowManagerContext';
import type { AppKey } from '../types';

const CTAS: { key: AppKey; label: string }[] = [
  { key: 'resume', label: '📄 View Résumé' },
  { key: 'contact', label: '✉️ Contact Me' },
  { key: 'projects', label: '📁 Explore Projects' },
];

export function WelcomeApp() {
  const wm = useWindowManager();
  return (
    <div className="app-pad welcome">
      <h2 className="welcome-title">Welcome to my desktop 👋</h2>
      <p>
        Hi, I'm <strong>Jo</strong> — a full-stack developer in Ottawa. This portfolio is a
        tiny Windows&nbsp;95. Double-click the desktop icons, open the Start menu, or try the
        <strong> Jo-DOS </strong> prompt. Not sure where to start? Pick one:
      </p>
      <div className="welcome-ctas">
        {CTAS.map((c) => (
          <button key={c.key} onClick={() => wm.openApp(c.key)}>{c.label}</button>
        ))}
      </div>
    </div>
  );
}

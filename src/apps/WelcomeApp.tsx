import { useWindowManager } from '../window-manager/WindowManagerContext';
import { wallpaper } from '../data/contact';
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
        tiny Windows&nbsp;95. Double-click the desktop icons, right-click the desktop, open the
        Start menu, or try the <strong>Jo-DOS</strong> prompt. Not sure where to start? Pick one:
      </p>
      <div className="welcome-ctas">
        {CTAS.map((c) => (
          <button key={c.key} onClick={() => wm.openApp(c.key)}>{c.label}</button>
        ))}
      </div>
      <p className="welcome-credit">
        Wallpaper: my own photo of {wallpaper.caption} —{' '}
        <a href={wallpaper.source} target="_blank" rel="noreferrer">see the original on Instagram</a>.
      </p>
    </div>
  );
}

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

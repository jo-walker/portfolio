import { useState, useRef, type FormEvent } from 'react';
import { useWindowManager } from '../../window-manager/WindowManagerContext';
import { runCommand } from './interpreter';

interface Line {
  id: number;
  text: string;
  kind: 'input' | 'output';
}

const BANNER: Line[] = [
  { id: 0, text: 'Jo-DOS [Version 9.5.1998]', kind: 'output' },
  { id: 1, text: '(C) 1998 Gurvantamir Systems. Type "help" to begin.', kind: 'output' },
  { id: 2, text: '', kind: 'output' },
];

export function TerminalApp() {
  const wm = useWindowManager();
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [value, setValue] = useState('');
  const nextId = useRef(BANNER.length);

  const push = (text: string, kind: Line['kind']) => {
    const id = nextId.current++;
    setLines((prev) => [...prev, { id, text, kind }]);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const entered = value;
    setValue('');
    push(`C:\\> ${entered}`, 'input');
    const result = runCommand(entered);
    if (result.action?.type === 'clear') {
      setLines([]);
      return;
    }
    result.lines.forEach((l) => push(l, 'output'));
    if (result.action?.type === 'openApp') {
      wm.openApp(result.action.key);
    }
  };

  return (
    <div className="terminal">
      <div className="terminal-log" aria-live="polite">
        {lines.map((l) => (
          <div key={l.id} className={`terminal-line terminal-${l.kind}`}>{l.text}</div>
        ))}
      </div>
      <form className="terminal-form" onSubmit={submit}>
        <span aria-hidden>C:\&gt;</span>
        <input
          className="terminal-input"
          aria-label="Jo-DOS command"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </form>
    </div>
  );
}

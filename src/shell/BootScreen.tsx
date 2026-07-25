import { useEffect } from 'react';

interface BootScreenProps {
  onDone: () => void;
  durationMs?: number;
}

export function BootScreen({ onDone, durationMs = 2600 }: BootScreenProps) {
  useEffect(() => {
    const t = setTimeout(onDone, durationMs);
    const skip = () => onDone();
    window.addEventListener('keydown', skip);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', skip);
    };
  }, [onDone, durationMs]);

  return (
    <div className="boot" role="status" onClick={onDone}>
      <pre className="boot-post">{`Jo-DOS BIOS v9.5
Detecting hardware... OK
Memory Test: 640K OK
Loading portfolio.sys ...`}</pre>
      <div className="boot-splash">
        <span className="boot-logo">🖥️ Jo 95</span>
        <span className="boot-status">Starting Jo-DOS…</span>
      </div>
      <button className="boot-skip" onClick={(e) => { e.stopPropagation(); onDone(); }}>Press any key to skip ▸</button>
    </div>
  );
}

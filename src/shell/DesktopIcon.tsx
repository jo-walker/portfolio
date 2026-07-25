import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import type { Point } from './iconLayout';

interface DesktopIconProps {
  icon: string;
  label: string;
  position: Point;
  onOpen: () => void;
  onMove: (point: Point) => void;
}

export function DesktopIcon({ icon, label, position, onOpen, onMove }: DesktopIconProps) {
  // Grab offset captured once on pointer-down: pointer position minus icon origin.
  const grab = useRef<{ dx: number; dy: number } | null>(null);

  const onPointerDown = (e: ReactPointerEvent) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    grab.current = { dx: e.clientX - position.x, dy: e.clientY - position.y };
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const g = grab.current;
    if (!g) return;
    onMove({ x: Math.max(0, e.clientX - g.dx), y: Math.max(0, e.clientY - g.dy) });
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    grab.current = null;
  };

  return (
    <button
      className="desktop-icon"
      style={{ position: 'absolute', left: position.x, top: position.y }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(); }}
    >
      <span className="desktop-icon-glyph" aria-hidden>{icon}</span>
      <span className="desktop-icon-label">{label}</span>
    </button>
  );
}

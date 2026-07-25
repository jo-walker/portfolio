import { useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import type { Point } from './iconLayout';

interface DesktopIconProps {
  icon: string;
  label: string;
  position: Point;
  /** When false (e.g. mobile), the icon flows in the CSS layout instead of being dragged. */
  draggable: boolean;
  onOpen: () => void;
  /** Live position update during a drag (state only — cheap). */
  onMove: (point: Point) => void;
  /** Fired once when the drag ends, so the position can be persisted. */
  onMoveEnd: (point: Point) => void;
}

export function DesktopIcon({ icon, label, position, draggable, onOpen, onMove, onMoveEnd }: DesktopIconProps) {
  // Grab offset captured once on pointer-down: pointer position minus icon origin.
  const grab = useRef<{ dx: number; dy: number } | null>(null);
  const last = useRef<Point>(position);

  const onPointerDown = (e: ReactPointerEvent) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    grab.current = { dx: e.clientX - position.x, dy: e.clientY - position.y };
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const g = grab.current;
    if (!g) return;
    const point = { x: Math.max(0, e.clientX - g.dx), y: Math.max(0, e.clientY - g.dy) };
    last.current = point;
    onMove(point); // update React state for smooth motion; do NOT touch storage per-move
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (grab.current) {
      grab.current = null;
      onMoveEnd(last.current); // persist once, at the end of the gesture
    }
  };

  // Absolute positioning + pointer dragging only when draggable (desktop). On mobile
  // the icon stays in normal flow so the .desktop-icons flex layout governs it.
  const dragProps = draggable
    ? {
        style: {
          position: 'absolute',
          left: position.x,
          top: position.y,
          touchAction: 'none',
        } as CSSProperties,
        onPointerDown,
        onPointerMove,
        onPointerUp,
      }
    : {};

  return (
    <button
      className="desktop-icon"
      {...dragProps}
      onDoubleClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(); }}
    >
      <span className="desktop-icon-glyph" aria-hidden>{icon}</span>
      <span className="desktop-icon-label">{label}</span>
    </button>
  );
}

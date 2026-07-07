import { useRef, type ReactNode, type PointerEvent, type CSSProperties } from 'react';
import type { WindowState } from '../types';

interface WindowProps {
  win: WindowState;
  focused: boolean;
  isMobile: boolean;
  children: ReactNode;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onToggleMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
}

export function Window(props: WindowProps) {
  const { win, focused, isMobile, children, onClose, onMinimize, onToggleMaximize, onFocus, onMove, onResize } = props;
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const resizeRef = useRef<{ sx: number; sy: number; sw: number; sh: number } | null>(null);

  // On mobile (or maximized) the window fills the desktop area; no drag/resize.
  const fill = isMobile || win.maximized;
  const style: CSSProperties = fill
    ? { position: 'absolute', inset: 0, width: 'auto', height: 'auto', zIndex: win.z }
    : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.z };

  const startDrag = (e: PointerEvent) => {
    if (fill) return;
    onFocus(win.id);
    drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onDragMove = (e: PointerEvent) => {
    if (!drag.current) return;
    onMove(win.id, e.clientX - drag.current.dx, e.clientY - drag.current.dy);
  };
  const endDrag = (e: PointerEvent) => {
    drag.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const startResize = (e: PointerEvent) => {
    e.stopPropagation();
    onFocus(win.id);
    resizeRef.current = { sx: e.clientX, sy: e.clientY, sw: win.width, sh: win.height };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onResizeMove = (e: PointerEvent) => {
    const r = resizeRef.current;
    if (!r) return;
    onResize(win.id, r.sw + (e.clientX - r.sx), r.sh + (e.clientY - r.sy));
  };
  const endResize = (e: PointerEvent) => {
    resizeRef.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      className="window"
      style={style}
      onPointerDown={() => onFocus(win.id)}
      role="dialog"
      aria-label={win.title}
    >
      <div
        className={`title-bar${focused ? '' : ' inactive'}`}
        onPointerDown={startDrag}
        onPointerMove={onDragMove}
        onPointerUp={endDrag}
        onDoubleClick={() => onToggleMaximize(win.id)}
      >
        <div className="title-bar-text">{win.icon} {win.title}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={() => onMinimize(win.id)} />
          <button aria-label="Maximize" onClick={() => onToggleMaximize(win.id)} />
          <button aria-label="Close" onClick={() => onClose(win.id)} />
        </div>
      </div>
      <div className="window-body">{children}</div>
      {!fill && (
        <div
          className="resize-handle"
          onPointerDown={startResize}
          onPointerMove={onResizeMove}
          onPointerUp={endResize}
        />
      )}
    </div>
  );
}

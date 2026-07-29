import { useEffect, useRef } from 'react';

export interface MenuItem {
  label: string;
  onSelect: () => void;
  /** Render a divider above this item. */
  separatorBefore?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

/**
 * Win95-style desktop context menu. Positions itself at the pointer, clamped so
 * it never runs off the viewport, and closes on Escape or any click away.
 */
export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    // Listen on pointerdown rather than click: the menu must be gone before the
    // click lands, otherwise the same gesture also activates whatever is beneath.
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [onClose]);

  // Clamp against the viewport so a right-click near the edge stays readable.
  const width = 180;
  const height = items.length * 26 + 8;
  const left = Math.max(0, Math.min(x, window.innerWidth - width));
  const top = Math.max(0, Math.min(y, window.innerHeight - height));

  return (
    <ul
      ref={ref}
      className="context-menu"
      role="menu"
      aria-label="Desktop"
      style={{ left, top, width }}
    >
      {items.map((item) => (
        <li key={item.label} className={item.separatorBefore ? 'has-separator' : undefined}>
          <button
            role="menuitem"
            onClick={() => {
              item.onSelect();
              onClose();
            }}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

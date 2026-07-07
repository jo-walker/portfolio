interface DesktopIconProps {
  icon: string;
  label: string;
  onOpen: () => void;
}

export function DesktopIcon({ icon, label, onOpen }: DesktopIconProps) {
  return (
    <button
      className="desktop-icon"
      onDoubleClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen();
      }}
    >
      <span className="desktop-icon-glyph" aria-hidden>{icon}</span>
      <span className="desktop-icon-label">{label}</span>
    </button>
  );
}

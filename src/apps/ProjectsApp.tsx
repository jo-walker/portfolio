import { projects } from '../data/projects';
import { useWindowManager } from '../window-manager/WindowManagerContext';

export function ProjectsApp() {
  const wm = useWindowManager();
  const open = (id: string, name: string) =>
    wm.openApp('projectDetail', { projectId: id }, name);

  const groups = [
    { key: 'creative', label: 'Personal & Creative' },
    { key: 'professional', label: 'Professional' },
  ] as const;

  return (
    <div className="app-pad">
      {groups.map((g) => (
        <section key={g.key}>
          <h3 className="folder-heading">{g.label}</h3>
          <div className="folder-grid">
            {projects.filter((p) => p.category === g.key).map((p) => (
              <button
                key={p.id}
                className="folder-item"
                onDoubleClick={() => open(p.id, p.name)}
                title={p.tagline}
              >
                <span className="folder-glyph" aria-hidden>{p.icon}</span>
                <span className="folder-label">{p.name}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

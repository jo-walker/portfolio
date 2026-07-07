import type { WindowState } from '../types';
import { projects } from '../data/projects';

export function ProjectDetail({ win }: { win: WindowState }) {
  const id = win.props?.projectId as string | undefined;
  const project = projects.find((p) => p.id === id);
  if (!project) return <p className="app-pad">Project not found.</p>;
  return (
    <div className="app-pad">
      <h2 style={{ margin: '0 0 2px' }}>{project.icon} {project.name}</h2>
      <p style={{ margin: '0 0 8px', fontStyle: 'italic' }}>{project.tagline}</p>
      <p style={{ margin: '0 0 8px' }}>
        {project.stack.map((s) => (
          <span key={s} className="chip">{s}</span>
        ))}
      </p>
      <ul style={{ margin: '0 0 10px', paddingLeft: 18 }}>
        {project.highlights.map((h, i) => <li key={i} style={{ marginBottom: 4 }}>{h}</li>)}
      </ul>
      {project.href && (
        <a href={project.href} target="_blank" rel="noreferrer"><button>Open ↗</button></a>
      )}
    </div>
  );
}

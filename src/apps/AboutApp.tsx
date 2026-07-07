import { about } from '../data/about';

export function AboutApp() {
  return (
    <div className="app-pad">
      <h2 style={{ margin: '0 0 2px' }}>{about.name}</h2>
      <p style={{ margin: '0 0 12px', color: '#333' }}>
        {about.title} · {about.location}
      </p>
      {about.paragraphs.map((p, i) => (
        <p key={i} style={{ marginBottom: 8 }}>{p}</p>
      ))}
      <fieldset style={{ marginTop: 8 }}>
        <legend>Skills</legend>
        {Object.entries(about.skills).map(([group, items]) => (
          <p key={group} style={{ margin: '4px 0' }}>
            <strong>{group}:</strong> {items.join(', ')}
          </p>
        ))}
      </fieldset>
    </div>
  );
}

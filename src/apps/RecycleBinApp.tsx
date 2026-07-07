const ABANDONED = [
  '🕹️ another-tetris-clone/',
  '🤖 discord-bot-v1/',
  '📈 crypto-tracker-i-swear-this-time/',
  '🧪 weekend-framework-experiment/',
];

export function RecycleBinApp() {
  return (
    <div className="app-pad">
      <p>🗑️ Abandoned side-projects (do not restore):</p>
      <ul style={{ paddingLeft: 18, lineHeight: 1.8 }}>
        {ABANDONED.map((f) => <li key={f}>{f}</li>)}
      </ul>
      <p style={{ color: '#666' }}>Every one taught me something. Mostly what not to do.</p>
    </div>
  );
}

export function ResumeApp() {
  return (
    <div className="resume-app">
      <div className="resume-toolbar">
        <a href="/resume.pdf" download="JoGurvantamir_Resume.pdf">
          <button>⬇ Download PDF</button>
        </a>
        <a href="/resume.pdf" target="_blank" rel="noreferrer">
          <button>↗ Open in new tab</button>
        </a>
      </div>
      <object data="/resume.pdf" type="application/pdf" className="resume-embed" aria-label="Résumé PDF">
        <p className="app-pad">
          Your browser can't display the embedded PDF.{' '}
          <a href="/resume.pdf" download>Download it here.</a>
        </p>
      </object>
    </div>
  );
}

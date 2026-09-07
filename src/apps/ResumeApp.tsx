// The site is served from a sub-path (`base` in vite.config.ts), so a root-absolute
// "/resume.pdf" resolves to the host root and 404s on GitHub Pages. BASE_URL carries
// the trailing slash, so this stays correct wherever the site is mounted.
const RESUME_URL = `${import.meta.env.BASE_URL}resume.pdf`;

export function ResumeApp() {
  return (
    <div className="resume-app">
      <div className="resume-toolbar">
        <a href={RESUME_URL} download="JoGurvantamir_Resume.pdf">
          <button>⬇ Download PDF</button>
        </a>
        <a href={RESUME_URL} target="_blank" rel="noreferrer">
          <button>↗ Open in new tab</button>
        </a>
      </div>
      <object data={RESUME_URL} type="application/pdf" className="resume-embed" aria-label="Résumé PDF">
        <p className="app-pad">
          Your browser can't display the embedded PDF.{' '}
          <a href={RESUME_URL} download>Download it here.</a>
        </p>
      </object>
    </div>
  );
}

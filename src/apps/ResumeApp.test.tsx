import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResumeApp } from './ResumeApp';

describe('ResumeApp', () => {
  it('offers a download link under the deployed base path', () => {
    render(<ResumeApp />);
    // "download pdf" avoids matching the <object> fallback's "Download it here" link
    const download = screen.getByRole('link', { name: /download pdf/i });
    expect(download).toHaveAttribute('href', '/portfolio/resume.pdf');
    expect(download).toHaveAttribute('download');
  });

  it('embeds the PDF from the deployed base path', () => {
    render(<ResumeApp />);
    const embed = screen.getByLabelText('Résumé PDF');
    expect(embed).toHaveAttribute('data', '/portfolio/resume.pdf');
  });

  it('points every résumé link at the same base-prefixed URL', () => {
    const { container } = render(<ResumeApp />);
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href).toBe('/portfolio/resume.pdf');
    }
  });
});

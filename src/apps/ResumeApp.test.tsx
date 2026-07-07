import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResumeApp } from './ResumeApp';

describe('ResumeApp', () => {
  it('embeds the résumé and offers a download link to /resume.pdf', () => {
    render(<ResumeApp />);
    // "download pdf" avoids matching the <object> fallback's "Download it here" link
    const download = screen.getByRole('link', { name: /download pdf/i });
    expect(download).toHaveAttribute('href', '/resume.pdf');
    expect(download).toHaveAttribute('download');
  });
});

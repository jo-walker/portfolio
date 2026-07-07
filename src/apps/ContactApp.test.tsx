import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactApp } from './ContactApp';

describe('ContactApp', () => {
  it('shows email, LinkedIn, and GitHub links', () => {
    render(<ContactApp />);
    expect(screen.getByRole('link', { name: /bsnlkhm@gmail.com/ })).toHaveAttribute('href', 'mailto:bsnlkhm@gmail.com');
    expect(screen.getByRole('link', { name: /LinkedIn/i })).toHaveAttribute('href', 'https://linkedin.com/in/jo-tamir');
    expect(screen.getByRole('link', { name: /GitHub/i })).toHaveAttribute('href', 'https://github.com/jo-walker');
  });

  it('does NOT expose a phone number or street address', () => {
    render(<ContactApp />);
    expect(screen.queryByText(/613/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Pineridge/i)).not.toBeInTheDocument();
  });
});

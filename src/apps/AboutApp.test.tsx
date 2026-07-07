import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AboutApp } from './AboutApp';

describe('AboutApp', () => {
  it('shows the name, title, and at least one bio paragraph', () => {
    render(<AboutApp />);
    expect(screen.getByText(/Jo Gurvantamir/)).toBeInTheDocument();
    expect(screen.getByText(/Full-Stack Developer/)).toBeInTheDocument();
    expect(screen.getByText(/Ideabytes/)).toBeInTheDocument();
  });

  it('does NOT render any home address or phone number', () => {
    render(<AboutApp />);
    expect(screen.queryByText(/Pineridge/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/613/)).not.toBeInTheDocument();
  });
});

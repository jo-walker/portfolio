import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { App } from './App';

describe('App boot flow', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('skips boot and welcome when suppressed via query params', () => {
    window.history.replaceState({}, '', '/?noboot=1&nowelcome=1');
    render(<App />);
    expect(screen.queryByText(/Starting Jo-DOS/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Welcome' })).not.toBeInTheDocument();
  });

  it('auto-opens the welcome window on a first visit (boot suppressed)', async () => {
    window.history.replaceState({}, '', '/?noboot=1');
    render(<App />);
    await waitFor(() =>
      expect(screen.getByRole('dialog', { name: 'Welcome' })).toBeInTheDocument(),
    );
  });
});

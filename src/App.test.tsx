import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('App deep links', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('opens the window named by ?open=', async () => {
    window.history.replaceState({}, '', '/?noboot=1&open=resume');
    render(<App />);
    await waitFor(() =>
      expect(screen.getByRole('dialog', { name: 'Résumé' })).toBeInTheDocument(),
    );
  });

  it('opens a specific project and titles the window after it', async () => {
    window.history.replaceState({}, '', '/?noboot=1&open=project:parkopticon');
    render(<App />);
    await waitFor(() =>
      expect(screen.getByRole('dialog', { name: 'Parkopticon' })).toBeInTheDocument(),
    );
  });

  it('suppresses the welcome pop-up when following a deep link', async () => {
    window.history.replaceState({}, '', '/?noboot=1&open=contact');
    render(<App />);
    await waitFor(() =>
      expect(screen.getByRole('dialog', { name: 'Contact' })).toBeInTheDocument(),
    );
    expect(screen.queryByRole('dialog', { name: 'Welcome' })).not.toBeInTheDocument();
  });

  it('ignores an unknown ?open= value and falls back to the welcome window', async () => {
    window.history.replaceState({}, '', '/?noboot=1&open=solitaire');
    render(<App />);
    await waitFor(() =>
      expect(screen.getByRole('dialog', { name: 'Welcome' })).toBeInTheDocument(),
    );
  });

  it('writes the focused window back into the URL, preserving other params', async () => {
    window.history.replaceState({}, '', '/?noboot=1&open=about');
    render(<App />);
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'About Me' })).toBeInTheDocument());
    await waitFor(() => expect(window.location.search).toBe('?noboot=1&open=about'));
  });

  it('drops ?open= once the last window is closed', async () => {
    window.history.replaceState({}, '', '/?noboot=1&open=about');
    render(<App />);
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'About Me' })).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => expect(window.location.search).toBe('?noboot=1'));
  });
});

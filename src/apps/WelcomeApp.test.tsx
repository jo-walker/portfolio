import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WindowManagerProvider, useWindowManager } from '../window-manager/WindowManagerContext';
import { WelcomeApp } from './WelcomeApp';

function Harness() {
  const wm = useWindowManager();
  return (
    <>
      <WelcomeApp />
      <span data-testid="apps">{wm.state.windows.map((w) => w.appKey).join(',')}</span>
    </>
  );
}

describe('WelcomeApp', () => {
  it('greets the visitor', () => {
    render(<WindowManagerProvider><WelcomeApp /></WindowManagerProvider>);
    expect(screen.getByText(/Welcome to my desktop/i)).toBeInTheDocument();
  });

  it('has three CTA buttons', () => {
    render(<WindowManagerProvider><WelcomeApp /></WindowManagerProvider>);
    expect(screen.getByRole('button', { name: /View Résumé/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Contact Me/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Explore Projects/i })).toBeInTheDocument();
  });

  it('opens the résumé when its CTA is clicked', async () => {
    render(<WindowManagerProvider><Harness /></WindowManagerProvider>);
    await userEvent.click(screen.getByRole('button', { name: /View Résumé/i }));
    expect(screen.getByTestId('apps')).toHaveTextContent('resume');
  });
});

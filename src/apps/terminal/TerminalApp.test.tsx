import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WindowManagerProvider, useWindowManager } from '../../window-manager/WindowManagerContext';
import { TerminalApp } from './TerminalApp';

function Harness() {
  const wm = useWindowManager();
  return (
    <>
      <TerminalApp />
      <span data-testid="open-count">{wm.state.windows.length}</span>
    </>
  );
}

describe('TerminalApp', () => {
  it('shows the Jo-DOS banner', () => {
    render(<WindowManagerProvider><TerminalApp /></WindowManagerProvider>);
    expect(screen.getByText(/Jo-DOS/)).toBeInTheDocument();
  });

  it('echoes a bad command', async () => {
    render(<WindowManagerProvider><TerminalApp /></WindowManagerProvider>);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'frobnicate{Enter}');
    expect(screen.getByText(/Bad command or file name/)).toBeInTheDocument();
  });

  it('opens a window when a nav command runs', async () => {
    render(<WindowManagerProvider><Harness /></WindowManagerProvider>);
    await userEvent.type(screen.getByRole('textbox'), 'about{Enter}');
    expect(screen.getByTestId('open-count')).toHaveTextContent('1');
  });

  it('clears the scrollback on clear', async () => {
    render(<WindowManagerProvider><TerminalApp /></WindowManagerProvider>);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'whoami{Enter}');
    expect(screen.getByText(/Jo Gurvantamir/)).toBeInTheDocument();
    await userEvent.type(input, 'clear{Enter}');
    expect(screen.queryByText(/Jo Gurvantamir/)).not.toBeInTheDocument();
  });
});

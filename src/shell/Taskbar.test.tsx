import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WindowManagerProvider } from '../window-manager/WindowManagerContext';
import { Desktop } from './Desktop';
import { Taskbar } from './Taskbar';

function App() {
  return (
    <WindowManagerProvider>
      <Desktop />
      <Taskbar />
    </WindowManagerProvider>
  );
}

describe('Taskbar', () => {
  it('shows the Start button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('opening a window adds a taskbar button for it', async () => {
    render(<App />);
    await userEvent.dblClick(screen.getByText('About Me'));
    // scope to the taskbar so we don't match the desktop icon of the same name
    const taskbar = screen.getByRole('toolbar', { name: 'Taskbar' });
    expect(within(taskbar).getByRole('button', { name: /About Me/ })).toBeInTheDocument();
  });

  it('Start button toggles the start menu', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /start/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});

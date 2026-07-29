import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WindowManagerProvider } from '../window-manager/WindowManagerContext';
import { DisplayProvider } from './DisplayContext';
import { Desktop } from './Desktop';
import { Taskbar } from './Taskbar';

function App() {
  return (
    <DisplayProvider>
      <WindowManagerProvider>
        <Desktop />
        <Taskbar />
      </WindowManagerProvider>
    </DisplayProvider>
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

  describe('sound toggle', () => {
    beforeEach(() => localStorage.clear());

    it('starts muted', () => {
      render(<App />);
      expect(screen.getByRole('button', { name: 'Turn sound on' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    });

    it('toggles and persists the preference', async () => {
      render(<App />);
      await userEvent.click(screen.getByRole('button', { name: 'Turn sound on' }));

      const off = screen.getByRole('button', { name: 'Turn sound off' });
      expect(off).toHaveAttribute('aria-pressed', 'true');
      expect(localStorage.getItem('jo95:sound')).toBe('true');

      await userEvent.click(off);
      expect(screen.getByRole('button', { name: 'Turn sound on' })).toBeInTheDocument();
      expect(localStorage.getItem('jo95:sound')).toBe('false');
    });

    it('reflects a previously saved preference on load', () => {
      localStorage.setItem('jo95:sound', 'true');
      render(<App />);
      expect(screen.getByRole('button', { name: 'Turn sound off' })).toBeInTheDocument();
    });
  });
});

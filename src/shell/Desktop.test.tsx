import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WindowManagerProvider } from '../window-manager/WindowManagerContext';
import { Desktop } from './Desktop';

describe('Desktop', () => {
  it('renders all core desktop icons', () => {
    render(<WindowManagerProvider><Desktop /></WindowManagerProvider>);
    ['About Me', 'My Projects', 'Résumé', 'Contact', 'Jo-DOS Prompt', 'Recycle Bin'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('double-clicking an icon opens its window', async () => {
    render(<WindowManagerProvider><Desktop /></WindowManagerProvider>);
    await userEvent.dblClick(screen.getByText('About Me'));
    expect(screen.getByRole('dialog', { name: 'About Me' })).toBeInTheDocument();
  });
});

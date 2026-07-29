import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WindowManagerProvider } from '../window-manager/WindowManagerContext';
import { DisplayProvider } from './DisplayContext';
import { Desktop } from './Desktop';

describe('Desktop', () => {
  it('renders all core desktop icons', () => {
    render(<DisplayProvider><WindowManagerProvider><Desktop /></WindowManagerProvider></DisplayProvider>);
    ['About Me', 'My Projects', 'Résumé', 'Contact', 'Jo-DOS Prompt', 'Recycle Bin'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('double-clicking an icon opens its window', async () => {
    render(<DisplayProvider><WindowManagerProvider><Desktop /></WindowManagerProvider></DisplayProvider>);
    await userEvent.dblClick(screen.getByText('About Me'));
    expect(screen.getByRole('dialog', { name: 'About Me' })).toBeInTheDocument();
  });

  it('right-clicking the desktop background opens the context menu', async () => {
    const { container } = render(<DisplayProvider><WindowManagerProvider><Desktop /></WindowManagerProvider></DisplayProvider>);
    await userEvent.pointer({ target: container.querySelector('.desktop')!, keys: '[MouseRight]' });
    expect(screen.getByRole('menu', { name: 'Desktop' })).toBeInTheDocument();
  });

  it('right-clicking inside a window leaves the native menu alone', async () => {
    const { container } = render(<DisplayProvider><WindowManagerProvider><Desktop /></WindowManagerProvider></DisplayProvider>);
    await userEvent.dblClick(screen.getByText('About Me'));
    await userEvent.pointer({ target: screen.getByRole('dialog', { name: 'About Me' }), keys: '[MouseRight]' });
    expect(screen.queryByRole('menu', { name: 'Desktop' })).not.toBeInTheDocument();
    expect(container).toBeTruthy();
  });

  it('Close All Windows closes every open window', async () => {
    const { container } = render(<DisplayProvider><WindowManagerProvider><Desktop /></WindowManagerProvider></DisplayProvider>);
    await userEvent.dblClick(screen.getByText('About Me'));
    await userEvent.dblClick(screen.getByText('Contact'));
    expect(screen.getAllByRole('dialog')).toHaveLength(2);

    await userEvent.pointer({ target: container.querySelector('.desktop')!, keys: '[MouseRight]' });
    await userEvent.click(screen.getByRole('menuitem', { name: 'Close All Windows' }));

    expect(screen.queryAllByRole('dialog')).toHaveLength(0);
  });

  it('Properties opens Display Properties', async () => {
    const { container } = render(<DisplayProvider><WindowManagerProvider><Desktop /></WindowManagerProvider></DisplayProvider>);
    await userEvent.pointer({ target: container.querySelector('.desktop')!, keys: '[MouseRight]' });
    await userEvent.click(screen.getByRole('menuitem', { name: 'Properties' }));
    expect(screen.getByRole('dialog', { name: 'Display Properties' })).toBeInTheDocument();
  });

  it('Arrange Icons clears the persisted layout', async () => {
    localStorage.setItem('jo95:iconPositions', JSON.stringify({ about: { x: 400, y: 300 } }));
    const { container } = render(<DisplayProvider><WindowManagerProvider><Desktop /></WindowManagerProvider></DisplayProvider>);

    await userEvent.pointer({ target: container.querySelector('.desktop')!, keys: '[MouseRight]' });
    await userEvent.click(screen.getByRole('menuitem', { name: 'Arrange Icons' }));

    expect(JSON.parse(localStorage.getItem('jo95:iconPositions')!)).toEqual({});
  });
});

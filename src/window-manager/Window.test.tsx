import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Window } from './Window';
import type { WindowState } from '../types';

const win: WindowState = {
  id: 'win-1', appKey: 'about', title: 'About Me', icon: '👤',
  x: 40, y: 40, width: 400, height: 300, z: 1, minimized: false, maximized: false,
};

function setup() {
  const handlers = { onClose: vi.fn(), onMinimize: vi.fn(), onToggleMaximize: vi.fn(), onFocus: vi.fn(), onMove: vi.fn(), onResize: vi.fn() };
  render(
    <Window win={win} focused isMobile={false} {...handlers}>
      <p>Body content</p>
    </Window>,
  );
  return handlers;
}

describe('Window', () => {
  it('renders the title and body', () => {
    setup();
    // title renders as "👤 About Me", so match a substring, not an exact string
    expect(screen.getByText(/About Me/)).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('close button calls onClose', async () => {
    const h = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(h.onClose).toHaveBeenCalledWith('win-1');
  });

  it('minimize button calls onMinimize', async () => {
    const h = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Minimize' }));
    expect(h.onMinimize).toHaveBeenCalledWith('win-1');
  });

  it('maximize button calls onToggleMaximize', async () => {
    const h = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Maximize' }));
    expect(h.onToggleMaximize).toHaveBeenCalledWith('win-1');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DesktopIcon } from './DesktopIcon';

describe('DesktopIcon', () => {
  it('renders at the supplied absolute position', () => {
    render(<DesktopIcon icon="🖥️" label="Jo-DOS" position={{ x: 40, y: 80 }} onOpen={() => {}} onMove={() => {}} />);
    const btn = screen.getByRole('button', { name: /Jo-DOS/ });
    expect(btn).toHaveStyle({ left: '40px', top: '80px' });
  });

  it('opens on double-click', async () => {
    const onOpen = vi.fn();
    render(<DesktopIcon icon="🖥️" label="Jo-DOS" position={{ x: 0, y: 0 }} onOpen={onOpen} onMove={() => {}} />);
    await userEvent.dblClick(screen.getByRole('button', { name: /Jo-DOS/ }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('opens on Enter for keyboard users', async () => {
    const onOpen = vi.fn();
    render(<DesktopIcon icon="🖥️" label="Jo-DOS" position={{ x: 0, y: 0 }} onOpen={onOpen} onMove={() => {}} />);
    screen.getByRole('button', { name: /Jo-DOS/ }).focus();
    await userEvent.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DesktopIcon } from './DesktopIcon';

const noop = () => {};

describe('DesktopIcon', () => {
  it('renders at the supplied absolute position when draggable', () => {
    render(<DesktopIcon icon="🖥️" label="Jo-DOS" position={{ x: 40, y: 80 }} draggable onOpen={noop} onMove={noop} onMoveEnd={noop} />);
    const btn = screen.getByRole('button', { name: /Jo-DOS/ });
    expect(btn).toHaveStyle({ left: '40px', top: '80px' });
  });

  it('flows (no absolute positioning) when not draggable', () => {
    render(<DesktopIcon icon="🖥️" label="Jo-DOS" position={{ x: 40, y: 80 }} draggable={false} onOpen={noop} onMove={noop} onMoveEnd={noop} />);
    const btn = screen.getByRole('button', { name: /Jo-DOS/ });
    expect(btn).not.toHaveStyle({ position: 'absolute' });
    expect(btn.style.left).toBe('');
  });

  it('opens on double-click', async () => {
    const onOpen = vi.fn();
    render(<DesktopIcon icon="🖥️" label="Jo-DOS" position={{ x: 0, y: 0 }} draggable onOpen={onOpen} onMove={noop} onMoveEnd={noop} />);
    await userEvent.dblClick(screen.getByRole('button', { name: /Jo-DOS/ }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('opens on Enter for keyboard users', async () => {
    const onOpen = vi.fn();
    render(<DesktopIcon icon="🖥️" label="Jo-DOS" position={{ x: 0, y: 0 }} draggable onOpen={onOpen} onMove={noop} onMoveEnd={noop} />);
    screen.getByRole('button', { name: /Jo-DOS/ }).focus();
    await userEvent.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});

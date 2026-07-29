import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContextMenu } from './ContextMenu';

const items = [
  { label: 'Arrange Icons', onSelect: vi.fn() },
  { label: 'Close All Windows', onSelect: vi.fn() },
];

describe('ContextMenu', () => {
  it('renders every item as a menuitem', () => {
    render(<ContextMenu x={10} y={10} items={items} onClose={vi.fn()} />);
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
    expect(screen.getByRole('menuitem', { name: 'Arrange Icons' })).toBeInTheDocument();
  });

  it('runs the item action and then closes', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<ContextMenu x={0} y={0} items={[{ label: 'Refresh', onSelect }]} onClose={onClose} />);

    await user.click(screen.getByRole('menuitem', { name: 'Refresh' }));

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ContextMenu x={0} y={0} items={items} onClose={onClose} />);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes when clicking away', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <>
        <button>outside</button>
        <ContextMenu x={0} y={0} items={items} onClose={onClose} />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'outside' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('clamps its position so it stays inside the viewport', () => {
    render(<ContextMenu x={99999} y={99999} items={items} onClose={vi.fn()} />);
    const menu = screen.getByRole('menu');
    expect(parseInt(menu.style.left, 10)).toBeLessThanOrEqual(window.innerWidth);
    expect(parseInt(menu.style.top, 10)).toBeLessThanOrEqual(window.innerHeight);
  });
});

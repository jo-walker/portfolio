import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BootScreen } from './BootScreen';

describe('BootScreen', () => {
  it('shows the Jo-DOS startup text', () => {
    render(<BootScreen onDone={() => {}} />);
    expect(screen.getByText(/Starting Jo-DOS/i)).toBeInTheDocument();
  });

  it('calls onDone when clicked (skip)', async () => {
    const onDone = vi.fn();
    render(<BootScreen onDone={onDone} />);
    await userEvent.click(screen.getByRole('button', { name: /skip/i }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

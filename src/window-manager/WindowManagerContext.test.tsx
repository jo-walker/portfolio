import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { WindowManagerProvider, useWindowManager } from './WindowManagerContext';

function Probe() {
  const wm = useWindowManager();
  return (
    <div>
      <button onClick={() => wm.openApp('about')}>open</button>
      <span data-testid="count">{wm.state.windows.length}</span>
      <span data-testid="focused">{wm.state.focusedId ?? 'none'}</span>
    </div>
  );
}

describe('WindowManagerProvider', () => {
  it('openApp adds a window from the registry and focuses it', () => {
    render(
      <WindowManagerProvider>
        <Probe />
      </WindowManagerProvider>,
    );
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    act(() => {
      screen.getByText('open').click();
    });
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('focused')).toHaveTextContent('win-1');
  });
});

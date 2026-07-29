import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DisplayProvider } from '../shell/DisplayContext';
import { DisplayApp } from './DisplayApp';

function open() {
  return render(<DisplayProvider><DisplayApp /></DisplayProvider>);
}

describe('DisplayApp', () => {
  beforeEach(() => localStorage.clear());

  it('opens on the current wallpaper', () => {
    open();
    expect(screen.getByRole('option', { name: 'Steppe' })).toHaveAttribute('aria-selected', 'true');
  });

  it('changing the wallpaper persists it', async () => {
    open();
    await userEvent.click(screen.getByRole('option', { name: 'Grass' }));

    expect(screen.getByRole('option', { name: 'Grass' })).toHaveAttribute('aria-selected', 'true');
    expect(JSON.parse(localStorage.getItem('jo95:display')!).wallpaper).toBe('grass');
  });

  it('changing the fit persists it', async () => {
    open();
    await userEvent.click(screen.getByLabelText('Tile'));
    expect(JSON.parse(localStorage.getItem('jo95:display')!).fit).toBe('tile');
  });

  it('updates the monitor preview to match the selection', async () => {
    const { container } = open();
    const screenEl = () => container.querySelector('.display-screen') as HTMLElement;
    expect(screenEl().style.backgroundImage).toContain('wallpaper.webp');

    await userEvent.click(screen.getByRole('option', { name: '(None)' }));

    expect(screenEl().style.backgroundImage).toBe('none');
  });

  it('disables the fit options when there is no wallpaper', async () => {
    open();
    await userEvent.click(screen.getByRole('option', { name: '(None)' }));
    expect(screen.getByLabelText('Tile')).toBeDisabled();
  });

  it('toggles the drifting clouds and persists the choice', async () => {
    const { container } = open();
    expect(container.querySelector('.desktop-clouds')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Drifting clouds'));

    expect(container.querySelector('.desktop-clouds')).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('jo95:display')!).animate).toBe(false);
  });

  it('explains why clouds are unavailable on a wallpaper without sky', async () => {
    open();
    await userEvent.click(screen.getByRole('option', { name: 'Grass' }));

    expect(screen.getByLabelText('Drifting clouds')).toBeDisabled();
    expect(screen.getByText(/Clouds need the Steppe wallpaper/i)).toBeInTheDocument();
  });
});

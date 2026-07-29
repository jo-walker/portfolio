import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WindowManagerProvider } from '../window-manager/WindowManagerContext';
import { DisplayProvider } from '../shell/DisplayContext';
import { Desktop } from '../shell/Desktop';

describe('ProjectsApp', () => {
  it('lists project folders and opens a detail window on double-click', async () => {
    render(<DisplayProvider><WindowManagerProvider><Desktop /></WindowManagerProvider></DisplayProvider>);
    await userEvent.dblClick(screen.getByText('My Projects'));
    // A known project appears in the folder
    const parkopticon = await screen.findByText('Parkopticon');
    await userEvent.dblClick(parkopticon);
    // Its detail window opens showing the tagline
    expect(await screen.findByText(/Find parking/i)).toBeInTheDocument();
  });
});

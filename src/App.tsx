import { WindowManagerProvider } from './window-manager/WindowManagerContext';
import { Desktop } from './shell/Desktop';
import { Taskbar } from './shell/Taskbar';

export function App() {
  return (
    <WindowManagerProvider>
      <Desktop />
      <Taskbar />
    </WindowManagerProvider>
  );
}

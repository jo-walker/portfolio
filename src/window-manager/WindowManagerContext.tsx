import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { AppKey, WMState } from '../types';
import { wmReducer, initialWMState } from './reducer';
import { WINDOW_DEFAULTS } from '../apps/registry';

interface WindowManagerValue {
  state: WMState;
  openApp: (appKey: AppKey, props?: Record<string, unknown>, titleOverride?: string) => void;
  close: (id: string) => void;
  focus: (id: string) => void;
  minimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  resize: (id: string, width: number, height: number) => void;
}

const WindowManagerContext = createContext<WindowManagerValue | null>(null);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wmReducer, initialWMState);

  const openApp = useCallback(
    (appKey: AppKey, props?: Record<string, unknown>, titleOverride?: string) => {
      const def = WINDOW_DEFAULTS[appKey];
      dispatch({
        type: 'OPEN',
        appKey,
        title: titleOverride ?? def.title,
        icon: def.icon,
        width: def.width,
        height: def.height,
        singleton: def.singleton,
        props,
      });
    },
    [],
  );

  const close = useCallback((id: string) => dispatch({ type: 'CLOSE', id }), []);
  const focus = useCallback((id: string) => dispatch({ type: 'FOCUS', id }), []);
  const minimize = useCallback((id: string) => dispatch({ type: 'MINIMIZE', id }), []);
  const toggleMaximize = useCallback((id: string) => dispatch({ type: 'TOGGLE_MAXIMIZE', id }), []);
  const move = useCallback((id: string, x: number, y: number) => dispatch({ type: 'MOVE', id, x, y }), []);
  const resize = useCallback(
    (id: string, width: number, height: number) => dispatch({ type: 'RESIZE', id, width, height }),
    [],
  );

  return (
    <WindowManagerContext.Provider
      value={{ state, openApp, close, focus, minimize, toggleMaximize, move, resize }}
    >
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager(): WindowManagerValue {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error('useWindowManager must be used within WindowManagerProvider');
  return ctx;
}

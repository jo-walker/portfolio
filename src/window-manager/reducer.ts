import type { WMState, WMAction, WindowState } from '../types';

export const initialWMState: WMState = {
  windows: [],
  focusedId: null,
  zCounter: 0,
  nextId: 1,
};

function topWindowId(windows: WindowState[]): string | null {
  if (windows.length === 0) return null;
  return windows.reduce((top, w) => (w.z > top.z ? w : top)).id;
}

function focusWindow(state: WMState, id: string): WMState {
  if (!state.windows.some((w) => w.id === id)) return state;
  const z = state.zCounter + 1;
  const windows = state.windows.map((w) =>
    w.id === id ? { ...w, z, minimized: false } : w,
  );
  return { ...state, windows, focusedId: id, zCounter: z };
}

export function wmReducer(state: WMState, action: WMAction): WMState {
  switch (action.type) {
    case 'OPEN': {
      if (action.singleton) {
        const existing = state.windows.find((w) => w.appKey === action.appKey);
        if (existing) return focusWindow(state, existing.id);
      }
      const id = `win-${state.nextId}`;
      const z = state.zCounter + 1;
      const offset = ((state.nextId - 1) % 6) * 24;
      const win: WindowState = {
        id,
        appKey: action.appKey,
        title: action.title,
        icon: action.icon,
        x: 80 + offset,
        y: 60 + offset,
        width: action.width,
        height: action.height,
        z,
        minimized: false,
        maximized: false,
        props: action.props,
      };
      return {
        ...state,
        windows: [...state.windows, win],
        focusedId: id,
        zCounter: z,
        nextId: state.nextId + 1,
      };
    }
    case 'CLOSE': {
      const windows = state.windows.filter((w) => w.id !== action.id);
      const focusedId =
        state.focusedId === action.id ? topWindowId(windows.filter((w) => !w.minimized)) : state.focusedId;
      return { ...state, windows, focusedId };
    }
    case 'FOCUS':
      return focusWindow(state, action.id);
    case 'MINIMIZE': {
      const windows = state.windows.map((w) =>
        w.id === action.id ? { ...w, minimized: true } : w,
      );
      const focusedId =
        state.focusedId === action.id
          ? topWindowId(windows.filter((w) => !w.minimized))
          : state.focusedId;
      return { ...state, windows, focusedId };
    }
    case 'TOGGLE_MAXIMIZE': {
      const windows = state.windows.map((w) => {
        if (w.id !== action.id) return w;
        if (w.maximized) {
          const prev = w.prev ?? { x: w.x, y: w.y, width: w.width, height: w.height };
          return { ...w, maximized: false, ...prev, prev: undefined };
        }
        return { ...w, maximized: true, prev: { x: w.x, y: w.y, width: w.width, height: w.height } };
      });
      return { ...state, windows };
    }
    case 'MOVE': {
      const windows = state.windows.map((w) =>
        w.id === action.id && !w.maximized ? { ...w, x: action.x, y: action.y } : w,
      );
      return { ...state, windows };
    }
    case 'RESIZE': {
      const windows = state.windows.map((w) =>
        w.id === action.id && !w.maximized
          ? { ...w, width: Math.max(160, action.width), height: Math.max(120, action.height) }
          : w,
      );
      return { ...state, windows };
    }
    default:
      return state;
  }
}

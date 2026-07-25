export type AppKey =
  | 'about'
  | 'projects'
  | 'projectDetail'
  | 'resume'
  | 'contact'
  | 'recycleBin'
  | 'terminal'
  | 'welcome';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  appKey: AppKey;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  prev?: Rect;                      // rect saved before maximize
  props?: Record<string, unknown>; // e.g. projectDetail: { projectId }
}

export interface WMState {
  windows: WindowState[];
  focusedId: string | null;
  zCounter: number;
  nextId: number;
}

export type WMAction =
  | { type: 'OPEN'; appKey: AppKey; title: string; icon: string; width: number; height: number; singleton?: boolean; props?: Record<string, unknown> }
  | { type: 'CLOSE'; id: string }
  | { type: 'FOCUS'; id: string }
  | { type: 'MINIMIZE'; id: string }
  | { type: 'TOGGLE_MAXIMIZE'; id: string }
  | { type: 'MOVE'; id: string; x: number; y: number }
  | { type: 'RESIZE'; id: string; width: number; height: number };

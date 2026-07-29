import { describe, it, expect } from 'vitest';
import { wmReducer, initialWMState } from './reducer';
import type { AppKey } from '../types';

const open = (appKey: AppKey = 'about', extra = {}) =>
  ({ type: 'OPEN', appKey, title: 'T', icon: '👤', width: 400, height: 300, ...extra }) as const;

describe('wmReducer', () => {
  it('OPEN adds a focused window with id win-1 and z 1', () => {
    const s = wmReducer(initialWMState, open());
    expect(s.windows).toHaveLength(1);
    expect(s.windows[0].id).toBe('win-1');
    expect(s.windows[0].z).toBe(1);
    expect(s.windows[0].minimized).toBe(false);
    expect(s.focusedId).toBe('win-1');
  });

  it('OPEN twice creates two windows and focuses the second (higher z)', () => {
    let s = wmReducer(initialWMState, open());
    s = wmReducer(s, open('contact'));
    expect(s.windows).toHaveLength(2);
    expect(s.focusedId).toBe('win-2');
    expect(s.windows[1].z).toBeGreaterThan(s.windows[0].z);
  });

  it('OPEN singleton focuses the existing window instead of duplicating', () => {
    let s = wmReducer(initialWMState, open('about', { singleton: true }));
    s = wmReducer(s, open('about', { singleton: true }));
    expect(s.windows).toHaveLength(1);
    expect(s.focusedId).toBe('win-1');
  });

  it('FOCUS raises z and restores a minimized window', () => {
    let s = wmReducer(initialWMState, open());
    s = wmReducer(s, open('contact'));
    s = wmReducer(s, { type: 'MINIMIZE', id: 'win-1' });
    expect(s.windows.find((w) => w.id === 'win-1')!.minimized).toBe(true);
    s = wmReducer(s, { type: 'FOCUS', id: 'win-1' });
    const w1 = s.windows.find((w) => w.id === 'win-1')!;
    const w2 = s.windows.find((w) => w.id === 'win-2')!;
    expect(w1.minimized).toBe(false);
    expect(s.focusedId).toBe('win-1');
    expect(w1.z).toBeGreaterThan(w2.z);
  });

  it('MINIMIZE moves focus to the top remaining visible window', () => {
    let s = wmReducer(initialWMState, open());
    s = wmReducer(s, open('contact'));
    s = wmReducer(s, { type: 'MINIMIZE', id: 'win-2' });
    expect(s.focusedId).toBe('win-1');
  });

  it('TOGGLE_MAXIMIZE saves and restores the previous rect', () => {
    let s = wmReducer(initialWMState, open());
    const before = { ...s.windows[0] };
    s = wmReducer(s, { type: 'TOGGLE_MAXIMIZE', id: 'win-1' });
    expect(s.windows[0].maximized).toBe(true);
    s = wmReducer(s, { type: 'TOGGLE_MAXIMIZE', id: 'win-1' });
    expect(s.windows[0].maximized).toBe(false);
    expect(s.windows[0].x).toBe(before.x);
    expect(s.windows[0].width).toBe(before.width);
  });

  it('MOVE updates position but is ignored while maximized', () => {
    let s = wmReducer(initialWMState, open());
    s = wmReducer(s, { type: 'MOVE', id: 'win-1', x: 200, y: 150 });
    expect(s.windows[0].x).toBe(200);
    s = wmReducer(s, { type: 'TOGGLE_MAXIMIZE', id: 'win-1' });
    s = wmReducer(s, { type: 'MOVE', id: 'win-1', x: 999, y: 999 });
    expect(s.windows[0].x).not.toBe(999);
  });

  it('RESIZE clamps to minimum dimensions', () => {
    let s = wmReducer(initialWMState, open());
    s = wmReducer(s, { type: 'RESIZE', id: 'win-1', width: 10, height: 10 });
    expect(s.windows[0].width).toBe(160);
    expect(s.windows[0].height).toBe(120);
  });

  it('CLOSE removes the window and refocuses the top remaining', () => {
    let s = wmReducer(initialWMState, open());
    s = wmReducer(s, open('contact'));
    s = wmReducer(s, { type: 'CLOSE', id: 'win-2' });
    expect(s.windows).toHaveLength(1);
    expect(s.focusedId).toBe('win-1');
  });
});

describe('CLOSE_ALL', () => {
  it('removes every window and clears focus', () => {
    let s = wmReducer(initialWMState, { type: 'OPEN', appKey: 'about', title: 'About Me', icon: '👤', width: 400, height: 300 });
    s = wmReducer(s, { type: 'OPEN', appKey: 'contact', title: 'Contact', icon: '✉️', width: 400, height: 300 });
    expect(s.windows).toHaveLength(2);

    const closed = wmReducer(s, { type: 'CLOSE_ALL' });

    expect(closed.windows).toEqual([]);
    expect(closed.focusedId).toBeNull();
  });
});

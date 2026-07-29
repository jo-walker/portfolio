import { describe, it, expect, beforeEach } from 'vitest';
import { clearPositions, defaultPosition, loadPositions, savePosition } from './iconLayout';

describe('iconLayout', () => {
  beforeEach(() => localStorage.clear());

  it('computes a default grid position from an index', () => {
    expect(defaultPosition(0)).toEqual({ x: 16, y: 16 });
    expect(defaultPosition(2)).toEqual({ x: 16, y: 16 + 2 * 96 });
  });

  it('returns an empty map when nothing is stored', () => {
    expect(loadPositions()).toEqual({});
  });

  it('persists and reloads a saved position', () => {
    savePosition('terminal', { x: 200, y: 120 });
    expect(loadPositions()).toEqual({ terminal: { x: 200, y: 120 } });
  });

  it('merges multiple saved positions', () => {
    savePosition('about', { x: 10, y: 20 });
    savePosition('terminal', { x: 200, y: 120 });
    expect(loadPositions()).toEqual({ about: { x: 10, y: 20 }, terminal: { x: 200, y: 120 } });
  });

  it('clears persisted positions so defaults apply after a reload', () => {
    savePosition('about', { x: 10, y: 20 });
    savePosition('terminal', { x: 200, y: 120 });
    clearPositions();
    expect(loadPositions()).toEqual({});
  });
});

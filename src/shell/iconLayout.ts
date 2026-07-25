import type { AppKey } from '../types';
import { storage } from '../lib/storage';

export interface Point { x: number; y: number; }
export type IconPositions = Partial<Record<AppKey, Point>>;

const KEY = 'iconPositions';
const GRID_X = 16;
const GRID_Y = 16;
const ROW_H = 96;

export function defaultPosition(index: number): Point {
  return { x: GRID_X, y: GRID_Y + index * ROW_H };
}

export function loadPositions(): IconPositions {
  return storage.get<IconPositions>(KEY, {});
}

export function savePosition(key: AppKey, point: Point): void {
  const next = { ...loadPositions(), [key]: point };
  storage.set(KEY, next);
}

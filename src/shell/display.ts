import type { CSSProperties } from 'react';
import { storage } from '../lib/storage';

export type WallpaperId = 'steppe' | 'grass' | 'none';
export type WallpaperFit = 'tile' | 'center' | 'stretch';

export interface DisplaySettings {
  wallpaper: WallpaperId;
  fit: WallpaperFit;
  animate: boolean;
}

/** Defaults reproduce the shipped look exactly, so a visitor with no saved
 *  settings sees what they'd have seen before Display Properties existed. */
export const DEFAULT_SETTINGS: DisplaySettings = {
  wallpaper: 'steppe',
  fit: 'stretch',
  animate: true,
};

export const WALLPAPERS: { id: WallpaperId; label: string }[] = [
  { id: 'steppe', label: 'Steppe' },
  { id: 'grass', label: 'Grass' },
  { id: 'none', label: '(None)' },
];

export const FITS: { id: WallpaperFit; label: string }[] = [
  { id: 'tile', label: 'Tile' },
  { id: 'center', label: 'Center' },
  { id: 'stretch', label: 'Stretch' },
];

const KEY = 'display';

// Resolved against Vite's base so these keep working under /portfolio/ and at
// a bare root. Not plain '/wallpaper.webp' — Vite rewrites CSS url() for the
// base, but not string literals in TS.
const FILES: Record<Exclude<WallpaperId, 'none'>, string> = {
  steppe: `${import.meta.env.BASE_URL}wallpaper.webp`,
  grass: `${import.meta.env.BASE_URL}wallpaper-tile.webp`,
};

export function loadSettings(): DisplaySettings {
  const saved = storage.get<Partial<DisplaySettings>>(KEY, {});
  return {
    // Spread-with-validation: a stale or hand-edited key must not wedge the desktop.
    wallpaper: WALLPAPERS.some((w) => w.id === saved.wallpaper)
      ? (saved.wallpaper as WallpaperId)
      : DEFAULT_SETTINGS.wallpaper,
    fit: FITS.some((f) => f.id === saved.fit) ? (saved.fit as WallpaperFit) : DEFAULT_SETTINGS.fit,
    animate: typeof saved.animate === 'boolean' ? saved.animate : DEFAULT_SETTINGS.animate,
  };
}

export function saveSettings(settings: DisplaySettings): void {
  storage.set(KEY, settings);
}

/**
 * The `.desktop` background for a given set of settings.
 *
 * Layers, top to bottom: a shade that keeps white icon labels legible, then
 * the wallpaper, over teal. The 256-colour dither is a separate element on
 * top so it also covers the animated cloud layer.
 */
export function backgroundStyle(settings: DisplaySettings): CSSProperties {
  const teal = '#008080';
  if (settings.wallpaper === 'none') {
    return { backgroundColor: teal, backgroundImage: 'none' };
  }

  const url = `url('${FILES[settings.wallpaper]}')`;

  // Tile shows bright grass edge to edge, so it needs the most help; centre
  // leaves teal margins that are already dark enough for white labels.
  const shadeAlpha = settings.fit === 'tile' ? 0.5 : settings.fit === 'center' ? 0.22 : 0.42;
  const shade = `linear-gradient(160deg, rgba(0, 40, 60, ${shadeAlpha}) 0%, rgba(0, 40, 60, ${(
    shadeAlpha * 0.25
  ).toFixed(3)}) 45%, transparent 70%)`;

  const perFit: Record<WallpaperFit, CSSProperties> = {
    tile: { backgroundSize: 'auto, 256px 256px', backgroundRepeat: 'no-repeat, repeat' },
    center: { backgroundSize: 'auto, auto', backgroundRepeat: 'no-repeat, no-repeat' },
    stretch: { backgroundSize: 'auto, cover', backgroundRepeat: 'no-repeat, no-repeat' },
  };

  return {
    backgroundColor: teal,
    backgroundImage: `${shade}, ${url}`,
    backgroundPosition: 'center, center',
    ...perFit[settings.fit],
  };
}

/** Clouds drift only over the wide sky — pointless on a tile, absent on teal. */
export function showsClouds(settings: DisplaySettings, reducedMotion: boolean): boolean {
  if (!settings.animate || reducedMotion) return false;
  return settings.wallpaper === 'steppe';
}

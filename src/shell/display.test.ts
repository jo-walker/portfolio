import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_SETTINGS,
  backgroundStyle,
  loadSettings,
  saveSettings,
  showsClouds,
  type DisplaySettings,
} from './display';

const settings = (patch: Partial<DisplaySettings> = {}): DisplaySettings => ({
  ...DEFAULT_SETTINGS,
  ...patch,
});

describe('display settings storage', () => {
  beforeEach(() => localStorage.clear());

  it('falls back to the shipped defaults with nothing stored', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips saved settings', () => {
    const next = settings({ wallpaper: 'grass', fit: 'tile', animate: false });
    saveSettings(next);
    expect(loadSettings()).toEqual(next);
  });

  it('ignores invalid stored values rather than wedging the desktop', () => {
    localStorage.setItem(
      'jo95:display',
      JSON.stringify({ wallpaper: 'bliss', fit: 'diagonal', animate: 'yes' }),
    );
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps the valid half of a partially invalid record', () => {
    localStorage.setItem('jo95:display', JSON.stringify({ wallpaper: 'grass', fit: 'nope' }));
    const loaded = loadSettings();
    expect(loaded.wallpaper).toBe('grass');
    expect(loaded.fit).toBe(DEFAULT_SETTINGS.fit);
  });
});

describe('backgroundStyle', () => {
  it('renders bare teal with no wallpaper', () => {
    const style = backgroundStyle(settings({ wallpaper: 'none' }));
    expect(style.backgroundColor).toBe('#008080');
    expect(style.backgroundImage).toBe('none');
  });

  it('references the steppe image and keeps teal underneath', () => {
    const style = backgroundStyle(settings({ wallpaper: 'steppe' }));
    expect(style.backgroundImage).toContain('wallpaper.webp');
    expect(style.backgroundColor).toBe('#008080');
  });

  it('uses the tile asset at a fixed size and repeats it', () => {
    const style = backgroundStyle(settings({ wallpaper: 'grass', fit: 'tile' }));
    expect(style.backgroundImage).toContain('wallpaper-tile.webp');
    expect(style.backgroundSize).toContain('256px 256px');
    expect(style.backgroundRepeat).toContain('repeat');
  });

  it('covers the viewport when stretched and does not repeat', () => {
    const style = backgroundStyle(settings({ fit: 'stretch' }));
    expect(style.backgroundSize).toContain('cover');
    expect(style.backgroundRepeat).not.toContain(', repeat');
  });

  it('shades hardest for tile, where bright grass reaches the icon labels', () => {
    const alpha = (fit: DisplaySettings['fit']) => {
      const image = String(backgroundStyle(settings({ fit })).backgroundImage);
      return Number(image.match(/rgba\(0, 40, 60, ([\d.]+)\)/)![1]);
    };
    expect(alpha('tile')).toBeGreaterThan(alpha('stretch'));
    expect(alpha('stretch')).toBeGreaterThan(alpha('center'));
  });
});

describe('showsClouds', () => {
  it('drifts over the steppe when animation is on', () => {
    expect(showsClouds(settings({ animate: true }), false)).toBe(true);
  });

  it('stops when animation is switched off', () => {
    expect(showsClouds(settings({ animate: false }), false)).toBe(false);
  });

  it('never runs under prefers-reduced-motion, even if enabled', () => {
    expect(showsClouds(settings({ animate: true }), true)).toBe(false);
  });

  it('has no sky to drift over on the tile or on bare teal', () => {
    expect(showsClouds(settings({ wallpaper: 'grass' }), false)).toBe(false);
    expect(showsClouds(settings({ wallpaper: 'none' }), false)).toBe(false);
  });
});

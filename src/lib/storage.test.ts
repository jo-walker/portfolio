import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from './storage';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('reads a default when the key is unset', () => {
    expect(storage.get('welcomed', false)).toBe(false);
  });

  it('round-trips a value under the jo95: namespace', () => {
    storage.set('welcomed', true);
    expect(storage.get('welcomed', false)).toBe(true);
    expect(localStorage.getItem('jo95:welcomed')).toBe('true');
  });

  it('returns the default when stored JSON is corrupt', () => {
    localStorage.setItem('jo95:welcomed', '{not json');
    expect(storage.get('welcomed', 'fallback')).toBe('fallback');
  });
});

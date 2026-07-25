import { describe, it, expect } from 'vitest';
import { shouldBoot, shouldAutoWelcome } from './boot';

describe('shouldBoot', () => {
  it('boots on a fresh visit', () => {
    expect(shouldBoot({ search: '', reducedMotion: false, alreadyBooted: false })).toBe(true);
  });
  it('skips when ?noboot=1', () => {
    expect(shouldBoot({ search: '?noboot=1', reducedMotion: false, alreadyBooted: false })).toBe(false);
  });
  it('skips under reduced motion', () => {
    expect(shouldBoot({ search: '', reducedMotion: true, alreadyBooted: false })).toBe(false);
  });
  it('skips when already booted this session', () => {
    expect(shouldBoot({ search: '', reducedMotion: false, alreadyBooted: true })).toBe(false);
  });
});

describe('shouldAutoWelcome', () => {
  it('opens on first visit', () => {
    expect(shouldAutoWelcome({ search: '', welcomed: false })).toBe(true);
  });
  it('does not reopen for returning visitors', () => {
    expect(shouldAutoWelcome({ search: '', welcomed: true })).toBe(false);
  });
  it('is suppressed by ?nowelcome=1', () => {
    expect(shouldAutoWelcome({ search: '?nowelcome=1', welcomed: false })).toBe(false);
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isEnabled, setEnabled, play, resetForTests } from './sound';

/** Minimal Web Audio stub — enough to record that notes were scheduled. */
function stubAudio() {
  const started: number[] = [];
  const ctor = vi.fn(() => ({
    currentTime: 0,
    destination: {},
    resume: vi.fn(),
    createOscillator: () => ({
      type: '',
      frequency: { value: 0 },
      connect: (n: unknown) => n,
      start: (t: number) => started.push(t),
      stop: vi.fn(),
    }),
    createGain: () => ({
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: (n: unknown) => n,
    }),
  }));
  (window as unknown as { AudioContext: unknown }).AudioContext = ctor;
  return { started, ctor };
}

describe('sound', () => {
  beforeEach(() => {
    localStorage.clear();
    resetForTests();
    delete (window as unknown as { AudioContext?: unknown }).AudioContext;
  });

  afterEach(() => {
    delete (window as unknown as { AudioContext?: unknown }).AudioContext;
  });

  it('is off by default', () => {
    expect(isEnabled()).toBe(false);
  });

  it('persists the enabled flag', () => {
    stubAudio();
    setEnabled(true);
    expect(isEnabled()).toBe(true);
    setEnabled(false);
    expect(isEnabled()).toBe(false);
  });

  it('does not build an audio context while disabled', () => {
    const { ctor } = stubAudio();
    play('open');
    expect(ctor).not.toHaveBeenCalled();
  });

  it('schedules notes once enabled', () => {
    const { started } = stubAudio();
    setEnabled(true);
    started.length = 0; // ignore the confirmation chime from setEnabled
    play('error');
    expect(started).toHaveLength(2); // the error voice is two notes
  });

  it('plays a confirmation chime when switched on', () => {
    const { started } = stubAudio();
    setEnabled(true);
    expect(started.length).toBeGreaterThan(0);
  });

  it('is a silent no-op when Web Audio is unavailable', () => {
    localStorage.setItem('jo95:sound', 'true');
    expect(isEnabled()).toBe(true);
    expect(() => play('startup')).not.toThrow();
  });

  it('survives an audio context that throws', () => {
    (window as unknown as { AudioContext: unknown }).AudioContext = vi.fn(() => {
      throw new Error('blocked');
    });
    localStorage.setItem('jo95:sound', 'true');
    expect(() => play('open')).not.toThrow();
  });
});

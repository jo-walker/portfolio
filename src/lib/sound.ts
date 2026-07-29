import { storage } from './storage';

export type SoundName = 'startup' | 'open' | 'close' | 'error';

const KEY = 'sound';

/** Simple square-wave voices — a few dozen bytes of code instead of a WAV bundle. */
const VOICES: Record<SoundName, { freq: number; ms: number; delay: number }[]> = {
  startup: [
    { freq: 392, ms: 130, delay: 0 },
    { freq: 523, ms: 130, delay: 120 },
    { freq: 659, ms: 220, delay: 240 },
  ],
  open: [{ freq: 660, ms: 45, delay: 0 }],
  close: [{ freq: 440, ms: 45, delay: 0 }],
  error: [
    { freq: 180, ms: 90, delay: 0 },
    { freq: 140, ms: 140, delay: 100 },
  ],
};

let ctx: AudioContext | null = null;

/**
 * Created lazily, on the click that enables sound — that click is the user
 * gesture browsers require. A context built at page load starts suspended.
 * Returns null wherever Web Audio is unavailable (jsdom, locked-down browsers).
 */
function getContext(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor =
    typeof window !== 'undefined'
      ? window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      : undefined;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    return null;
  }
  return ctx;
}

export function isEnabled(): boolean {
  return storage.get<boolean>(KEY, false); // off by default — unsolicited audio is hostile
}

export function setEnabled(value: boolean): void {
  storage.set(KEY, value);
  if (value) {
    getContext()?.resume?.();
    play('startup'); // immediate confirmation, and we know we're inside a gesture
  }
}

export function play(name: SoundName): void {
  if (!isEnabled()) return;
  const audio = getContext();
  if (!audio) return;

  try {
    // A returning visitor already has sound enabled, so the first play() happens
    // at mount with no gesture behind it and the context is born suspended.
    // Resume on every play: the first one driven by a real interaction unsticks it.
    if (audio.state === 'suspended') audio.resume?.();

    const now = audio.currentTime;
    for (const note of VOICES[name]) {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'square';
      osc.frequency.value = note.freq;

      const start = now + note.delay / 1000;
      const end = start + note.ms / 1000;
      // Ramp down instead of hard-stopping, which would click.
      gain.gain.setValueAtTime(0.06, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      osc.connect(gain).connect(audio.destination);
      osc.start(start);
      osc.stop(end);
    }
  } catch {
    /* a dead audio context must never break the desktop */
  }
}

/** Test seam: drop the cached context so each test starts clean. */
export function resetForTests(): void {
  ctx = null;
}

import { describe, it, expect } from 'vitest';
import { runCommand } from './interpreter';

describe('runCommand', () => {
  it('lists commands on help', () => {
    const r = runCommand('help');
    expect(r.lines.join(' ')).toMatch(/about/);
    expect(r.lines.join(' ')).toMatch(/projects/);
    expect(r.action).toBeUndefined();
  });

  it('is case- and whitespace-insensitive', () => {
    expect(runCommand('  ABOUT  ').action).toEqual({ type: 'openApp', key: 'about' });
  });

  it('maps navigation commands to openApp actions', () => {
    expect(runCommand('projects').action).toEqual({ type: 'openApp', key: 'projects' });
    expect(runCommand('resume').action).toEqual({ type: 'openApp', key: 'resume' });
    expect(runCommand('contact').action).toEqual({ type: 'openApp', key: 'contact' });
  });

  it('returns a clear action', () => {
    expect(runCommand('clear').action).toEqual({ type: 'clear' });
  });

  it('answers whoami and ls without an action', () => {
    expect(runCommand('whoami').lines.join(' ')).toMatch(/Jo Gurvantamir/);
    expect(runCommand('ls').lines.join(' ')).toMatch(/about\.exe/);
  });

  it('has an easter egg for sudo', () => {
    expect(runCommand('sudo').lines.join(' ')).toMatch(/not in the sudoers/i);
  });

  it('rejects unknown commands the DOS way', () => {
    const r = runCommand('frobnicate');
    expect(r.lines.join(' ')).toMatch(/Bad command or file name/);
    expect(r.action).toBeUndefined();
  });

  it('treats blank input as a no-op', () => {
    expect(runCommand('   ')).toEqual({ lines: [] });
  });
});

describe('error flag', () => {
  it('marks an unknown command as an error', () => {
    expect(runCommand('solitaire').error).toBe(true);
  });

  it('does not mark known commands as errors', () => {
    ['help', 'whoami', 'ls', 'clear', 'about', 'sudo', 'exit'].forEach((cmd) => {
      expect(runCommand(cmd).error).toBeUndefined();
    });
  });
});

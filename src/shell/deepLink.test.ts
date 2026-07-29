import { describe, it, expect } from 'vitest';
import { parseOpenParam, openParamFor, withOpenParam } from './deepLink';

describe('parseOpenParam', () => {
  it('returns null when there is no open param', () => {
    expect(parseOpenParam('')).toBeNull();
    expect(parseOpenParam('?noboot=1')).toBeNull();
  });

  it('maps a known app key to a target', () => {
    expect(parseOpenParam('?open=resume')).toEqual({ appKey: 'resume' });
    expect(parseOpenParam('?open=terminal')).toEqual({ appKey: 'terminal' });
  });

  it('is case- and whitespace-insensitive', () => {
    expect(parseOpenParam('?open=%20Resume%20')).toEqual({ appKey: 'resume' });
  });

  it('maps project:<id> to a project detail window', () => {
    expect(parseOpenParam('?open=project:parkopticon')).toMatchObject({
      appKey: 'projectDetail',
      props: { projectId: 'parkopticon' },
    });
  });

  it('titles a linked project window after the project', () => {
    expect(parseOpenParam('?open=project:parkopticon')?.title).toBe('Parkopticon');
  });

  it('rejects an unknown app or project', () => {
    expect(parseOpenParam('?open=minesweeper')).toBeNull();
    expect(parseOpenParam('?open=project:not-a-real-project')).toBeNull();
    expect(parseOpenParam('?open=projectDetail')).toBeNull();
  });

  it('ignores other params around it', () => {
    expect(parseOpenParam('?noboot=1&open=about&nowelcome=1')).toEqual({ appKey: 'about' });
  });
});

describe('openParamFor', () => {
  it('round-trips a plain app window', () => {
    expect(openParamFor({ appKey: 'contact' })).toBe('contact');
    expect(parseOpenParam(`?open=${openParamFor({ appKey: 'contact' })}`)).toEqual({ appKey: 'contact' });
  });

  it('round-trips a project detail window', () => {
    const value = openParamFor({ appKey: 'projectDetail', props: { projectId: 'note-splicer' } });
    expect(value).toBe('project:note-splicer');
    expect(parseOpenParam(`?open=${value}`)).toMatchObject({
      appKey: 'projectDetail',
      props: { projectId: 'note-splicer' },
    });
  });

  it('returns null for nothing focused or a non-linkable window', () => {
    expect(openParamFor(null)).toBeNull();
    expect(openParamFor({ appKey: 'welcome' })).toBeNull();
    expect(openParamFor({ appKey: 'projectDetail' })).toBeNull();
  });
});

describe('withOpenParam', () => {
  it('preserves unrelated params when setting', () => {
    expect(withOpenParam('?noboot=1', 'resume')).toBe('?noboot=1&open=resume');
  });

  it('replaces an existing value rather than appending', () => {
    expect(withOpenParam('?open=about', 'contact')).toBe('?open=contact');
  });

  it('drops the param but keeps the rest', () => {
    expect(withOpenParam('?noboot=1&open=about', null)).toBe('?noboot=1');
  });

  it('returns an empty string when nothing is left', () => {
    expect(withOpenParam('?open=about', null)).toBe('');
  });
});

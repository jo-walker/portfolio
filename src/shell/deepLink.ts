import type { AppKey, WindowState } from '../types';
import { projects } from '../data/projects';

export const OPEN_PARAM = 'open';

/** Apps that make sense as a shareable entry point. */
const LINKABLE: AppKey[] = ['about', 'projects', 'resume', 'contact', 'terminal', 'recycleBin'];

export interface DeepLinkTarget {
  appKey: AppKey;
  props?: Record<string, unknown>;
  /** Title override, so a linked project window is named after the project. */
  title?: string;
}

/**
 * Read `?open=` into a window to launch. Query params rather than paths: the
 * GH Pages 404 is a static page, not an SPA redirect, so `/portfolio/resume`
 * would hard-404 there while `?open=resume` works on both hosts.
 *
 * Accepts `?open=resume` and `?open=project:parkopticon`.
 */
export function parseOpenParam(search: string): DeepLinkTarget | null {
  const raw = new URLSearchParams(search).get(OPEN_PARAM);
  if (!raw) return null;
  const value = raw.trim().toLowerCase();

  if (value.startsWith('project:')) {
    const id = value.slice('project:'.length);
    const project = projects.find((p) => p.id === id);
    if (!project) return null;
    return { appKey: 'projectDetail', props: { projectId: id }, title: project.name };
  }

  const match = LINKABLE.find((key) => key.toLowerCase() === value);
  return match ? { appKey: match } : null;
}

/** The `?open=` value that would reproduce this window, or null if it isn't linkable. */
export function openParamFor(win: Pick<WindowState, 'appKey' | 'props'> | null | undefined): string | null {
  if (!win) return null;
  if (win.appKey === 'projectDetail') {
    const id = win.props?.projectId;
    return typeof id === 'string' ? `project:${id}` : null;
  }
  return LINKABLE.includes(win.appKey) ? win.appKey : null;
}

/**
 * Set or drop `open` while preserving every other param (noboot, nowelcome, …).
 * Returns a leading-"?" search string, or '' when no params remain.
 */
export function withOpenParam(search: string, value: string | null): string {
  const params = new URLSearchParams(search);
  if (value === null) params.delete(OPEN_PARAM);
  else params.set(OPEN_PARAM, value);
  const next = params.toString();
  return next ? `?${next}` : '';
}

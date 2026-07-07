import { AboutApp } from './AboutApp';
import type { ReactNode } from 'react';
import type { AppKey, WindowState } from '../types';

export interface AppDef {
  title: string;
  icon: string;
  width: number;
  height: number;
  singleton?: boolean;
}

export const WINDOW_DEFAULTS: Record<AppKey, AppDef> = {
  about: { title: 'About Me', icon: '👤', width: 460, height: 360, singleton: true },
  projects: { title: 'My Projects', icon: '📁', width: 520, height: 400, singleton: true },
  projectDetail: { title: 'Project', icon: '📄', width: 480, height: 420 },
  resume: { title: 'Résumé', icon: '📄', width: 560, height: 620, singleton: true },
  contact: { title: 'Contact', icon: '✉️', width: 380, height: 300, singleton: true },
  recycleBin: { title: 'Recycle Bin', icon: '🗑️', width: 420, height: 300, singleton: true },
};

export type AppComponent = (props: { win: WindowState }) => ReactNode;

const Placeholder =
  (label: string): AppComponent =>
  () => <p style={{ padding: 8 }}>{label} — coming soon.</p>;

// Replaced with real components in Tasks 8–12.
export const APP_REGISTRY: Record<AppKey, AppComponent> = {
  about: () => <AboutApp />,
  projects: Placeholder('Projects'),
  projectDetail: Placeholder('Project'),
  resume: Placeholder('Résumé'),
  contact: Placeholder('Contact'),
  recycleBin: Placeholder('Recycle Bin'),
};

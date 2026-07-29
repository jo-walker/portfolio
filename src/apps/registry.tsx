import { AboutApp } from './AboutApp';
import { ProjectsApp } from './ProjectsApp';
import { ProjectDetail } from './ProjectDetail';
import { ResumeApp } from './ResumeApp';
import { ContactApp } from './ContactApp';
import { RecycleBinApp } from './RecycleBinApp';
import { TerminalApp } from './terminal/TerminalApp';
import { WelcomeApp } from './WelcomeApp';
import { DisplayApp } from './DisplayApp';
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
  terminal: { title: 'Jo-DOS Prompt', icon: '🖥️', width: 560, height: 380 },
  welcome: { title: 'Welcome', icon: '👋', width: 440, height: 340, singleton: true },
  display: { title: 'Display Properties', icon: '🖼️', width: 420, height: 405, singleton: true },
};

export type AppComponent = (props: { win: WindowState }) => ReactNode;

export const APP_REGISTRY: Record<AppKey, AppComponent> = {
  about: () => <AboutApp />,
  projects: () => <ProjectsApp />,
  projectDetail: (props) => <ProjectDetail win={props.win} />,
  resume: () => <ResumeApp />,
  contact: () => <ContactApp />,
  recycleBin: () => <RecycleBinApp />,
  terminal: () => <TerminalApp />,
  welcome: () => <WelcomeApp />,
  display: () => <DisplayApp />,
};

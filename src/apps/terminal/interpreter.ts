import type { AppKey } from '../../types';

export type CommandAction =
  | { type: 'openApp'; key: AppKey }
  | { type: 'clear' };

export interface CommandResult {
  lines: string[];
  action?: CommandAction;
}

const NAV: Record<string, AppKey> = {
  about: 'about',
  projects: 'projects',
  resume: 'resume',
  contact: 'contact',
};

const HELP: string[] = [
  'Available commands:',
  '  about      open the About window',
  '  projects   open the Projects window',
  '  resume     open the Résumé window',
  '  contact    open the Contact window',
  '  whoami     print identity',
  '  ls / dir   list desktop programs',
  '  clear      clear the screen',
  '  help       show this help',
];

export function runCommand(input: string): CommandResult {
  const cmd = input.trim().toLowerCase();
  if (cmd === '') return { lines: [] };

  if (cmd === 'help') return { lines: HELP };
  if (cmd in NAV) {
    const key = NAV[cmd];
    return { lines: [`Launching ${cmd}...`], action: { type: 'openApp', key } };
  }
  if (cmd === 'clear') return { lines: [], action: { type: 'clear' } };
  if (cmd === 'whoami') return { lines: ['Jo Gurvantamir — Full-Stack Developer, Ottawa ON'] };
  if (cmd === 'ls' || cmd === 'dir') {
    return { lines: ['about.exe   projects.exe   resume.exe   contact.exe   recyclebin.exe'] };
  }
  if (cmd === 'sudo') return { lines: ['jo is not in the sudoers file. This incident will be reported.'] };
  if (cmd === 'exit') return { lines: ["Nice try — there's no escape from the 90s."] };

  return { lines: [`Bad command or file name: ${cmd}`] };
}

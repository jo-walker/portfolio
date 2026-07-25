const PREFIX = 'jo95:';

function safeStore(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null; // access can throw in locked-down environments
  }
}

function make(store: Storage | null) {
  return {
    get<T>(key: string, fallback: T): T {
      if (!store) return fallback;
      const raw = store.getItem(PREFIX + key);
      if (raw === null) return fallback;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    },
    set<T>(key: string, value: T): void {
      if (!store) return;
      try {
        store.setItem(PREFIX + key, JSON.stringify(value));
      } catch {
        /* ignore quota / private-mode errors */
      }
    },
  };
}

export const storage = make(safeStore('local'));
export const session = make(safeStore('session'));

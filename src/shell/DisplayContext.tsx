import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { loadSettings, saveSettings, type DisplaySettings } from './display';

interface DisplayValue {
  settings: DisplaySettings;
  update: (patch: Partial<DisplaySettings>) => void;
}

const DisplayContext = createContext<DisplayValue | null>(null);

export function DisplayProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DisplaySettings>(loadSettings);

  const update = useCallback((patch: Partial<DisplaySettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  return <DisplayContext.Provider value={{ settings, update }}>{children}</DisplayContext.Provider>;
}

export function useDisplay(): DisplayValue {
  const ctx = useContext(DisplayContext);
  if (!ctx) throw new Error('useDisplay must be used within DisplayProvider');
  return ctx;
}

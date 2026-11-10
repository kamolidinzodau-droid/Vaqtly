import { useCallback, useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import type { ThemeColors, ThemeKey } from '@/lib/types';
import { THEMES } from '@/lib/types';

function applyTheme(theme: ThemeColors) {
  const root = document.documentElement;
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-soft', theme.accentSoft);
}

function applyDark(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle('dark', dark);
  root.style.colorScheme = dark ? 'dark' : 'light';
}

export function useTheme() {
  const [themeKey, setThemeKey] = useState<ThemeKey>(() => storage.getTheme());
  const [dark, setDark] = useState<boolean>(() => {
    const stored = storage.getDark();
    if (stored !== null) return stored;
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const theme = THEMES.find((t) => t.key === themeKey) ?? THEMES[0];

  useEffect(() => {
    applyTheme(theme);
    storage.setTheme(theme.key);
  }, [theme]);

  useEffect(() => {
    applyDark(dark);
    storage.setDark(dark);
  }, [dark]);

  const changeTheme = useCallback((key: ThemeKey) => setThemeKey(key), []);
  const toggleDark = useCallback(() => setDark((d) => !d), []);

  return { theme, themeKey, changeTheme, dark, toggleDark };
}

import type { ThemeKey } from './types';

const THEME_KEY = 'vaqtli_theme_v1';
const DARK_KEY = 'vaqtli_dark_v1';

export const storage = {
  getTheme(): ThemeKey {
    const v = localStorage.getItem(THEME_KEY);
    return v === 'blue' || v === 'emerald' || v === 'rose' || v === 'amber' || v === 'violet' || v === 'cyan' ? v : 'blue';
  },
  setTheme(t: ThemeKey) {
    localStorage.setItem(THEME_KEY, t);
  },
  getDark(): boolean | null {
    const v = localStorage.getItem(DARK_KEY);
    return v === null ? null : v === '1';
  },
  setDark(v: boolean) {
    localStorage.setItem(DARK_KEY, v ? '1' : '0');
  },
};

export interface Task {
  id: string;
  time: string; // "HH:MM"
  title: string;
  description: string;
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  icon: string; // habit icon key
  color: string;
  history: string[]; // ISO dates "YYYY-MM-DD" when completed
}

export interface Note {
  id: string;
  title: string;
  body: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  premiumSince: string | null;
  createdAt: string;
}

export type ThemeKey = 'blue' | 'emerald' | 'rose' | 'amber' | 'violet' | 'cyan';

export interface ThemeColors {
  key: ThemeKey;
  label: string;
  accent: string;
  accentSoft: string;
  ring: string;
  gradient: string;
}

export const THEMES: ThemeColors[] = [
  { key: 'blue', label: 'Koʻk', accent: '#2563eb', accentSoft: '#3b82f6', ring: 'ring-blue-500/30', gradient: 'from-blue-500 to-blue-600' },
  { key: 'emerald', label: 'Yashil', accent: '#059669', accentSoft: '#10b981', ring: 'ring-emerald-500/30', gradient: 'from-emerald-500 to-emerald-600' },
  { key: 'rose', label: 'Qizil', accent: '#e11d48', accentSoft: '#fb7185', ring: 'ring-rose-500/30', gradient: 'from-rose-500 to-rose-600' },
  { key: 'amber', label: 'Sariq', accent: '#d97706', accentSoft: '#f59e0b', ring: 'ring-amber-500/30', gradient: 'from-amber-500 to-amber-600' },
  { key: 'violet', label: 'Binafsha', accent: '#7c3aed', accentSoft: '#a78bfa', ring: 'ring-violet-500/30', gradient: 'from-violet-500 to-violet-600' },
  { key: 'cyan', label: 'Moviy', accent: '#0891b2', accentSoft: '#22d3ee', ring: 'ring-cyan-500/30', gradient: 'from-cyan-500 to-cyan-600' },
];

export const FREE_TASK_LIMIT = 12;
export const FREE_HABIT_LIMIT = 3;
export const FREE_NOTE_LIMIT = 10;
export const PREMIUM_PRICE = '10.000';

export type ViewKey = 'schedule' | 'timer' | 'habits' | 'notes' | 'minutka' | 'analytics' | 'profile';

export type ActionResult = { ok: true } | { ok: false; reason: 'limit' | 'error' };

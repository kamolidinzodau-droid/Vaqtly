import type { Task, Habit, Note, User, ThemeKey } from './types';

const TASKS_KEY = 'vaqtli_tasks_v1';
const HABITS_KEY = 'vaqtli_habits_v1';
const NOTES_KEY = 'vaqtli_notes_v1';
const PREMIUM_KEY = 'vaqtli_premium_v1';
const THEME_KEY = 'vaqtli_theme_v1';
const DARK_KEY = 'vaqtli_dark_v1';
const USER_KEY = 'vaqtli_user_v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

export const storage = {
  // Tasks
  getTasks(): Task[] {
    return read<Task[]>(TASKS_KEY, []);
  },
  saveTasks(tasks: Task[]) {
    write(TASKS_KEY, tasks);
  },
  // Habits
  getHabits(): Habit[] {
    return read<Habit[]>(HABITS_KEY, []);
  },
  saveHabits(habits: Habit[]) {
    write(HABITS_KEY, habits);
  },
  // Notes
  getNotes(): Note[] {
    return read<Note[]>(NOTES_KEY, []);
  },
  saveNotes(notes: Note[]) {
    write(NOTES_KEY, notes);
  },
  // Premium
  getPremium(): boolean {
    return localStorage.getItem(PREMIUM_KEY) === '1';
  },
  setPremium(v: boolean) {
    localStorage.setItem(PREMIUM_KEY, v ? '1' : '0');
  },
  // Theme
  getTheme(): ThemeKey {
    return (localStorage.getItem(THEME_KEY) as ThemeKey) || 'blue';
  },
  setTheme(t: ThemeKey) {
    localStorage.setItem(THEME_KEY, t);
  },
  // Dark mode
  getDark(): boolean | null {
    const v = localStorage.getItem(DARK_KEY);
    return v === null ? null : v === '1';
  },
  setDark(v: boolean) {
    localStorage.setItem(DARK_KEY, v ? '1' : '0');
  },
  // User
  getUser(): User | null {
    return read<User | null>(USER_KEY, null);
  },
  saveUser(u: User | null) {
    if (u) write(USER_KEY, u);
    else localStorage.removeItem(USER_KEY);
  },
};

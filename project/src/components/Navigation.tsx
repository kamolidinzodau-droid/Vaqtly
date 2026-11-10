import { CalendarClock, Timer, Repeat, StickyNote, Gamepad2, BarChart3, Hourglass } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ViewKey, ThemeColors } from '@/lib/types';

interface NavProps {
  active: ViewKey;
  onChange: (v: ViewKey) => void;
  theme: ThemeColors;
}

const ICONS: Record<string, LucideIcon> = {
  schedule: CalendarClock,
  timer: Timer,
  habits: Repeat,
  notes: StickyNote,
  minutka: Gamepad2,
  analytics: BarChart3,
};

const ITEMS: { key: ViewKey; label: string; short: string }[] = [
  { key: 'schedule', label: 'Kun tartibi', short: 'Tartib' },
  { key: 'timer', label: 'Pomodoro', short: 'Taymer' },
  { key: 'habits', label: 'Odatlar', short: 'Odat' },
  { key: 'notes', label: 'Qaydlar', short: 'Qayd' },
  { key: 'minutka', label: 'Minutka', short: "O'yin" },
  { key: 'analytics', label: 'Statistika', short: 'Stat' },
];

export function Navigation({ active, onChange, theme }: NavProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-56 flex-col py-6 px-3 border-r border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl z-20">
        <div className="flex items-center gap-2.5 px-3 mb-8">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
          >
            <Hourglass className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-lg text-gray-900 dark:text-white">Vaqtly</span>
        </div>
        <ul className="space-y-1 flex-1">
          {ITEMS.map((item) => {
            const Icon = ICONS[item.key];
            const isActive = active === item.key;
            return (
              <li key={item.key}>
                <button
                  onClick={() => onChange(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  style={isActive ? { background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` } : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="px-3 text-[11px] text-gray-400 dark:text-gray-600 font-medium">
          Vaqtly v1.0 — Mahsuldorlik
        </p>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800">
        <ul className="flex items-center justify-around px-1 py-1.5 max-w-lg mx-auto">
          {ITEMS.map((item) => {
            const Icon = ICONS[item.key];
            const isActive = active === item.key;
            return (
              <li key={item.key}>
                <button
                  onClick={() => onChange(item.key)}
                  className="relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? '' : 'text-gray-400 dark:text-gray-500'
                    }`}
                    style={isActive ? { color: theme.accent } : undefined}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span
                    className={`text-[10px] font-semibold transition-colors ${
                      isActive ? '' : 'text-gray-400 dark:text-gray-500'
                    }`}
                    style={isActive ? { color: theme.accent } : undefined}
                  >
                    {item.short}
                  </span>
                  {isActive && (
                    <span
                      className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ backgroundColor: theme.accent }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

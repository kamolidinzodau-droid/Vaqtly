import { useState, type FormEvent } from 'react';
import {
  Repeat, Plus, Flame, Trash2, Check, X, Crown,
  Droplets, Dumbbell, BookOpen, Coffee, Footprints, Moon, Heart, PenTool,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ViewHeader } from '@/components/ViewHeader';
import type { Habit, ThemeColors } from '@/lib/types';
import { FREE_HABIT_LIMIT } from '@/lib/types';
import { todayISO, lastNDates, dayNameShort } from '@/lib/dates';
import { playClick } from '@/lib/audio';

interface HabitsViewProps {
  theme: ThemeColors;
  habits: Habit[];
  streaks: Record<string, number>;
  stats: { total: number; done: number; remaining: number };
  premium: boolean;
  onAdd: (name: string, icon: string, color: string) => { ok: boolean; reason?: 'limit' };
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenPremium: () => void;
}

const HABIT_ICONS: Record<string, LucideIcon> = {
  Droplets, Dumbbell, BookOpen, Coffee, Footprints, Moon, Heart, PenTool,
};

const ICON_CHOICES = Object.keys(HABIT_ICONS);
const COLOR_CHOICES = ['#0891b2', '#e11d48', '#7c3aed', '#d97706', '#059669', '#2563eb', '#db2777', '#0d9488'];

export function HabitsView({
  theme,
  habits,
  streaks,
  stats,
  premium,
  onAdd,
  onToggle,
  onDelete,
  onOpenPremium,
}: HabitsViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICON_CHOICES[0]);
  const [color, setColor] = useState(COLOR_CHOICES[0]);
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Odat nomini kiriting');
      return;
    }
    const result = onAdd(name, icon, color);
    if (!result.ok && result.reason === 'limit') {
      onOpenPremium();
      return;
    }
    setShowForm(false);
    setName('');
    setError('');
  }

  const today = todayISO();
  const week = lastNDates(7);

  return (
    <div className="space-y-5">
      <ViewHeader
        title="Odatlar kuzatuvchisi"
        subtitle="Har kungi odatlaringizni kuzating"
        icon={<Repeat className="w-5 h-5" strokeWidth={2.5} />}
        accent={theme.accent}
        right={
          habits.length > 0 && (
            <div className="text-right shrink-0">
              <p className="text-2xl font-extrabold" style={{ color: theme.accent }}>
                {stats.done}/{stats.total}
              </p>
              <p className="text-[11px] text-gray-400">Bugun bajarildi</p>
            </div>
          )
        }
      />

      {/* Week strip */}
      <div className="flex gap-1.5 animate-fade-in">
        {week.map((d) => {
          const isToday = d === today;
          const done = habits.filter((h) => h.history.includes(d)).length;
          const pct = habits.length > 0 ? done / habits.length : 0;
          return (
            <div key={d} className="flex-1 text-center">
              <p className="text-[10px] font-bold text-gray-400 mb-1.5">{dayNameShort(d)}</p>
              <div
                className={`relative h-16 rounded-xl overflow-hidden ${
                  isToday ? 'ring-2' : 'ring-1 ring-gray-200 dark:ring-gray-700'
                }`}
                style={isToday ? { boxShadow: `0 0 0 2px ${theme.accent}` } : undefined}
              >
                <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800" />
                <div
                  className="absolute inset-x-0 bottom-0 transition-all duration-500"
                  style={{ height: `${pct * 100}%`, background: `linear-gradient(180deg, ${theme.accentSoft}80, ${theme.accent})` }}
                />
                <span className="relative flex items-center justify-center h-full text-xs font-bold text-gray-700 dark:text-gray-200">
                  {done > 0 ? done : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add button / form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full group flex items-center gap-3 px-4 py-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-white transition-all"
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}
        >
          <span
            className="flex items-center justify-center w-9 h-9 rounded-xl text-white transition-transform group-hover:scale-110"
            style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </span>
          <span className="font-semibold">Yangi odat qoʻshish</span>
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 animate-scale-in"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Yangi odat</h3>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(''); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: Tonggi yurish"
            className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 mb-3"
            style={{ borderColor: undefined }}
          />
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Belgi tanlang</p>
          <div className="grid grid-cols-8 gap-1.5 mb-3">
            {ICON_CHOICES.map((k) => {
              const Icon = HABIT_ICONS[k];
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setIcon(k)}
                  className={`flex items-center justify-center w-full aspect-square rounded-lg transition-all ${
                    icon === k ? 'ring-2 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                  }`}
                  style={icon === k ? { backgroundColor: color, boxShadow: `0 0 0 2px ${color}` } : undefined}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Rang tanlang</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {COLOR_CHOICES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 scale-110' : ''}`}
                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : 'none' }}
              />
            ))}
          </div>
          {error && <p className="mb-3 text-sm text-rose-500 font-medium">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold text-sm shadow-lg transition-transform active:scale-[0.98] hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
            >
              <Plus className="w-4 h-4" /> Qoʻshish
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(''); }}
              className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Bekor qilish
            </button>
          </div>
        </form>
      )}

      {/* Habit cards */}
      {habits.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Repeat className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Hozircha odatlar yoʻq</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Yangi odat qoʻshing va ketma-ketlikni boshlang</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit, idx) => {
            const Icon = HABIT_ICONS[habit.icon] ?? Repeat;
            const doneToday = habit.history.includes(today);
            const streak = streaks[habit.id] ?? 0;
            return (
              <div
                key={habit.id}
                className="group p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex items-center justify-center w-12 h-12 rounded-2xl text-white shadow-md shrink-0"
                    style={{ background: `linear-gradient(135deg, ${habit.color}, ${habit.color}cc)` }}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{habit.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                        <Flame className="w-3.5 h-3.5" /> {streak} kun
                      </span>
                      <span className="text-xs text-gray-400">{habit.history.length} marta bajarilgan</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { onToggle(habit.id); playClick(); }}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                      doneToday
                        ? 'text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600 hover:text-gray-500'
                    }`}
                    style={doneToday ? { background: `linear-gradient(135deg, ${habit.color}, ${habit.color}cc)` } : undefined}
                  >
                    <Check className="w-5 h-5" strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => onDelete(habit.id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {/* Mini week dots */}
                <div className="flex gap-1 mt-3">
                  {week.map((d) => {
                    const done = habit.history.includes(d);
                    const isToday = d === today;
                    return (
                      <div
                        key={d}
                        className={`flex-1 h-1.5 rounded-full transition-all ${isToday ? 'ring-1 ring-offset-1 ring-offset-white dark:ring-offset-gray-800' : ''}`}
                        style={{
                          backgroundColor: done ? habit.color : isToday ? `${habit.color}30` : 'rgb(229 231 235 / 0.6)',
                          ...(isToday ? { boxShadow: `0 0 0 1px ${habit.color}` } : {}),
                        }}
                        title={`${dayNameShort(d)}: ${done ? 'bajarilgan' : 'bajarilmagan'}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!premium && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur ring-1 ring-gray-200 dark:ring-gray-700 animate-fade-in">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 whitespace-nowrap">
            Bepul
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
            {habits.length} / {FREE_HABIT_LIMIT} odat ishlatildi
          </p>
          <button
            onClick={onOpenPremium}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white whitespace-nowrap hover:opacity-90 transition-opacity"
            style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
          >
            <Crown className="w-3.5 h-3.5" /> Premium
          </button>
        </div>
      )}
    </div>
  );
}

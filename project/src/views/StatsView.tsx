import { BarChart3, CheckCircle2, Flame, Repeat, StickyNote } from 'lucide-react';
import { ViewHeader } from '@/components/ViewHeader';
import type { Habit, ThemeColors } from '@/lib/types';
import { todayISO } from '@/lib/dates';

interface StatsViewProps {
  theme: ThemeColors;
  taskStats: { total: number; done: number };
  habits: Habit[];
  streaks: Record<string, number>;
  noteCount: number;
}

export function StatsView({ theme, taskStats, habits, streaks, noteCount }: StatsViewProps) {
  const today = todayISO();
  const habitsDone = habits.filter((h) => h.history.includes(today)).length;
  const longestStreak = Math.max(0, ...Object.values(streaks));

  return (
    <div className="space-y-5">
      <ViewHeader
        title="Statistika"
        subtitle="Vazifa, odat va qaydlaringiz tahlili"
        icon={<BarChart3 className="w-5 h-5" strokeWidth={2.5} />}
        accent={theme.accent}
      />

      <div className="grid grid-cols-2 gap-3 animate-fade-in">
        <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Bugungi vazifalar" value={`${taskStats.done} / ${taskStats.total}`} />
        <StatCard icon={<Repeat className="w-4 h-4" />} label="Bugungi odatlar" value={`${habitsDone} / ${habits.length}`} />
        <StatCard icon={<Flame className="w-4 h-4" />} label="Eng uzun seriya" value={`${longestStreak} kun`} />
        <StatCard icon={<StickyNote className="w-4 h-4" />} label="Qaydlar" value={String(noteCount)} />
      </div>

      {habits.length > 0 && (
        <section className="p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Odatlar seriyasi</h3>
          {habits.map((h) => (
            <div key={h.id} className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{h.name}</span>
              <span className="text-sm font-bold whitespace-nowrap" style={{ color: theme.accent }}>
                {streaks[h.id] ?? 0} kun
              </span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
      <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-2">
        {icon}
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none">{value}</p>
    </div>
  );
}

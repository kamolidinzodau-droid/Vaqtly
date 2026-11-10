import { CalendarClock, Crown } from 'lucide-react';
import { AddTaskForm } from '@/components/AddTaskForm';
import { TaskList } from '@/components/TaskList';
import { ViewHeader } from '@/components/ViewHeader';
import type { Task, ThemeColors } from '@/lib/types';
import { FREE_TASK_LIMIT } from '@/lib/types';
import { formatToday } from '@/lib/dates';

interface ScheduleViewProps {
  theme: ThemeColors;
  tasks: Task[];
  stats: { total: number; done: number; remaining: number };
  premium: boolean;
  onAdd: (time: string, title: string, description: string) => { ok: boolean; reason?: 'limit' };
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClearCompleted: () => void;
  onOpenPremium: () => void;
}

export function ScheduleView({
  theme,
  tasks,
  stats,
  premium,
  onAdd,
  onToggle,
  onDelete,
  onClearCompleted,
  onOpenPremium,
}: ScheduleViewProps) {
  const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="space-y-5">
      <ViewHeader
        title="Kun tartibi"
        subtitle={formatToday()}
        icon={<CalendarClock className="w-5 h-5" strokeWidth={2.5} />}
        accent={theme.accent}
      />

      {/* Stats + progress */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
        <StatPill label="Jami vazifa" value={stats.total} color={theme.accent} />
        <StatPill label="Bajarildi" value={stats.done} color="#10b981" />
        <StatPill label="Qoldi" value={stats.remaining} color="#f59e0b" />
        <StatPill label="Progress" value={`${progress}%`} color={theme.accent} />
      </div>

      {stats.total > 0 && (
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 animate-fade-in">
          <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${theme.accentSoft}, ${theme.accent})` }}
            />
          </div>
        </div>
      )}

      {/* Free tier notice */}
      {!premium && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur ring-1 ring-gray-200 dark:ring-gray-700 animate-fade-in">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 whitespace-nowrap">
            Bepul
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
            {tasks.length} / {FREE_TASK_LIMIT} vazifa ishlatildi
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

      <AddTaskForm theme={theme} onAdd={onAdd} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Bugungi tartib</h3>
          {stats.done > 0 && (
            <button onClick={onClearCompleted} className="text-xs font-semibold text-gray-400 hover:text-rose-500 transition-colors">
              Bajarilganlarni tozalash
            </button>
          )}
        </div>
        <TaskList tasks={tasks} theme={theme} onToggle={onToggle} onDelete={onDelete} />
      </div>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
      <p className="text-xl font-extrabold leading-none" style={{ color }}>
        {value}
      </p>
      <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-1.5">{label}</p>
    </div>
  );
}

import { Check, Trash2, Clock, Circle, AlignLeft } from 'lucide-react';
import type { Task, ThemeColors } from '@/lib/types';

interface TaskListProps {
  tasks: Task[];
  theme: ThemeColors;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function periodLabel(time: string): string {
  const [h] = time.split(':').map(Number);
  if (h < 12) return 'Ertalab';
  if (h < 17) return 'Kunduzi';
  if (h < 21) return 'Kechqurun';
  return 'Tun';
}

export function TaskList({ tasks, theme, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Clock className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Hozircha vazifalar yoʻq</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Yuqoridagi tugma orqali yangi vazifa qoʻshing</p>
      </div>
    );
  }

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="relative">
      {/* Timeline rail */}
      <div className="absolute left-[22px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />

      <ul className="space-y-3">
        {tasks.map((task, idx) => {
          const taskMin = toMinutes(task.time);
          const isPast = taskMin < nowMin;
          const isNow = taskMin === nowMin;
          const isNext = !isPast && !isNow && tasks.slice(0, idx).every((t) => toMinutes(t.time) < nowMin || t.completed);

          return (
            <li
              key={task.id}
              className="relative pl-12 animate-slide-up"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Timeline dot */}
              <div className="absolute left-0 top-4 flex items-center justify-center">
                <span
                  className={`relative w-11 h-11 rounded-full flex items-center justify-center text-[11px] font-bold shadow-md transition-all ${
                    task.completed
                      ? 'bg-emerald-500 text-white'
                      : isNow
                      ? 'text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 ring-1 ring-gray-200 dark:ring-gray-700'
                  }`}
                  style={isNow && !task.completed ? { background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` } : undefined}
                >
                  {task.completed ? (
                    <Check className="w-5 h-5" strokeWidth={3} />
                  ) : isNow ? (
                    <>
                      <span className="absolute inset-0 rounded-full animate-pulse-ring" style={{ backgroundColor: theme.accentSoft }} />
                      <span className="relative">{task.time}</span>
                    </>
                  ) : (
                    task.time
                  )}
                </span>
              </div>

              {/* Card */}
              <div
                className={`group p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm ring-1 transition-all hover:shadow-md ${
                  task.completed
                    ? 'ring-gray-200 dark:ring-gray-700/60 opacity-75'
                    : isNow
                    ? 'ring-2'
                    : 'ring-gray-200 dark:ring-gray-700'
                }`}
                style={isNow && !task.completed ? { boxShadow: `0 0 0 1px ${theme.accent}, 0 4px 14px ${theme.accent}22` } : undefined}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                        {periodLabel(task.time)}
                      </span>
                      {isNow && !task.completed && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white animate-pulse" style={{ backgroundColor: theme.accent }}>
                          Hozir
                        </span>
                      )}
                      {isNext && !task.completed && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: theme.accentSoft }}>
                          Keyingi
                        </span>
                      )}
                      {isPast && !task.completed && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400">
                          Oʻtkazib yuborilgan
                        </span>
                      )}
                    </div>
                    <h3
                      className={`font-bold text-[15px] leading-tight ${
                        task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p
                        className={`mt-1.5 text-sm flex items-start gap-1.5 ${
                          task.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        <AlignLeft className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-60" />
                        <span className="leading-relaxed">{task.description}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Toggle */}
                    <button
                      onClick={() => onToggle(task.id)}
                      title={task.completed ? 'Bajarilmagan deb belgilash' : 'Bajarilgan deb belgilash'}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {task.completed ? <Check className="w-4 h-4" strokeWidth={3} /> : <Circle className="w-4 h-4" />}
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => onDelete(task.id)}
                      title="Oʻchirish"
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

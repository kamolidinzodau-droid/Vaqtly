import { Play, Pause, RotateCcw, Coffee, Brain, CheckCircle2 } from 'lucide-react';
import { ViewHeader } from '@/components/ViewHeader';
import type { ThemeColors } from '@/lib/types';
import type { TimerMode } from '@/hooks/useTimer';

interface TimerViewProps {
  theme: ThemeColors;
  mode: TimerMode;
  minutes: number;
  seconds: number;
  running: boolean;
  progress: number;
  completedWork: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSwitchMode: (m: TimerMode) => void;
}

export function TimerView({
  theme,
  mode,
  minutes,
  seconds,
  running,
  progress,
  completedWork,
  onStart,
  onPause,
  onReset,
  onSwitchMode,
}: TimerViewProps) {
  const isWork = mode === 'work';
  const displayColor = isWork ? theme.accent : '#10b981';
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="space-y-5">
      <ViewHeader
        title="Pomodoro taymer"
        subtitle="Fokuslangan ish va qisqa tanaffuslar"
        icon={<Brain className="w-5 h-5" strokeWidth={2.5} />}
        accent={theme.accent}
      />

      {/* Mode switcher */}
      <div className="flex p-1 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur ring-1 ring-gray-200 dark:ring-gray-700 animate-fade-in max-w-xs mx-auto">
        <button
          onClick={() => onSwitchMode('work')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            isWork ? 'text-white shadow-md' : 'text-gray-500 dark:text-gray-400'
          }`}
          style={isWork ? { background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` } : undefined}
        >
          <Brain className="w-4 h-4" /> Ish (25 min)
        </button>
        <button
          onClick={() => onSwitchMode('break')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            !isWork ? 'text-white shadow-md' : 'text-gray-500 dark:text-gray-400'
          }`}
          style={!isWork ? { background: 'linear-gradient(135deg, #34d399, #10b981)' } : undefined}
        >
          <Coffee className="w-4 h-4" /> Dam (5 min)
        </button>
      </div>

      {/* Circular timer */}
      <div className="flex flex-col items-center py-6 animate-fade-in">
        <div className="relative">
          <svg width="300" height="300" className="-rotate-90">
            <circle
              cx="150"
              cy="150"
              r={radius}
              fill="none"
              strokeWidth="14"
              className="stroke-gray-100 dark:stroke-gray-800"
            />
            <circle
              cx="150"
              cy="150"
              r={radius}
              fill="none"
              strokeWidth="14"
              strokeLinecap="round"
              stroke={displayColor}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-extrabold tabular-nums text-gray-900 dark:text-white tracking-tight">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span
              className="mt-2 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ color: displayColor, backgroundColor: `${displayColor}15` }}
            >
              {isWork ? 'Fokusda' : 'Tanaffus'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={onReset}
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Qaytadan boshlash"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          {running ? (
            <button
              onClick={onPause}
              className="flex items-center justify-center gap-2 px-8 h-14 rounded-2xl text-white font-bold text-base shadow-lg transition-transform active:scale-95"
              style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
            >
              <Pause className="w-5 h-5" /> Pauza
            </button>
          ) : (
            <button
              onClick={onStart}
              className="flex items-center justify-center gap-2 px-8 h-14 rounded-2xl text-white font-bold text-base shadow-lg transition-transform active:scale-95"
              style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
            >
              <Play className="w-5 h-5" /> Boshlash
            </button>
          )}
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400" title="Bajarilgan ish davrlari">
            <span className="text-sm font-bold">{completedWork}</span>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur ring-1 ring-gray-200 dark:ring-gray-700 animate-fade-in">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" style={{ color: theme.accent }} />
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Pomodoro texnikasi</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              25 daqiqalik toza fokus davridan keyin 5 daqiqalik tanaffus qiling. Har 4 davrda bitta uzun dam oling. Bu usul diqqatni jamlash va charchashni kamaytirishga yordam beradi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

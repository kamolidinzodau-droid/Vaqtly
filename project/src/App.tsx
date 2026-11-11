import { useState, useEffect, useCallback } from 'react';
import { Crown, CheckCircle2, Circle, TrendingUp, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { AddTaskForm } from '@/components/AddTaskForm';
import { TaskList } from '@/components/TaskList';
import { PremiumModal } from '@/components/PremiumModal';
import { AuthModal } from '@/components/AuthModal';
import { useTheme } from '@/hooks/useTheme';
import { useSchedule } from '@/hooks/useSchedule';
import { useAuth } from '@/hooks/useAuth';
import { getNotifPermission, requestNotifPermission } from '@/lib/notifications';
import { unlockAudio } from '@/lib/audio';
import { storage } from '@/lib/storage';
import type { NotifPermission } from '@/lib/notifications';
import { FREE_TASK_LIMIT } from '@/lib/types';

export default function App() {
  const { theme, themeKey, changeTheme, dark, toggleDark } = useTheme();
  const [notifStatus, setNotifStatus] = useState<NotifPermission>(() => getNotifPermission());
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, login, logout } = useAuth();
  const [premium, setPremium] = useState<boolean>(() => storage.getPremium());

  const upgradeToPremium = useCallback(() => {
    storage.setPremium(true);
    setPremium(true);
  }, []);

  const schedule = useSchedule(notifStatus === 'granted', premium);

  const handleNotifRequest = useCallback(async () => {
    unlockAudio();
    const result = await requestNotifPermission();
    setNotifStatus(result);
  }, []);

  // Request notification permission on first load (non-blocking).
  useEffect(() => {
    if (getNotifPermission() === 'default') {
      requestNotifPermission().then((r) => setNotifStatus(r));
    }
    // Unlock audio on first interaction.
    const unlock = () => {
      unlockAudio();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const handleAdd = useCallback(
    (time: string, title: string, description: string) => {
      const result = schedule.addTask(time, title, description);
      if (!result.ok && result.reason === 'limit') {
        setPremiumModalOpen(true);
      }
      return result;
    },
    [schedule]
  );

  const progress = schedule.stats.total > 0 ? Math.round((schedule.stats.done / schedule.stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
      {/* Decorative gradient backdrop */}
      <div
        className="fixed inset-x-0 top-0 h-72 pointer-events-none opacity-60 dark:opacity-30 transition-opacity"
        style={{ background: `radial-gradient(60% 100% at 50% 0%, ${theme.accentSoft}40, transparent 70%)` }}
      />

      <Header
        dark={dark}
        toggleDark={toggleDark}
        premium={premium}
        theme={theme}
        themeKey={themeKey}
        changeTheme={changeTheme}
        notifStatus={notifStatus}
        onNotifRequest={handleNotifRequest}
        onOpenPremium={() => setPremiumModalOpen(true)}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={logout}
      />

      <main className="relative max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats card */}
        <section className="grid grid-cols-3 gap-3 animate-fade-in">
          <StatCard icon={<Circle className="w-4 h-4" />} label="Jami" value={schedule.stats.total} theme={theme} />
          <StatCard
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Bajarildi"
            value={schedule.stats.done}
            theme={theme}
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Qoldi"
            value={schedule.stats.remaining}
            theme={theme}
          />
        </section>

        {/* Progress bar */}
        {schedule.stats.total > 0 && (
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Bugungi progress</span>
              <span className="text-sm font-bold" style={{ color: theme.accent }}>
                {progress}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${theme.accentSoft}, ${theme.accent})`,
                }}
              />
            </div>
          </div>
        )}

        {/* Free tier notice */}
        {!premium && (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800/60 ring-1 ring-gray-200 dark:ring-gray-700/60 animate-fade-in">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 whitespace-nowrap">
              Bepul
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
              {schedule.tasks.length} / {FREE_TASK_LIMIT} vazifa ishlatildi
            </p>
            <button
              onClick={() => setPremiumModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white whitespace-nowrap hover:opacity-90 transition-opacity"
              style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
            >
              <Crown className="w-3.5 h-3.5" /> Premium
            </button>
          </div>
        )}

        {/* Add task */}
        <AddTaskForm theme={theme} onAdd={handleAdd} />

        {/* Task list */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Bugungi tartib
            </h2>
            {schedule.stats.done > 0 && (
              <button
                onClick={schedule.clearCompleted}
                className="text-xs font-semibold text-gray-400 hover:text-rose-500 transition-colors"
              >
                Bajarilganlarni tozalash
              </button>
            )}
          </div>
          <TaskList tasks={schedule.tasks} theme={theme} onToggle={schedule.toggleTask} onDelete={schedule.deleteTask} />
        </section>

        {/* Premium hero banner */}
        {!premium && (
          <section
            className="relative overflow-hidden rounded-3xl p-6 text-white animate-fade-in"
            style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
          >
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -right-4 top-10 w-24 h-24 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-90">Premium taklif</span>
              </div>
              <h3 className="text-xl font-extrabold leading-tight">Cheksiz vazifalar va maxsus mavzular</h3>
              <p className="text-sm opacity-90 mt-1.5 mb-4">
                10.000 soʻm/oy evaziga kun tartibingizni mukammal boshqaring.
              </p>
              <button
                onClick={() => setPremiumModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white font-bold text-sm shadow-lg transition-transform active:scale-95 hover:bg-gray-50"
                style={{ color: theme.accent }}
              >
                <Crown className="w-4 h-4" /> Premiumga oʻtish
              </button>
            </div>
          </section>
        )}

        <footer className="pt-2 pb-8 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-600">Kun Tartibi — kundalik rejalashtirish ilovasi</p>
        </footer>
      </main>

      <PremiumModal
        open={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        theme={theme}
        onUpgrade={upgradeToPremium}
      />

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        theme={theme}
        onLogin={(u) => {
          login(u);
          setAuthModalOpen(false);
        }}
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  theme: { accent: string; accentSoft: string };
}

function StatCard({ icon, label, value, theme }: StatCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg mb-2 text-white"
        style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
      >
        {icon}
      </div>
      <p className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none">{value}</p>
      <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-1">{label}</p>
    </div>
  );
}

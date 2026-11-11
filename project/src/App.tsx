import { useState, useEffect, useCallback } from 'react';
import { Crown, Gamepad2, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { PremiumModal } from '@/components/PremiumModal';
import { AuthModal } from '@/components/AuthModal';
import { ViewHeader } from '@/components/ViewHeader';
import { ColorMatchGame } from '@/components/ColorMatchGame';
import { ScheduleView } from '@/views/ScheduleView';
import { HabitsView } from '@/views/HabitsView';
import { NotesView } from '@/views/NotesView';
import { TimerView } from '@/views/TimerView';
import { StatsView } from '@/views/StatsView';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useSchedule } from '@/hooks/useSchedule';
import { useHabits } from '@/hooks/useHabits';
import { useNotes } from '@/hooks/useNotes';
import { useTimer } from '@/hooks/useTimer';
import { getNotifPermission, requestNotifPermission } from '@/lib/notifications';
import { unlockAudio } from '@/lib/audio';
import { storage } from '@/lib/storage';
import type { NotifPermission } from '@/lib/notifications';
import type { ViewKey } from '@/lib/types';

function openPremiumOnLimit<R extends { ok: boolean; reason?: 'limit' }>(result: R, openPremium: () => void): R {
  if (!result.ok && result.reason === 'limit') openPremium();
  return result;
}

export default function App() {
  const { theme, themeKey, changeTheme, dark, toggleDark } = useTheme();
  const { user, login, logout } = useAuth();
  const [notifStatus, setNotifStatus] = useState<NotifPermission>(() => getNotifPermission());
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [view, setView] = useState<ViewKey>('schedule');
  const [premium, setPremium] = useState<boolean>(() => storage.getPremium());

  const upgradeToPremium = useCallback(() => {
    storage.setPremium(true);
    setPremium(true);
  }, []);

  const notifEnabled = notifStatus === 'granted';
  const schedule = useSchedule(notifEnabled, premium);
  const habits = useHabits(premium);
  const notes = useNotes(premium);
  const timer = useTimer(notifEnabled);

  const openPremium = useCallback(() => setPremiumModalOpen(true), []);

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
        onOpenPremium={openPremium}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={logout}
      />

      <Navigation active={view} onChange={setView} theme={theme} />

      <div className="relative lg:pl-56 pb-24 lg:pb-8">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {view === 'schedule' && (
            <>
              <ScheduleView
                theme={theme}
                tasks={schedule.tasks}
                stats={schedule.stats}
                premium={premium}
                onAdd={(time, title, description) =>
                  openPremiumOnLimit(schedule.addTask(time, title, description), openPremium)
                }
                onToggle={schedule.toggleTask}
                onDelete={schedule.deleteTask}
                onClearCompleted={schedule.clearCompleted}
                onOpenPremium={openPremium}
              />
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
                      onClick={openPremium}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white font-bold text-sm shadow-lg transition-transform active:scale-95 hover:bg-gray-50"
                      style={{ color: theme.accent }}
                    >
                      <Crown className="w-4 h-4" /> Premiumga oʻtish
                    </button>
                  </div>
                </section>
              )}
            </>
          )}

          {view === 'timer' && (
            <TimerView
              theme={theme}
              mode={timer.mode}
              minutes={timer.minutes}
              seconds={timer.seconds}
              running={timer.running}
              progress={timer.progress}
              completedWork={timer.completedWork}
              onStart={timer.start}
              onPause={timer.pause}
              onReset={timer.reset}
              onSwitchMode={timer.switchMode}
            />
          )}

          {view === 'habits' && (
            <HabitsView
              theme={theme}
              habits={habits.habits}
              streaks={habits.streaks}
              stats={habits.stats}
              premium={premium}
              onAdd={(name, icon, color) => openPremiumOnLimit(habits.addHabit(name, icon, color), openPremium)}
              onToggle={habits.toggleToday}
              onDelete={habits.deleteHabit}
              onOpenPremium={openPremium}
            />
          )}

          {view === 'notes' && (
            <NotesView
              theme={theme}
              notes={notes.notes}
              stats={notes.stats}
              premium={premium}
              onAdd={(title, body, color) => openPremiumOnLimit(notes.addNote(title, body, color), openPremium)}
              onUpdate={notes.updateNote}
              onDelete={notes.deleteNote}
              onOpenPremium={openPremium}
            />
          )}

          {view === 'minutka' && (
            <div className="space-y-5">
              <ViewHeader
                title="Minutka"
                subtitle="Rang moslash oʻyini"
                icon={<Gamepad2 className="w-5 h-5" strokeWidth={2.5} />}
                accent={theme.accent}
              />
              <ColorMatchGame theme={theme} />
            </div>
          )}

          {view === 'analytics' && (
            <StatsView
              theme={theme}
              taskStats={schedule.stats}
              habits={habits.habits}
              streaks={habits.streaks}
              noteCount={notes.stats.total}
            />
          )}

          <footer className="pt-2 pb-8 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-600">Kun Tartibi — kundalik rejalashtirish ilovasi</p>
          </footer>
        </main>
      </div>

      <PremiumModal open={premiumModalOpen} onClose={() => setPremiumModalOpen(false)} theme={theme} onUpgrade={upgradeToPremium} />

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

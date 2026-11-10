import { Bell, Moon, Sun, Crown, Palette, Check, X, User as UserIcon, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { THEMES } from '@/lib/types';
import type { ThemeColors, ThemeKey, User } from '@/lib/types';
import { requestNotifPermission } from '@/lib/notifications';
import type { NotifPermission } from '@/lib/notifications';
import { HourglassLogo } from '@/components/Logo';

interface HeaderProps {
  dark: boolean;
  toggleDark: () => void;
  premium: boolean;
  theme: ThemeColors;
  themeKey: ThemeKey;
  changeTheme: (k: ThemeKey) => void;
  notifStatus: NotifPermission;
  onNotifRequest: () => void;
  onOpenPremium: () => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export function Header({
  dark,
  toggleDark,
  premium,
  theme,
  themeKey,
  changeTheme,
  notifStatus,
  onNotifRequest,
  onOpenPremium,
  user,
  onOpenAuth,
  onLogout,
}: HeaderProps) {
  const [showThemes, setShowThemes] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setShowThemes(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    }
    if (showThemes || showProfile) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showThemes, showProfile]);

  const initial = user ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/80 dark:border-gray-800/80 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-3">
        <div
          className="relative flex items-center justify-center w-10 h-10 rounded-xl text-white shadow-lg shrink-0"
          style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
        >
          <HourglassLogo className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white leading-none">
            Vaqtly
          </h1>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium hidden sm:block">
            Vaqtni tejash va unumdorlik platformasi
          </p>
        </div>

        {/* Notification button */}
        <button
          onClick={onNotifRequest}
          title="Bildirishnomalar"
          className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
        >
          <Bell className="w-5 h-5" strokeWidth={2} />
          <span
            className={`absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-white dark:ring-gray-900 ${
              notifStatus === 'granted' ? 'bg-emerald-500' : notifStatus === 'denied' ? 'bg-rose-500' : 'bg-amber-400'
            }`}
          />
        </button>

        {/* Theme picker (premium) */}
        {premium ? (
          <div className="relative" ref={popRef}>
            <button
              onClick={() => setShowThemes((s) => !s)}
              title="Rang mavzusi"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <Palette className="w-5 h-5" strokeWidth={2} />
            </button>
            {showThemes && (
              <div className="absolute right-0 top-12 w-48 p-2 rounded-2xl bg-white dark:bg-gray-800 shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 animate-scale-in origin-top-right">
                <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Mavzu rangi</p>
                <div className="grid grid-cols-3 gap-1">
                  {THEMES.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => {
                        changeTheme(t.key);
                        setShowThemes(false);
                      }}
                      className="relative flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span
                        className="w-6 h-6 rounded-full ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-800"
                        style={{ backgroundColor: t.accent, boxShadow: themeKey === t.key ? `0 0 0 2px ${t.accent}` : 'none' }}
                      />
                      {themeKey === t.key && <Check className="absolute top-1 right-1 w-3 h-3 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Dark mode */}
        <button
          onClick={toggleDark}
          title="Mavzu rejimi"
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Premium badge / user profile */}
        {user ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile((s) => !s)}
              className="flex items-center gap-2 h-10 pl-1 pr-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              <span
                className="flex items-center justify-center w-8 h-8 rounded-lg text-white text-sm font-bold"
                style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
              >
                {initial}
              </span>
              {premium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
            </button>
            {showProfile && (
              <div className="absolute right-0 top-12 w-60 p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 animate-scale-in origin-top-right">
                <div className="flex items-center gap-3 px-1 pb-3 border-b border-gray-100 dark:border-gray-700">
                  <span
                    className="flex items-center justify-center w-11 h-11 rounded-xl text-white text-base font-bold shrink-0"
                    style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
                  >
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="py-2 px-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Obuna tarifi</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                        premium ? 'bg-amber-500' : 'bg-gray-400'
                      }`}
                    >
                      {premium ? 'Premium' : 'Bepul'}
                    </span>
                  </div>
                  {!premium && (
                    <button
                      onClick={() => {
                        onOpenPremium();
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
                      style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
                    >
                      <Crown className="w-4 h-4" /> Premiumga oʻtish
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setShowProfile(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Tizimdan chiqish
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="inline-flex items-center gap-1.5 px-3 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors text-sm font-semibold"
          >
            <UserIcon className="w-4 h-4" /> <span className="hidden sm:inline">Kirish</span>
          </button>
        )}
      </div>
      {notifStatus === 'default' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-3 -mt-1">
          <button
            onClick={onNotifRequest}
            className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-500/20 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-500/15 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4" /> Vazifa vaqti kelganda bildirishnoma olish uchun ruxsat bering
            </span>
            <span className="text-xs font-bold whitespace-nowrap">Ruxsat berish →</span>
          </button>
        </div>
      )}
      {notifStatus === 'denied' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-3 -mt-1">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-200 dark:ring-rose-500/20 text-sm">
            <X className="w-4 h-4 shrink-0" /> Brauzer sozlamalaridan bildirishnoma ruxsatini yoqing.
          </div>
        </div>
      )}
    </header>
  );
}

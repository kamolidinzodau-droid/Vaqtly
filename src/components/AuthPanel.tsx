import { useState, type FormEvent } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader as Loader2 } from 'lucide-react';
import type { ThemeColors } from '@/lib/types';
import { HourglassLogo } from '@/components/Logo';

type Mode = 'login' | 'signup';

interface AuthPanelProps {
  theme: ThemeColors;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INPUT_CLASS =
  'w-full pl-10 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors';

function mapAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : '';
  if (msg === 'CONFIRMATION_REQUIRED') {
    return 'Hisob yaratildi. Kirish uchun email tasdiqlanishi kerak boʻlishi mumkin.';
  }
  if (msg.includes('Invalid login credentials')) return 'Email yoki parol notoʻgʻri.';
  if (msg.includes('already registered')) return 'Bu email bilan hisob allaqachon mavjud.';
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Juda koʻp urinish boʻldi. Biroz kutib qayta urinib koʻring.';
  }
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
    return 'Internet aloqasi yoʻq. Ulanishni tekshirib qayta urinib koʻring.';
  }
  return 'Xatolik yuz berdi. Qayta urinib koʻring.';
}

export function AuthPanel({ theme, onSignIn, onSignUp }: AuthPanelProps) {
  const [mode, setMode] = useState<Mode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isSignup = mode === 'signup';

  function switchMode(next: Mode) {
    setMode(next);
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (isSignup && name.trim().length < 2) {
      setError('Ismingizni kiriting (kamida 2 ta belgi).');
      return;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError('Email manzilini toʻgʻri kiriting.');
      return;
    }
    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat boʻlishi kerak.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (isSignup) await onSignUp(name.trim(), trimmedEmail, password);
      else await onSignIn(trimmedEmail, password);
    } catch (err) {
      setError(mapAuthError(err));
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center text-center mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4"
          style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
        >
          <HourglassLogo className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Vaqtly</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">Vaqtni tejash va unumdorlik platformasi</p>
      </div>

      <div className="p-6 rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700 animate-scale-in">
        <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-gray-100 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`py-2 rounded-lg text-sm font-bold transition-all ${
              isSignup
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Roʻyxatdan oʻtish
          </button>
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2 rounded-lg text-sm font-bold transition-all ${
              !isSignup
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Kirish
          </button>
        </div>

        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
          {isSignup ? 'Hisob yaratish' : 'Tizimga kirish'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-5">
          {isSignup
            ? 'Bepul hisob yarating va kun tartibingizni boshqaring'
            : 'Hisobingizga kirib rejalaringizni davom ettiring'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          {isSignup && (
            <label className="block">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Ismingiz</span>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ismingizni kiriting"
                  autoComplete="name"
                  className={INPUT_CLASS}
                />
              </div>
            </label>
          )}
          <label className="block">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Email</span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                autoComplete="email"
                className={INPUT_CLASS}
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Parol</span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kamida 6 ta belgi"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                className={INPUT_CLASS}
              />
            </div>
          </label>

          {error && (
            <p role="alert" className="text-sm text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 mt-1 rounded-xl text-white font-semibold text-sm shadow-lg transition-transform active:scale-[0.98] hover:opacity-90 disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Biroz kuting...
              </>
            ) : (
              <>
                {isSignup ? 'Hisob yaratish' : 'Kirish'} <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
          {isSignup ? 'Hisobingiz bormi?' : 'Hisobingiz yoʻqmi?'}{' '}
          <button
            type="button"
            onClick={() => switchMode(isSignup ? 'login' : 'signup')}
            className="font-bold hover:underline"
            style={{ color: theme.accent }}
          >
            {isSignup ? 'Tizimga kirish' : 'Roʻyxatdan oʻtish'}
          </button>
        </p>
      </div>
    </div>
  );
}

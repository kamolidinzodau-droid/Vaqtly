import { useState, useEffect, type FormEvent } from 'react';
import { X, Mail, Lock, User as UserIcon, Sparkles, ArrowRight } from 'lucide-react';
import type { ThemeColors, User } from '@/lib/types';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  theme: ThemeColors;
  onLogin: (user: User) => void;
}

export function AuthModal({ open, onClose, theme, onLogin }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setMode('signup');
      setName('');
      setEmail('');
      setPassword('');
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (mode === 'signup' && !name.trim()) return;
    setLoading(true);
    window.setTimeout(() => {
      onLogin({
        name: name.trim() || email.split('@')[0],
        email: email.trim(),
        provider: 'email',
      });
      setLoading(false);
    }, 900);
  }

  function handleGoogle() {
    setLoading(true);
    window.setTimeout(() => {
      onLogin({
        name: 'Foydalanuvchi',
        email: 'foydalanuvchi@gmail.com',
        provider: 'google',
      });
      setLoading(false);
    }, 900);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700 animate-scale-in overflow-hidden">
        <div
          className="relative px-6 pt-7 pb-6 text-white"
          style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest opacity-90">Vaqtly</span>
          </div>
          <h2 className="text-2xl font-extrabold leading-tight">
            {mode === 'signup' ? 'Hisob yaratish' : 'Tizimga kirish'}
          </h2>
          <p className="text-sm opacity-90 mt-1">
            {mode === 'signup' ? 'Mahsuldorligingizni boshqaring' : 'Hisobingizga kiring'}
          </p>
        </div>

        <div className="p-6">
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google bilan davom etish
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs font-medium text-gray-400">yoki</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Ismingiz</span>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ismingizni kiriting"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors"
                    style={{ borderColor: undefined }}
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
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors"
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
                  placeholder="Parolingiz"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold text-sm shadow-lg transition-transform active:scale-[0.98] hover:opacity-90 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
            >
              {loading ? 'Biroz kuting...' : mode === 'signup' ? 'Hisob yaratish' : 'Kirish'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
            {mode === 'signup' ? 'Hisobingiz bormi?' : 'Hisobingiz yoʻqmi?'}{' '}
            <button
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
              className="font-bold hover:underline"
              style={{ color: theme.accent }}
            >
              {mode === 'signup' ? 'Tizimga kirish' : "Roʻyxatdan oʻtish"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

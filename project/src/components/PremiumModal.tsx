import { useState, useEffect } from 'react';
import { X, Crown, Check, Loader2, Sparkles, Lock, Zap, Infinity as InfinityIcon, BarChart3, Gamepad2, Palette } from 'lucide-react';
import type { ThemeColors } from '@/lib/types';
import { PREMIUM_PRICE } from '@/lib/types';

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
  theme: ThemeColors;
  onUpgrade: () => void;
}

type Step = 'offer' | 'paying' | 'success';
type Method = 'click' | 'payme';

export function PremiumModal({ open, onClose, theme, onUpgrade }: PremiumModalProps) {
  const [step, setStep] = useState<Step>('offer');
  const [method, setMethod] = useState<Method | null>(null);

  useEffect(() => {
    if (open) {
      setStep('offer');
      setMethod(null);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && step !== 'paying') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, step, onClose]);

  if (!open) return null;

  function startPayment(m: Method) {
    setMethod(m);
    setStep('paying');
    window.setTimeout(() => {
      setStep('success');
      window.setTimeout(() => {
        onUpgrade();
        onClose();
      }, 1400);
    }, 2200);
  }

  const features = [
    { icon: InfinityIcon, text: 'Cheksiz vazifa qoʻshish' },
    { icon: Palette, text: '6 ta maxsus rang mavzusi' },
    { icon: BarChart3, text: 'Odatlar statistikasi va tahlili' },
    { icon: Gamepad2, text: "Barcha mini-oʻyinlarga toʻliq kirish" },
    { icon: Zap, text: 'Reklamasiz foydalanish' },
    { icon: Sparkles, text: 'Cheksiz qaydlar va eslatmalar' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-fade-in"
        onClick={() => step !== 'paying' && onClose()}
      />
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700 animate-scale-in overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div
          className="relative px-6 pt-7 pb-6 text-white"
          style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
        >
          <button
            onClick={() => step !== 'paying' && onClose()}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest opacity-90">Premium</span>
          </div>
          <h2 className="text-2xl font-extrabold leading-tight">Cheksiz imkoniyatlar</h2>
          <p className="text-sm opacity-90 mt-1">Vaqtly Premium versiyasiga oʻting</p>
        </div>

        <div className="p-6">
          {step === 'offer' && (
            <>
              <div className="space-y-2.5 mb-5">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-white shrink-0"
                      style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
                    >
                      <f.icon className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 flex-1">{f.text}</span>
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                ))}
              </div>

              <div className="flex items-baseline gap-1.5 mb-5 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{PREMIUM_PRICE}</span>
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">soʻm/oy</span>
              </div>

              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2.5 uppercase tracking-wider">
                Toʻlov usulini tanlang
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => startPayment('click')}
                  className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-gray-900 ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-blue-500 transition-all"
                >
                  <span className="w-12 h-12 rounded-xl bg-[#00b4ef] flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                    C
                  </span>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Click</span>
                </button>
                <button
                  onClick={() => startPayment('payme')}
                  className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-gray-900 ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-emerald-500 transition-all"
                >
                  <span className="w-12 h-12 rounded-xl bg-[#33cc66] flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                    P
                  </span>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Payme</span>
                </button>
              </div>
              <p className="mt-4 text-center text-[11px] text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Bu demo toʻlov — haqiqiy pul yechib olinmaydi
              </p>
            </>
          )}

          {step === 'paying' && (
            <div className="py-10 flex flex-col items-center text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: method === 'click' ? '#00b4ef' : '#33cc66' }}
              >
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              </div>
              <p className="font-bold text-gray-900 dark:text-white">
                {method === 'click' ? 'Click' : 'Payme'} orqali toʻlov amalga oshirilmoqda...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Iltimos kuting</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30 animate-scale-in">
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
              <p className="font-bold text-lg text-gray-900 dark:text-white">Toʻlov muvaffaqiyatli!</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Premiumga oʻtildi — barcha imkoniyatlar faol</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

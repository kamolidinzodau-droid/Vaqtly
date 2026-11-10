import { useState, useEffect, useCallback, useRef } from 'react';
import { Gamepad2, Play, RefreshCw, Trophy, Zap } from 'lucide-react';
import { playSuccess, playFail, playClick } from '@/lib/audio';
import type { ThemeColors } from '@/lib/types';

interface ColorMatchGameProps {
  theme: ThemeColors;
}

type GameState = 'idle' | 'playing' | 'over';

interface ColorEntry {
  hex: string;
  name: string;
}

interface Round {
  promptColor: ColorEntry;
  promptWord: ColorEntry;
  options: { color: string; label: string }[];
}

const COLORS = [
  { hex: '#ef4444', name: 'Qizil' },
  { hex: '#3b82f6', name: 'Koʻk' },
  { hex: '#10b981', name: 'Yashil' },
  { hex: '#f59e0b', name: 'Sariq' },
  { hex: '#8b5cf6', name: 'Binafsha' },
  { hex: '#ec4899', name: 'Pushti' },
];

function makeRound(): Round {
  const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
  const promptColor = shuffled[Math.floor(Math.random() * shuffled.length)];
  // The prompt shows a color NAME in a different color to create the Stroop effect
  const promptWord = COLORS[Math.floor(Math.random() * COLORS.length)];
  const options = shuffled.slice(0, 4).map((c) => ({ color: c.hex, label: c.name }));
  return { promptColor, promptWord, options };
}

export function ColorMatchGame({ theme }: ColorMatchGameProps) {
  const [state, setState] = useState<GameState>('idle');
  const [round, setRound] = useState<Round | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const timerRef = useRef<number | null>(null);

  const startGame = useCallback(() => {
    setState('playing');
    setScore(0);
    setTimeLeft(30);
    setRound(makeRound());
  }, []);

  const stopGame = useCallback(() => {
    setState('over');
    if (timerRef.current) window.clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (state !== 'playing') return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [state]);

  useEffect(() => {
    if (state === 'playing' && timeLeft === 0) {
      stopGame();
      setBest((b) => Math.max(b, score));
    }
  }, [timeLeft, state, score, stopGame]);

  function answer(color: string) {
    if (state !== 'playing' || !round) return;
    if (color === round.promptColor.hex) {
      setScore((s) => s + 1);
      setFeedback('correct');
      playSuccess();
    } else {
      setScore((s) => Math.max(0, s - 1));
      setFeedback('wrong');
      playFail();
    }
    window.setTimeout(() => setFeedback(null), 300);
    setRound(makeRound());
  }

  if (state === 'idle') {
    return (
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur ring-1 ring-gray-200 dark:ring-gray-700 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
        >
          <Gamepad2 className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Rang moslash oʻyini</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 mb-5 max-w-xs mx-auto leading-relaxed">
          Koʻrsatilgan rang nomiga emas, rangning oʻziga mos keladigan tugmani bosing. 30 soniyada nechta toʻgʻri topasiz?
        </p>
        <button
          onClick={() => { playClick(); startGame(); }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-transform active:scale-95"
          style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
        >
          <Play className="w-4 h-4" /> Boshlash
        </button>
      </div>
    );
  }

  if (state === 'over') {
    return (
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur ring-1 ring-gray-200 dark:ring-gray-700 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Oʻyin tugadi!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sizning natijangiz</p>
        <p className="text-5xl font-extrabold my-3" style={{ color: theme.accent }}>{score}</p>
        <p className="text-sm text-gray-400 mb-5">Eng yaxshi: {Math.max(best, score)}</p>
        <button
          onClick={() => { playClick(); startGame(); }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-transform active:scale-95"
          style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
        >
          <RefreshCw className="w-4 h-4" /> Qayta oʻynash
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur ring-1 ring-gray-200 dark:ring-gray-700">
      {/* Score bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">{score}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm tabular-nums ${timeLeft <= 10 ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700'}`}>
          <Zap className="w-4 h-4" />
          {timeLeft}s
        </div>
      </div>

      {/* Prompt */}
      {round && (
        <div className="text-center mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Bu qaysi rang?</p>
          <div
            className={`inline-block px-8 py-4 rounded-2xl text-3xl font-extrabold transition-transform ${feedback === 'correct' ? 'scale-105' : feedback === 'wrong' ? 'scale-95' : ''}`}
            style={{ color: round.promptColor.hex, backgroundColor: `${round.promptColor.hex}15` }}
          >
            {round.promptWord.name}
          </div>
        </div>
      )}

      {/* Options */}
      {round && (
        <div className="grid grid-cols-2 gap-3">
          {round.options.map((opt) => (
            <button
              key={opt.color}
              onClick={() => answer(opt.color)}
              className="h-16 rounded-2xl font-bold text-white text-sm shadow-md transition-all active:scale-95 hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${opt.color}, ${opt.color}dd)` }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

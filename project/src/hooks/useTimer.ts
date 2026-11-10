import { useCallback, useEffect, useRef, useState } from 'react';
import { playTimerEnd } from '@/lib/audio';
import { showNotification } from '@/lib/notifications';

export type TimerMode = 'work' | 'break';

export const TIMER_PRESETS = {
  work: 25 * 60,
  break: 5 * 60,
} as const;

interface TimerState {
  mode: TimerMode;
  remaining: number; // seconds
  running: boolean;
  completedWork: number; // count of completed work sessions
}

export function useTimer(enabled: boolean) {
  const [state, setState] = useState<TimerState>({
    mode: 'work',
    remaining: TIMER_PRESETS.work,
    running: false,
    completedWork: 0,
  });

  const tickRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    setState((prev) => {
      if (prev.remaining <= 1) {
        // Session complete
        const wasWork = prev.mode === 'work';
        const nextMode: TimerMode = wasWork ? 'break' : 'work';
        if (enabled) {
          showNotification(
            wasWork ? 'Fokus tugadi!' : 'Tanaffus tugadi!',
            wasWork ? 'Barakalla! Endi 5 daqiqalik tanaffus qiling.' : 'Tanaffus tugadi. Yana fokusga qaytishingiz mumkin!'
          );
          playTimerEnd();
        }
        return {
          mode: nextMode,
          remaining: TIMER_PRESETS[nextMode],
          running: false,
          completedWork: prev.completedWork + (wasWork ? 1 : 0),
        };
      }
      return { ...prev, remaining: prev.remaining - 1 };
    });
  }, [enabled]);

  useEffect(() => {
    if (state.running) {
      tickRef.current = window.setInterval(tick, 1000);
      return () => {
        if (tickRef.current) window.clearInterval(tickRef.current);
      };
    }
    return undefined;
  }, [state.running, tick]);

  const start = useCallback(() => setState((p) => ({ ...p, running: true })), []);
  const pause = useCallback(() => setState((p) => ({ ...p, running: false })), []);
  const reset = useCallback(() => {
    setState((p) => ({ ...p, remaining: TIMER_PRESETS[p.mode], running: false }));
  }, []);
  const switchMode = useCallback((mode: TimerMode) => {
    setState({ mode, remaining: TIMER_PRESETS[mode], running: false, completedWork: 0 });
  }, []);

  const minutes = Math.floor(state.remaining / 60);
  const seconds = state.remaining % 60;
  const progress = 1 - state.remaining / TIMER_PRESETS[state.mode];

  return {
    mode: state.mode,
    remaining: state.remaining,
    running: state.running,
    completedWork: state.completedWork,
    minutes,
    seconds,
    progress,
    start,
    pause,
    reset,
    switchMode,
  };
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { storage } from '@/lib/storage';
import type { Habit } from '@/lib/types';
import { FREE_HABIT_LIMIT } from '@/lib/types';
import { todayISO } from '@/lib/dates';
import { computeStreak } from '@/lib/dates';

const SAMPLE_HABITS: Habit[] = [
  { id: 'h1', name: '2 litr suv ichish', icon: 'Droplets', color: '#0891b2', history: [], createdAt: 1 },
  { id: 'h2', name: 'Sport qilish', icon: 'Dumbbell', color: '#e11d48', history: [], createdAt: 2 },
  { id: 'h3', name: 'Kitob oʻqish', icon: 'BookOpen', color: '#7c3aed', history: [], createdAt: 3 },
];

interface AddResult {
  ok: boolean;
  reason?: 'limit';
}

export function useHabits(premium: boolean) {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const stored = storage.getHabits();
    if (stored.length > 0) return stored;
    storage.saveHabits(SAMPLE_HABITS);
    return SAMPLE_HABITS;
  });

  useEffect(() => {
    storage.saveHabits(habits);
  }, [habits]);

  const limit = premium ? Infinity : FREE_HABIT_LIMIT;

  const addHabit = useCallback(
    (name: string, icon: string, color: string): AddResult => {
      if (habits.length >= limit) return { ok: false, reason: 'limit' };
      const habit: Habit = {
        id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: name.trim(),
        icon,
        color,
        history: [],
        createdAt: Date.now(),
      };
      setHabits((prev) => [...prev, habit]);
      return { ok: true };
    },
    [habits.length, limit]
  );

  const toggleToday = useCallback((id: string) => {
    const today = todayISO();
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const has = h.history.includes(today);
        return {
          ...h,
          history: has ? h.history.filter((d) => d !== today) : [...h.history, today],
        };
      })
    );
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const today = todayISO();
  const stats = useMemo(() => {
    const total = habits.length;
    const done = habits.filter((h) => h.history.includes(today)).length;
    return { total, done, remaining: total - done };
  }, [habits, today]);

  const streaks = useMemo(() => {
    const map: Record<string, number> = {};
    for (const h of habits) {
      map[h.id] = computeStreak(h.history);
    }
    return map;
  }, [habits]);

  return { habits, addHabit, toggleToday, deleteHabit, stats, streaks };
}

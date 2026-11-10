import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ActionResult, Habit } from '@/lib/types';
import { todayISO, computeStreak, longestStreak } from '@/lib/dates';
import { LOAD_ERROR_MESSAGE, SAVE_ERROR_MESSAGE } from '@/lib/messages';

interface HabitRow {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface LogRow {
  habit_id: string;
  log_date: string;
}

export function useHabits(onError: (msg: string) => void) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const today = todayISO();

  useEffect(() => {
    let active = true;
    (async () => {
      const [habitsRes, logsRes] = await Promise.all([
        supabase.from('habits').select('id, name, icon, color').order('created_at'),
        supabase.from('habit_logs').select('habit_id, log_date'),
      ]);
      if (!active) return;
      if (habitsRes.error || logsRes.error) {
        onError(LOAD_ERROR_MESSAGE);
      } else {
        const logs = logsRes.data as LogRow[];
        setHabits(
          (habitsRes.data as HabitRow[]).map((h) => ({
            id: h.id,
            name: h.name,
            icon: h.icon,
            color: h.color,
            history: logs.filter((l) => l.habit_id === h.id).map((l) => l.log_date),
          }))
        );
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [onError]);

  const addHabit = useCallback(
    async (name: string, icon: string, color: string): Promise<ActionResult> => {
      const { data, error } = await supabase
        .from('habits')
        .insert({ name: name.trim(), icon, color })
        .select('id, name, icon, color')
        .single();
      if (error) {
        if (error.message.includes('HABIT_LIMIT_REACHED')) return { ok: false, reason: 'limit' };
        onError(SAVE_ERROR_MESSAGE);
        return { ok: false, reason: 'error' };
      }
      const row = data as HabitRow;
      setHabits((prev) => [...prev, { ...row, history: [] }]);
      return { ok: true };
    },
    [onError]
  );

  const toggleToday = useCallback(
    async (id: string) => {
      const habit = habits.find((h) => h.id === id);
      if (!habit) return;
      const done = habit.history.includes(today);
      const nextHistory = done ? habit.history.filter((d) => d !== today) : [...habit.history, today];
      setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, history: nextHistory } : h)));
      const { error } = done
        ? await supabase.from('habit_logs').delete().eq('habit_id', id).eq('log_date', today)
        : await supabase.from('habit_logs').insert({ habit_id: id, log_date: today });
      if (error) {
        setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, history: habit.history } : h)));
        onError(SAVE_ERROR_MESSAGE);
      }
    },
    [habits, today, onError]
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('habits').delete().eq('id', id);
      if (error) {
        onError(SAVE_ERROR_MESSAGE);
        return;
      }
      setHabits((prev) => prev.filter((h) => h.id !== id));
    },
    [onError]
  );

  const stats = useMemo(() => {
    const total = habits.length;
    const done = habits.filter((h) => h.history.includes(today)).length;
    return { total, done, remaining: total - done };
  }, [habits, today]);

  const streaks = useMemo(() => {
    const map: Record<string, number> = {};
    for (const h of habits) map[h.id] = computeStreak(h.history);
    return map;
  }, [habits]);

  const bestStreak = useMemo(
    () => habits.reduce((best, h) => Math.max(best, longestStreak(h.history)), 0),
    [habits]
  );

  const totalCheckins = useMemo(
    () => habits.reduce((sum, h) => sum + h.history.length, 0),
    [habits]
  );

  return {
    habits,
    loading,
    addHabit,
    toggleToday,
    deleteHabit,
    stats,
    streaks,
    bestStreak,
    totalCheckins,
  };
}

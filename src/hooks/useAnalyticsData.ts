import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { addDays, lastNDates, todayISO } from '@/lib/dates';
import { LOAD_ERROR_MESSAGE } from '@/lib/messages';

export interface DayTaskStats {
  date: string;
  total: number;
  done: number;
}

interface TaskDayRow {
  task_date: string;
  completed: boolean;
}

export function useWeeklyTasks(onError: (msg: string) => void) {
  const [rows, setRows] = useState<TaskDayRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const from = addDays(todayISO(), -6);
      const { data, error } = await supabase
        .from('tasks')
        .select('task_date, completed')
        .gte('task_date', from);
      if (!active) return;
      if (error) {
        onError(LOAD_ERROR_MESSAGE);
      } else {
        setRows(data as TaskDayRow[]);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [onError]);

  const days: DayTaskStats[] = lastNDates(7).map((date) => {
    const dayRows = rows.filter((r) => r.task_date === date);
    return { date, total: dayRows.length, done: dayRows.filter((r) => r.completed).length };
  });

  return { days, loading };
}

export function useCompletedTaskCount(onError: (msg: string) => void) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { count: total, error } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('completed', true);
      if (!active) return;
      if (error) {
        onError(LOAD_ERROR_MESSAGE);
        return;
      }
      setCount(total ?? 0);
    })();
    return () => {
      active = false;
    };
  }, [onError]);

  return count;
}

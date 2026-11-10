import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ActionResult, Task } from '@/lib/types';
import { todayISO } from '@/lib/dates';
import { playAlert } from '@/lib/audio';
import { showNotification } from '@/lib/notifications';
import { LOAD_ERROR_MESSAGE, SAVE_ERROR_MESSAGE } from '@/lib/messages';

interface TaskRow {
  id: string;
  time_of_day: string;
  title: string;
  description: string;
  completed: boolean;
}

const TASK_COLUMNS = 'id, time_of_day, title, description, completed';

function mapTask(r: TaskRow): Task {
  return {
    id: r.id,
    time: r.time_of_day,
    title: r.title,
    description: r.description,
    completed: r.completed,
  };
}

function sortTasks(list: Task[]): Task[] {
  return [...list].sort((a, b) => a.time.localeCompare(b.time));
}

export function useSchedule(enabled: boolean, onError: (msg: string) => void) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const today = todayISO();

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(TASK_COLUMNS)
        .eq('task_date', today)
        .order('time_of_day')
        .order('created_at');
      if (!active) return;
      if (error) {
        onError(LOAD_ERROR_MESSAGE);
      } else {
        setTasks(sortTasks((data as TaskRow[]).map(mapTask)));
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [today, onError]);

  const addTask = useCallback(
    async (time: string, title: string, description: string): Promise<ActionResult> => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          task_date: today,
          time_of_day: time,
          title: title.trim(),
          description: description.trim(),
        })
        .select(TASK_COLUMNS)
        .single();
      if (error) {
        if (error.message.includes('TASK_LIMIT_REACHED')) return { ok: false, reason: 'limit' };
        onError(SAVE_ERROR_MESSAGE);
        return { ok: false, reason: 'error' };
      }
      setTasks((prev) => sortTasks([...prev, mapTask(data as TaskRow)]));
      return { ok: true };
    },
    [today, onError]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const next = !task.completed;
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: next } : t)));
      const { error } = await supabase.from('tasks').update({ completed: next }).eq('id', id);
      if (error) {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: task.completed } : t)));
        onError(SAVE_ERROR_MESSAGE);
      }
    },
    [tasks, onError]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) {
        onError(SAVE_ERROR_MESSAGE);
        return;
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [onError]
  );

  const clearCompleted = useCallback(async () => {
    const { error } = await supabase.from('tasks').delete().eq('task_date', today).eq('completed', true);
    if (error) {
      onError(SAVE_ERROR_MESSAGE);
      return;
    }
    setTasks((prev) => prev.filter((t) => !t.completed));
  }, [today, onError]);

  const firedRef = useRef<Set<string>>(new Set());
  const lastMinRef = useRef<string>('');

  useEffect(() => {
    if (!enabled) return undefined;
    const check = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const key = `${hh}:${mm}`;
      if (key === lastMinRef.current) return;
      lastMinRef.current = key;
      for (const t of tasks) {
        if (t.time !== key || t.completed) continue;
        const fireKey = `${t.id}_${key}`;
        if (firedRef.current.has(fireKey)) continue;
        firedRef.current.add(fireKey);
        showNotification(`Soat ${key} boʻldi!`, `${t.title || 'Vazifa'} vaqti!`);
        playAlert();
      }
    };
    check();
    const interval = window.setInterval(check, 5000);
    return () => window.clearInterval(interval);
  }, [enabled, tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    return { total, done, remaining: total - done };
  }, [tasks]);

  return { tasks, loading, addTask, toggleTask, deleteTask, clearCompleted, stats };
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { storage } from '@/lib/storage';
import type { Task } from '@/lib/types';
import { playAlert } from '@/lib/audio';
import { showNotification } from '@/lib/notifications';
import { FREE_TASK_LIMIT } from '@/lib/types';

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.time !== b.time) return a.time.localeCompare(b.time);
    return a.createdAt - b.createdAt;
  });
}

interface AddResult {
  ok: boolean;
  reason?: 'limit';
}

const SAMPLE_TASKS: Task[] = [
  { id: 's1', time: '07:00', title: 'Uygʻonish va tonggi mashq', description: 'Choʻzilish va 15 daqiqalik yurish.', completed: false, createdAt: 1 },
  { id: 's2', time: '08:00', title: 'Nonushta', description: 'Sut, tuxum va mevalar bilan sogʻlom nonushta.', completed: false, createdAt: 2 },
  { id: 's3', time: '13:00', title: 'Tushlik va dam olish', description: 'Issiq ovqat va qisqa dam olish.', completed: false, createdAt: 3 },
  { id: 's4', time: '15:00', title: 'Fokusli ish', description: 'Pomodoro taymer bilan chuqur ish.', completed: false, createdAt: 4 },
];

export function useSchedule(enabled: boolean, premium: boolean) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = storage.getTasks();
    if (stored.length > 0) return sortTasks(stored);
    const seeded = sortTasks(SAMPLE_TASKS);
    storage.saveTasks(seeded);
    return seeded;
  });

  useEffect(() => {
    storage.saveTasks(tasks);
  }, [tasks]);

  const limit = premium ? Infinity : FREE_TASK_LIMIT;

  const addTask = useCallback(
    (time: string, title: string, description: string): AddResult => {
      if (tasks.length >= limit) {
        return { ok: false, reason: 'limit' };
      }
      const task: Task = {
        id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        time,
        title: title.trim(),
        description: description.trim(),
        completed: false,
        createdAt: Date.now(),
      };
      setTasks((prev) => sortTasks([...prev, task]));
      return { ok: true };
    },
    [tasks.length, limit]
  );

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  }, []);

  // --- Real-time notification checker ---
  const firedRef = useRef<Set<string>>(new Set());
  const lastMinRef = useRef<string>('');

  useEffect(() => {
    if (!enabled) return;
    const check = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const key = `${hh}:${mm}`;
      if (key === lastMinRef.current) return;
      lastMinRef.current = key;
      for (const t of tasks) {
        if (t.time !== key) continue;
        const fireKey = `${t.id}_${key}`;
        if (firedRef.current.has(fireKey)) continue;
        firedRef.current.add(fireKey);
        const display = t.title || 'Vazifa';
        showNotification(`Soat ${key} boʻldi!`, `${display} vaqti!`);
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

  return { tasks, addTask, toggleTask, deleteTask, clearCompleted, stats };
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { storage } from '@/lib/storage';
import type { Note } from '@/lib/types';
import { FREE_NOTE_LIMIT } from '@/lib/types';

interface AddResult {
  ok: boolean;
  reason?: 'limit';
}

export function useNotes(premium: boolean) {
  const [notes, setNotes] = useState<Note[]>(() => storage.getNotes());

  useEffect(() => {
    storage.saveNotes(notes);
  }, [notes]);

  const limit = premium ? Infinity : FREE_NOTE_LIMIT;

  const addNote = useCallback(
    (title: string, body: string, color: string): AddResult => {
      if (notes.length >= limit) return { ok: false, reason: 'limit' };
      const now = Date.now();
      const note: Note = {
        id: `n_${now}_${Math.random().toString(36).slice(2, 7)}`,
        title: title.trim(),
        body: body.trim(),
        color,
        createdAt: now,
        updatedAt: now,
      };
      setNotes((prev) => [note, ...prev]);
      return { ok: true };
    },
    [notes.length, limit]
  );

  const updateNote = useCallback((id: string, title: string, body: string, color?: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, title: title.trim(), body: body.trim(), color: color ?? n.color, updatedAt: Date.now() }
          : n
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const stats = useMemo(() => ({ total: notes.length }), [notes]);

  return { notes, addNote, updateNote, deleteNote, stats };
}

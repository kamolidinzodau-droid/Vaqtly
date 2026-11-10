import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ActionResult, Note } from '@/lib/types';
import { LOAD_ERROR_MESSAGE, SAVE_ERROR_MESSAGE } from '@/lib/messages';

interface NoteRow {
  id: string;
  title: string;
  body: string;
  color: string;
  created_at: string;
  updated_at: string;
}

const NOTE_COLUMNS = 'id, title, body, color, created_at, updated_at';

function mapNote(r: NoteRow): Note {
  return {
    id: r.id,
    title: r.title,
    body: r.body,
    color: r.color,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function useNotes(onError: (msg: string) => void) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('notes')
        .select(NOTE_COLUMNS)
        .order('created_at', { ascending: false });
      if (!active) return;
      if (error) {
        onError(LOAD_ERROR_MESSAGE);
      } else {
        setNotes((data as NoteRow[]).map(mapNote));
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [onError]);

  const addNote = useCallback(
    async (title: string, body: string, color: string): Promise<ActionResult> => {
      const { data, error } = await supabase
        .from('notes')
        .insert({ title: title.trim(), body: body.trim(), color })
        .select(NOTE_COLUMNS)
        .single();
      if (error) {
        if (error.message.includes('NOTE_LIMIT_REACHED')) return { ok: false, reason: 'limit' };
        onError(SAVE_ERROR_MESSAGE);
        return { ok: false, reason: 'error' };
      }
      setNotes((prev) => [mapNote(data as NoteRow), ...prev]);
      return { ok: true };
    },
    [onError]
  );

  const updateNote = useCallback(
    async (id: string, title: string, body: string, color: string): Promise<ActionResult> => {
      const { data, error } = await supabase
        .from('notes')
        .update({ title: title.trim(), body: body.trim(), color, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(NOTE_COLUMNS)
        .single();
      if (error) {
        onError(SAVE_ERROR_MESSAGE);
        return { ok: false, reason: 'error' };
      }
      const updated = mapNote(data as NoteRow);
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      return { ok: true };
    },
    [onError]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) {
        onError(SAVE_ERROR_MESSAGE);
        return;
      }
      setNotes((prev) => prev.filter((n) => n.id !== id));
    },
    [onError]
  );

  return { notes, loading, addNote, updateNote, deleteNote, stats: { total: notes.length } };
}

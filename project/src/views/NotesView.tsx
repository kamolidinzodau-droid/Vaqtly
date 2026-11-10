import { useState, type FormEvent } from 'react';
import { StickyNote, Plus, Trash2, X, Edit3, Crown } from 'lucide-react';
import { ViewHeader } from '@/components/ViewHeader';
import type { Note, ThemeColors } from '@/lib/types';
import { FREE_NOTE_LIMIT } from '@/lib/types';

interface NotesViewProps {
  theme: ThemeColors;
  notes: Note[];
  stats: { total: number };
  premium: boolean;
  onAdd: (title: string, body: string, color: string) => { ok: boolean; reason?: 'limit' };
  onUpdate: (id: string, title: string, body: string, color?: string) => void;
  onDelete: (id: string) => void;
  onOpenPremium: () => void;
}

const NOTE_COLORS = [
  { bg: 'bg-yellow-100 dark:bg-yellow-500/15', text: 'text-yellow-900 dark:text-yellow-100', hex: '#fde047' },
  { bg: 'bg-blue-100 dark:bg-blue-500/15', text: 'text-blue-900 dark:text-blue-100', hex: '#93c5fd' },
  { bg: 'bg-green-100 dark:bg-green-500/15', text: 'text-green-900 dark:text-green-100', hex: '#86efac' },
  { bg: 'bg-pink-100 dark:bg-pink-500/15', text: 'text-pink-900 dark:text-pink-100', hex: '#f9a8d4' },
  { bg: 'bg-orange-100 dark:bg-orange-500/15', text: 'text-orange-900 dark:text-orange-100', hex: '#fdba74' },
  { bg: 'bg-purple-100 dark:bg-purple-500/15', text: 'text-purple-900 dark:text-purple-100', hex: '#d8b4fe' },
];

function colorFor(hex: string) {
  return NOTE_COLORS.find((c) => c.hex === hex) ?? NOTE_COLORS[0];
}

export function NotesView({ theme, notes, stats, premium, onAdd, onUpdate, onDelete, onOpenPremium }: NotesViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [color, setColor] = useState(NOTE_COLORS[0].hex);
  const [error, setError] = useState('');

  function reset() {
    setTitle('');
    setBody('');
    setColor(NOTE_COLORS[0].hex);
    setEditId(null);
    setError('');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() && !body.trim()) {
      setError('Kamida bitta maydonni toʻldiring');
      return;
    }
    if (editId) {
      onUpdate(editId, title, body, color);
    } else {
      const result = onAdd(title, body, color);
      if (!result.ok && result.reason === 'limit') {
        onOpenPremium();
        return;
      }
    }
    setShowForm(false);
    reset();
  }

  function startEdit(note: Note) {
    setEditId(note.id);
    setTitle(note.title);
    setBody(note.body);
    setColor(note.color);
    setShowForm(true);
  }

  return (
    <div className="space-y-5">
      <ViewHeader
        title="Tezkor qaydlar"
        subtitle="Fikrlaringizni va eslatmalaringizni saqlang"
        icon={<StickyNote className="w-5 h-5" strokeWidth={2.5} />}
        accent={theme.accent}
      />

      {!showForm ? (
        <button
          onClick={() => { reset(); setShowForm(true); }}
          className="w-full group flex items-center gap-3 px-4 py-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 transition-all"
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}
        >
          <span
            className="flex items-center justify-center w-9 h-9 rounded-xl text-white transition-transform group-hover:scale-110"
            style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </span>
          <span className="font-semibold">Yangi qayd yaratish</span>
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 animate-scale-in"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">{editId ? 'Qaydni tahrirlash' : 'Yangi qayd'}</h3>
            <button
              type="button"
              onClick={() => { setShowForm(false); reset(); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sarlavha (ixtiyoriy)"
            className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 mb-3 font-semibold"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Fikringizni yozing..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 resize-none mb-3"
          />
          <div className="flex gap-2 mb-4">
            {NOTE_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                className={`w-7 h-7 rounded-full transition-all ${color === c.hex ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 scale-110' : ''} ${c.bg}`}
                style={color === c.hex ? { boxShadow: `0 0 0 2px ${c.hex}` } : undefined}
              />
            ))}
          </div>
          {error && <p className="mb-3 text-sm text-rose-500 font-medium">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold text-sm shadow-lg transition-transform active:scale-[0.98] hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
            >
              {editId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editId ? 'Saqlash' : 'Qoʻshish'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); reset(); }}
              className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Bekor qilish
            </button>
          </div>
        </form>
      )}

      {/* Notes grid */}
      {notes.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <StickyNote className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Hozircha qaydlar yoʻq</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Fikrlaringizni tezda yozib qoʻying</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {notes.map((note, idx) => {
            const c = colorFor(note.color);
            return (
              <div
                key={note.id}
                className={`group relative p-4 rounded-2xl ${c.bg} ring-1 ring-black/5 dark:ring-white/5 animate-slide-up`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  {note.title && (
                    <h3 className={`font-bold text-sm ${c.text} leading-tight`}>{note.title}</h3>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => startEdit(note)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={() => onDelete(note.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
                {note.body && (
                  <p className={`text-sm ${c.text} opacity-90 mt-1.5 whitespace-pre-wrap break-words leading-relaxed`}>
                    {note.body}
                  </p>
                )}
                <p className="text-[10px] opacity-50 mt-2" style={{ color: c.hex === '#fde047' ? '#854d0e' : '#666' }}>
                  {new Date(note.updatedAt).toLocaleDateString('uz')}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {!premium && notes.length > 0 && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur ring-1 ring-gray-200 dark:ring-gray-700 animate-fade-in">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 whitespace-nowrap">
            Bepul
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
            {stats.total} / {FREE_NOTE_LIMIT} qayd ishlatildi
          </p>
          <button
            onClick={onOpenPremium}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white whitespace-nowrap hover:opacity-90 transition-opacity"
            style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
          >
            <Crown className="w-3.5 h-3.5" /> Premium
          </button>
        </div>
      )}
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { Plus, Clock, X } from 'lucide-react';
import type { ThemeColors } from '@/lib/types';

interface AddTaskFormProps {
  theme: ThemeColors;
  onAdd: (time: string, title: string, description: string) => { ok: boolean; reason?: 'limit' };
}

export function AddTaskForm({ theme, onAdd }: AddTaskFormProps) {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!time) {
      setError('Vaqtini kiriting');
      return;
    }
    if (!title.trim()) {
      setError('Vazifa nomini kiriting');
      return;
    }
    const result = onAdd(time, title, description);
    if (!result.ok) {
      // Limit reached â handled by parent modal trigger
      setOpen(false);
      setTime('');
      setTitle('');
      setDescription('');
      setError('');
      return;
    }
    setOpen(false);
    setTime('');
    setTitle('');
    setDescription('');
    setError('');
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full group flex items-center gap-3 px-4 py-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-white transition-all"
        style={{ borderColor: undefined }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = theme.accent;
          e.currentTarget.style.color = theme.accent;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '';
          e.currentTarget.style.color = '';
        }}
      >
        <span
          className="flex items-center justify-center w-9 h-9 rounded-xl text-white transition-transform group-hover:scale-110"
          style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </span>
        <span className="font-semibold">Yangi vazifa qoʻshish</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 animate-scale-in"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white">Yangi vazifa</h3>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError('');
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Vaqt
          </span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 transition-colors"
            style={{ borderColor: undefined }}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Vazifa nomi</span>
          <input
            type="text"
            value={title}
            placeholder="Masalan: Nonushta"
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors"
            style={{ borderColor: undefined }}
          />
        </label>
      </div>

      <label className="block mt-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Izoh (ixtiyoriy)</span>
        <textarea
          value={description}
          placeholder="Qisqacha tavsif..."
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors resize-none"
        />
      </label>

      {error && <p className="mt-3 text-sm text-rose-500 font-medium">{error}</p>}

      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold text-sm shadow-lg transition-transform active:scale-[0.98] hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})` }}
        >
          <Plus className="w-4 h-4" /> Qoʻshish
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError('');
          }}
          className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Bekor qilish
        </button>
      </div>
    </form>
  );
}

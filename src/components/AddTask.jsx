import { useState } from 'react';
import { addTask, addAdHocTask } from '../utils/storage.js';

export default function AddTask({ onClose, onTaskAdded }) {
  const [mode, setMode] = useState('new'); // 'new' or 'adhoc'
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    try {
      if (mode === 'adhoc') {
        await addAdHocTask(trimmed);
      } else {
        const dueAt = dueDate ? new Date(dueDate + 'T23:59:59').getTime() : null;
        await addTask(trimmed, dueAt, isUrgent);
      }
      onTaskAdded?.();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 pb-[env(safe-area-inset-bottom)] sm:pb-5">
        {/* Mode toggle */}
        <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1 mb-4">
          <button
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === 'new' ? 'bg-slate-600 text-white' : 'text-slate-400'
            }`}
            onClick={() => setMode('new')}
          >
            New Task
          </button>
          <button
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === 'adhoc' ? 'bg-slate-600 text-white' : 'text-slate-400'
            }`}
            onClick={() => setMode('adhoc')}
          >
            I did something
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={mode === 'adhoc' ? 'What did you do?' : 'What needs to be done?'}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 mb-3"
            autoFocus
          />

          {mode === 'new' && (
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 mb-3 [color-scheme:dark]"
            />
          )}

          {mode === 'new' && (
            <button
              type="button"
              className={`w-full flex items-center gap-2 rounded-lg px-4 py-3 mb-3 text-sm transition-colors ${
                isUrgent
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-slate-700 text-slate-400'
              }`}
              onClick={() => setIsUrgent(!isUrgent)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
              {isUrgent ? 'Marked as urgent' : 'Mark as urgent'}
            </button>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 py-3 rounded-lg text-slate-400 hover:text-white transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim() || saving}
              className="flex-1 py-3 rounded-lg bg-blue-500 text-white font-medium disabled:opacity-40 transition-opacity"
            >
              {mode === 'adhoc' ? 'Log it' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { updateTask, completeTask, deleteTask } from '../utils/storage.js';

function formatDueBadge(dueAt) {
  if (!dueAt) return null;
  const diffDays = Math.ceil((dueAt - Date.now()) / (1000 * 60 * 60 * 24));
  const due = new Date(dueAt);
  if (diffDays < 0) return { text: `${-diffDays}d overdue`, cls: 'bg-red-500/20 text-red-400' };
  if (diffDays === 0) return { text: 'Today', cls: 'bg-amber-500/20 text-amber-400' };
  if (diffDays === 1) return { text: 'Tomorrow', cls: 'bg-amber-500/20 text-amber-300' };
  return { text: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), cls: 'bg-slate-700 text-slate-300' };
}

export default function TaskItem({ task, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editDue, setEditDue] = useState(
    task.dueAt ? new Date(task.dueAt).toISOString().split('T')[0] : ''
  );

  async function handleSave() {
    const trimmed = editText.trim();
    if (!trimmed) return;
    const dueAt = editDue ? new Date(editDue + 'T23:59:59').getTime() : null;
    await updateTask(task.id, { text: trimmed, dueAt });
    setEditing(false);
    onUpdated?.();
  }

  async function handleToggleUrgent() {
    await updateTask(task.id, { isUrgent: !task.isUrgent });
    onUpdated?.();
  }

  async function handleComplete() {
    await completeTask(task.id);
    onUpdated?.();
  }

  async function handleDelete() {
    await deleteTask(task.id);
    onUpdated?.();
  }

  const dueBadge = formatDueBadge(task.dueAt);

  if (editing) {
    return (
      <div className="bg-slate-800 rounded-xl p-3 flex flex-col gap-2">
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="bg-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <input
          type="date"
          value={editDue}
          onChange={(e) => setEditDue(e.target.value)}
          className="bg-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
        />
        <div className="flex gap-2">
          <button
            className="flex-1 py-2 rounded-lg text-slate-400 text-sm hover:text-white transition-colors"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-3 flex items-center gap-3">
      {/* Complete circle */}
      <button
        className="w-6 h-6 rounded-full border-2 border-slate-500 hover:border-green-400 flex-shrink-0 transition-colors"
        onClick={handleComplete}
        aria-label="Complete task"
      />

      {/* Text + due badge */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => setEditing(true)}
      >
        <p className="text-white truncate">{task.text}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {task.isUrgent && (
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">urgent</span>
          )}
          {dueBadge && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${dueBadge.cls}`}>
              {dueBadge.text}
            </span>
          )}
        </div>
      </div>

      {/* Urgent flag toggle */}
      <button
        className={`flex-shrink-0 transition-colors ${
          task.isUrgent ? 'text-red-400' : 'text-slate-600 hover:text-amber-400'
        }`}
        onClick={handleToggleUrgent}
        aria-label={task.isUrgent ? 'Remove urgent flag' : 'Flag as urgent'}
      >
        <svg viewBox="0 0 24 24" fill={task.isUrgent ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
      </button>

      {/* Delete */}
      <button
        className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
        onClick={handleDelete}
        aria-label="Delete task"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  );
}

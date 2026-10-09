import { useState } from 'react';
import { useTasks } from '../hooks/useTasks.js';
import { deleteTask } from '../utils/storage.js';

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function Archive() {
  const { tasks, loading, refresh } = useTasks('completed');
  const [search, setSearch] = useState('');

  const filtered = search
    ? tasks.filter((t) => t.text.toLowerCase().includes(search.toLowerCase()))
    : tasks;

  async function handleDelete(taskId) {
    await deleteTask(taskId);
    refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-lg font-semibold text-white mb-3">
        Completed <span className="text-slate-500 font-normal">({tasks.length})</span>
      </h2>

      {/* Search */}
      {tasks.length > 0 && (
        <div className="relative mb-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search completed..."
            className="w-full bg-slate-800 text-white rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-500"
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              onClick={() => setSearch('')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {!tasks.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-slate-500">No completed tasks yet</p>
          <p className="text-slate-600 text-sm mt-1">Swipe right to complete a task</p>
        </div>
      ) : !filtered.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-slate-500">No tasks match "{search}"</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((task) => (
            <div key={task.id} className="bg-slate-800 rounded-xl p-3 flex items-center gap-3">
              {/* Check icon */}
              <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-slate-400 line-through truncate">{task.text}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-600">{formatDate(task.completedAt)}</span>
                  {task.isAdHoc && (
                    <span className="text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">ad-hoc</span>
                  )}
                </div>
              </div>

              {/* Delete */}
              <button
                className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
                onClick={() => handleDelete(task.id)}
                aria-label="Delete permanently"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

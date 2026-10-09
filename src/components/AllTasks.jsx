import { useState } from 'react';
import { useTasks } from '../hooks/useTasks.js';
import TaskItem from './TaskItem.jsx';

export default function AllTasks() {
  const { tasks, loading, refresh } = useTasks('active');
  const [sortBy, setSortBy] = useState('created');
  const [search, setSearch] = useState('');

  const filtered = search
    ? tasks.filter((t) => t.text.toLowerCase().includes(search.toLowerCase()))
    : tasks;

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'due') {
      if (a.dueAt && b.dueAt) return a.dueAt - b.dueAt;
      if (a.dueAt) return -1;
      if (b.dueAt) return 1;
      return b.createdAt - a.createdAt;
    }
    return b.createdAt - a.createdAt;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white">
          All Tasks <span className="text-slate-500 font-normal">({tasks.length})</span>
        </h2>
        <button
          className="text-xs text-slate-400 bg-slate-700/50 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
          onClick={() => setSortBy(sortBy === 'created' ? 'due' : 'created')}
        >
          Sort: {sortBy === 'created' ? 'Date added' : 'Due date'}
        </button>
      </div>

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
            placeholder="Search tasks..."
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
          <p className="text-slate-500">No active tasks</p>
          <p className="text-slate-600 text-sm mt-1">Tap + to add one</p>
        </div>
      ) : !sorted.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-slate-500">No tasks match "{search}"</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((task) => (
            <TaskItem key={task.id} task={task} onUpdated={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}

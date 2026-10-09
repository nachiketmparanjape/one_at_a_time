import { useState, useCallback, useRef, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks.js';
import { completeTask, dismissTask, surfaceTask } from '../utils/storage.js';
import { pickRandomTask } from '../utils/taskSelector.js';
import TaskCard from './TaskCard.jsx';

export default function SingleTaskView() {
  const { tasks, loading, refresh } = useTasks('active');
  const [currentTask, setCurrentTask] = useState(null);
  const [cardKey, setCardKey] = useState(0);
  const seenIds = useRef(new Set());
  const hasPickedInitial = useRef(false);

  // Pick initial task after first load via effect with ref guard
  useEffect(() => {
    if (loading || !tasks.length || hasPickedInitial.current) return;
    hasPickedInitial.current = true;

    const unseen = tasks.filter((t) => !seenIds.current.has(t.id));
    const pool = unseen.length ? unseen : tasks;
    if (!unseen.length) seenIds.current.clear();

    const picked = pickRandomTask(pool);
    if (picked) {
      seenIds.current.add(picked.id);
      surfaceTask(picked.id);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- initial pick requires setState in effect
      setCurrentTask(picked);
      setCardKey((k) => k + 1);
    }
  }, [loading, tasks]);

  // Reset flag when tasks become empty so we re-pick on next load
  useEffect(() => {
    if (!loading && !tasks.length) {
      hasPickedInitial.current = false;
    }
  }, [loading, tasks]);

  const advance = useCallback(async () => {
    const refreshed = await refresh();
    const unseen = refreshed.filter((t) => !seenIds.current.has(t.id));
    const pool = unseen.length ? unseen : refreshed;
    if (!unseen.length) seenIds.current.clear();

    const picked = pickRandomTask(pool);
    if (picked) {
      seenIds.current.add(picked.id);
      surfaceTask(picked.id);
      setCurrentTask(picked);
      setCardKey((k) => k + 1);
    } else {
      setCurrentTask(null);
    }
  }, [refresh]);

  const handleComplete = useCallback(async () => {
    if (!currentTask) return;
    await completeTask(currentTask.id);
    advance();
  }, [currentTask, advance]);

  const handleDismiss = useCallback(async () => {
    if (!currentTask) return;
    await dismissTask(currentTask.id, currentTask.dismissCount);
    advance();
  }, [currentTask, advance]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Loading tasks...
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
        <div className="text-5xl mb-2">&#127881;</div>
        <h2 className="text-xl font-semibold text-white">No tasks!</h2>
        <p className="text-slate-400">Tap the + button to add your first task</p>
      </div>
    );
  }

  if (!currentTask) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
        <div className="text-5xl mb-2">&#10024;</div>
        <h2 className="text-xl font-semibold text-white">All caught up!</h2>
        <p className="text-slate-400">You've seen all your tasks. Come back later or add more.</p>
        <button
          className="mt-2 px-5 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          onClick={() => { seenIds.current.clear(); advance(); }}
        >
          Shuffle again
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div className="absolute top-4 left-0 right-0 text-center text-slate-500 text-sm">
        {tasks.length} task{tasks.length !== 1 ? 's' : ''} remaining
      </div>
      <TaskCard
        key={cardKey}
        task={currentTask}
        onComplete={handleComplete}
        onDismiss={handleDismiss}
      />
    </div>
  );
}

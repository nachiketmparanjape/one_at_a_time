import { useState, useEffect, useCallback } from 'react';
import { loadActiveTasks, loadCompletedTasks, loadAllTasks } from '../utils/storage.js';

export function useTasks(filter = 'active') {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loader = filter === 'completed' ? loadCompletedTasks :
    filter === 'all' ? loadAllTasks :
    loadActiveTasks;

  const refresh = useCallback(async () => {
    const data = await loader();
    setTasks(data);
    return data;
  }, [loader]);

  useEffect(() => {
    let cancelled = false;
    loader().then((data) => {
      if (!cancelled) {
        setTasks(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return { tasks, loading, refresh };
}

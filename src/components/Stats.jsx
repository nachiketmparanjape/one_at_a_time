import { useState, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function getStartOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getStartOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.getTime();
}

function calcStreak(completedTasks, now) {
  if (!completedTasks.length) return { current: 0, best: 0 };

  const days = new Set();
  for (const t of completedTasks) {
    if (t.completedAt) {
      days.add(getStartOfDay(t.completedAt));
    }
  }

  const sorted = [...days].sort((a, b) => b - a);
  if (!sorted.length) return { current: 0, best: 0 };

  const todayStart = getStartOfDay(now);

  // Current streak
  let current = 0;
  if (sorted[0] >= todayStart - DAY_MS) {
    current = 1;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i - 1] - sorted[i] <= DAY_MS) {
        current++;
      } else {
        break;
      }
    }
  }

  // Best streak
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1] - sorted[i] <= DAY_MS) {
      run++;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }

  return { current, best: Math.max(best, current) };
}

// Build a map of dayStart -> count for the heatmap
function buildDayMap(completedTasks) {
  const map = new Map();
  for (const t of completedTasks) {
    if (t.completedAt) {
      const day = getStartOfDay(t.completedAt);
      map.set(day, (map.get(day) || 0) + 1);
    }
  }
  return map;
}

// Generate grid data: 15 weeks (105 days), columns = weeks, rows = days (Sun-Sat)
function buildHeatmapGrid(dayMap, now) {
  const todayStart = getStartOfDay(now);
  const today = new Date(todayStart);
  const todayDow = today.getDay(); // 0=Sun

  // End of grid is today; start is 14 full weeks back + remaining days of this week
  const totalDays = 14 * 7 + todayDow + 1;
  const startDay = todayStart - (totalDays - 1) * DAY_MS;

  const weeks = [];
  let week = [];
  for (let i = 0; i < totalDays; i++) {
    const day = startDay + i * DAY_MS;
    const count = dayMap.get(day) || 0;
    week.push({ day, count, isToday: day === todayStart });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push(week);

  return weeks;
}

function heatColor(count) {
  if (count === 0) return 'bg-slate-700/50';
  if (count === 1) return 'bg-green-900';
  if (count === 2) return 'bg-green-700';
  if (count <= 4) return 'bg-green-500';
  return 'bg-green-400';
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function computeStats(allTasks, now) {
  const completed = allTasks.filter((t) => t.status === 'completed');
  const active = allTasks.filter((t) => t.status === 'active');
  const todayStart = getStartOfDay(now);
  const weekStart = getStartOfWeek(now);

  const todayCount = completed.filter((t) => t.completedAt >= todayStart).length;
  const weekCount = completed.filter((t) => t.completedAt >= weekStart).length;
  const { current: streak, best: bestStreak } = calcStreak(completed, now);

  const dayMap = buildDayMap(completed);
  const heatmap = buildHeatmapGrid(dayMap, now);

  return { completed, active, todayCount, weekCount, streak, bestStreak, heatmap };
}

export default function Stats() {
  const { tasks: allTasks, loading } = useTasks('all');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!loading) {
      const result = computeStats(allTasks, Date.now());
      // eslint-disable-next-line react-hooks/set-state-in-effect -- derived state from async load
      setStats(result);
    }
  }, [allTasks, loading]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Loading...
      </div>
    );
  }

  const { todayCount, weekCount, streak, bestStreak, active, completed, heatmap } = stats;

  // Month labels for heatmap
  const monthLabels = [];
  if (heatmap.length) {
    let lastMonth = -1;
    for (let wi = 0; wi < heatmap.length; wi++) {
      const firstDay = heatmap[wi][0];
      const month = new Date(firstDay.day).getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ index: wi, label: MONTH_LABELS[month] });
        lastMonth = month;
      }
    }
  }

  const grid = [
    { label: 'Today', value: todayCount, color: 'text-green-400' },
    { label: 'This Week', value: weekCount, color: 'text-blue-400' },
    { label: 'Streak', value: `${streak}d`, color: 'text-amber-400' },
    { label: 'Best Streak', value: `${bestStreak}d`, color: 'text-orange-400' },
    { label: 'Active', value: active.length, color: 'text-slate-300' },
    { label: 'Total Done', value: completed.length, color: 'text-emerald-400' },
  ];

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-lg font-semibold text-white mb-4">Stats</h2>

      {/* Number grid */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {grid.map((stat) => (
          <div key={stat.label} className="bg-slate-800 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Activity heatmap */}
      <div className="bg-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Activity</h3>

        {/* Month labels */}
        <div className="flex ml-6 mb-1 text-[10px] text-slate-500">
          {monthLabels.map(({ index, label }) => (
            <span
              key={`${label}-${index}`}
              className="absolute"
              style={{ marginLeft: index * 14 }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex gap-0.5 mt-4 overflow-x-auto">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1 text-[10px] text-slate-500 flex-shrink-0">
            <div className="h-[12px]"></div>
            <div className="h-[12px] leading-[12px]">M</div>
            <div className="h-[12px]"></div>
            <div className="h-[12px] leading-[12px]">W</div>
            <div className="h-[12px]"></div>
            <div className="h-[12px] leading-[12px]">F</div>
            <div className="h-[12px]"></div>
          </div>

          {/* Week columns */}
          {heatmap.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((cell) => (
                <div
                  key={cell.day}
                  className={`w-[12px] h-[12px] rounded-sm ${heatColor(cell.count)} ${
                    cell.isToday ? 'ring-1 ring-slate-400' : ''
                  }`}
                  title={`${new Date(cell.day).toLocaleDateString()}: ${cell.count} task${cell.count !== 1 ? 's' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 mt-3 justify-end text-[10px] text-slate-500">
          <span>Less</span>
          <div className="w-[10px] h-[10px] rounded-sm bg-slate-700/50" />
          <div className="w-[10px] h-[10px] rounded-sm bg-green-900" />
          <div className="w-[10px] h-[10px] rounded-sm bg-green-700" />
          <div className="w-[10px] h-[10px] rounded-sm bg-green-500" />
          <div className="w-[10px] h-[10px] rounded-sm bg-green-400" />
          <span>More</span>
        </div>
      </div>

      {/* Motivational message */}
      {todayCount > 0 && (
        <div className="mt-4 bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-slate-300">
            {todayCount === 1 && "You've completed 1 task today. Keep going!"}
            {todayCount >= 2 && todayCount < 5 && `${todayCount} tasks done today. Nice work!`}
            {todayCount >= 5 && todayCount < 10 && `${todayCount} tasks today. You're on fire!`}
            {todayCount >= 10 && `${todayCount} tasks today. Unstoppable!`}
          </p>
        </div>
      )}
    </div>
  );
}

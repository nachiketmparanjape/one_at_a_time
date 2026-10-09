// Common English verbs that signal an actionable task
const ACTION_VERBS = new Set([
  'call', 'email', 'send', 'buy', 'fix', 'clean', 'make', 'write', 'read',
  'pay', 'book', 'schedule', 'cancel', 'return', 'pick', 'drop', 'submit',
  'finish', 'start', 'check', 'update', 'review', 'sign', 'file', 'order',
  'ask', 'tell', 'text', 'reply', 'respond', 'apply', 'install', 'set',
  'move', 'pack', 'ship', 'print', 'scan', 'upload', 'download', 'delete',
  'create', 'add', 'remove', 'organize', 'sort', 'plan', 'prepare', 'cook',
  'wash', 'fold', 'iron', 'mow', 'water', 'feed', 'walk', 'run', 'go',
  'get', 'take', 'put', 'bring', 'fill', 'empty', 'charge', 'renew',
]);

const VAGUE_WORDS = new Set([
  'maybe', 'somehow', 'eventually', 'someday', 'consider', 'possibly',
  'might', 'could', 'should', 'think about', 'figure out', 'look into',
  'explore', 'research', 'investigate', 'brainstorm',
]);

function scoreTask(task, now) {
  let score = 50; // baseline

  // --- Urgent flag: always on top ---
  if (task.isUrgent) return 10000;

  // --- Due date urgency ---
  if (task.dueAt) {
    const daysUntil = (task.dueAt - now) / (1000 * 60 * 60 * 24);
    if (daysUntil < 0) score += 100;         // overdue
    else if (daysUntil < 1) score += 80;     // due today
    else if (daysUntil < 2) score += 50;     // due tomorrow
    else if (daysUntil < 4) score += 30;     // due within 3 days
    else if (daysUntil < 8) score += 10;     // due this week
  }

  // --- Actionability (text analysis) ---
  const words = task.text.trim().toLowerCase().split(/\s+/);
  const wordCount = words.length;

  // Starts with a verb
  if (ACTION_VERBS.has(words[0])) score += 15;

  // Short tasks are easier to act on
  if (wordCount <= 4) score += 10;
  else if (wordCount <= 8) score += 5;
  // Long/vague tasks get penalized
  if (wordCount > 15) score -= 10;

  // Vague language penalty
  const textLower = task.text.toLowerCase();
  for (const vague of VAGUE_WORDS) {
    if (textLower.includes(vague)) {
      score -= 10;
      break;
    }
  }

  // --- Dismiss penalty (you keep skipping it) ---
  const dismissPenalty = Math.min((task.dismissCount || 0) * 5, 30);
  score -= dismissPenalty;

  // --- Staleness boost (haven't seen it in a while) ---
  if (task.lastSurfacedAt) {
    const daysSinceSeen = (now - task.lastSurfacedAt) / (1000 * 60 * 60 * 24);
    score += Math.min(Math.floor(daysSinceSeen * 3), 20);
  } else {
    // Never surfaced — give it a boost
    score += 15;
  }

  return Math.max(score, 1);
}

// Weighted random pick: higher-scored tasks are more likely, but not guaranteed
function weightedRandomPick(scored) {
  const totalWeight = scored.reduce((sum, s) => sum + s.score, 0);
  let r = Math.random() * totalWeight;
  for (const s of scored) {
    r -= s.score;
    if (r <= 0) return s.task;
  }
  return scored[scored.length - 1].task;
}

export function pickTask(tasks) {
  if (!tasks.length) return null;

  const now = Date.now();

  // Score all tasks
  const scored = tasks.map((task) => ({ task, score: scoreTask(task, now) }));

  // Urgent tasks always come first (deterministic)
  const urgent = scored.filter((s) => s.task.isUrgent);
  if (urgent.length) {
    // If multiple urgent tasks, pick randomly among them
    return urgent[Math.floor(Math.random() * urgent.length)].task;
  }

  // Weighted random from the rest
  return weightedRandomPick(scored);
}

// Legacy export for compatibility
export function pickRandomTask(tasks) {
  return pickTask(tasks);
}

import { useRef, useState, useCallback } from 'react';
import { vibrateSuccess, vibrateDismiss } from '../utils/haptics.js';

const THRESHOLD = 100;
const MAX_ROTATION = 15;

function formatDue(dueAt) {
  if (!dueAt) return null;
  const due = new Date(dueAt);
  const diffMs = dueAt - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: `${-diffDays}d overdue`, urgent: true };
  if (diffDays === 0) return { text: 'Due today', urgent: true };
  if (diffDays === 1) return { text: 'Due tomorrow', urgent: false };
  if (diffDays <= 3) return { text: `Due in ${diffDays}d`, urgent: false };

  return { text: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), urgent: false };
}

export default function TaskCard({ task, onComplete, onDismiss }) {
  const cardRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [exiting, setExiting] = useState(null); // 'right' | 'left' | null
  const dragging = useRef(false);
  const startX = useRef(0);
  const directionLocked = useRef(null); // 'horizontal' | 'vertical' | null

  const handlePointerDown = useCallback((e) => {
    if (exiting) return;
    if (e.target.closest('button')) return;
    dragging.current = true;
    directionLocked.current = null;
    startX.current = e.clientX;
    cardRef.current?.setPointerCapture(e.pointerId);
    // Remove spring-back class during drag
    cardRef.current?.classList.remove('card-spring-back');
  }, [exiting]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging.current) return;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - (e._startY ?? e.clientY);

    // Lock direction after 10px
    if (!directionLocked.current && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      directionLocked.current = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
    }

    if (directionLocked.current === 'vertical') return;
    if (directionLocked.current === 'horizontal') {
      e.preventDefault();
      setOffset(dx);
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    directionLocked.current = null;

    if (offset > THRESHOLD) {
      // Swipe right — complete
      vibrateSuccess();
      setExiting('right');
      setTimeout(() => onComplete(), 300);
    } else if (offset < -THRESHOLD) {
      // Swipe left — dismiss
      vibrateDismiss();
      setExiting('left');
      setTimeout(() => onDismiss(), 300);
    } else {
      // Spring back
      cardRef.current?.classList.add('card-spring-back');
      setOffset(0);
    }
  }, [offset, onComplete, onDismiss]);

  const progress = Math.min(Math.abs(offset) / THRESHOLD, 1);
  const rotation = (offset / THRESHOLD) * MAX_ROTATION;
  const dueInfo = formatDue(task.dueAt);

  const exitClass = exiting === 'right' ? 'swipe-right-exit' : exiting === 'left' ? 'swipe-left-exit' : '';

  return (
    <div
      ref={cardRef}
      className={`absolute inset-x-4 top-1/2 -translate-y-1/2 touch-pan-y ${exitClass}`}
      style={!exiting ? {
        transform: `translateX(${offset}px) rotate(${rotation}deg)`,
        willChange: 'transform',
      } : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Card body */}
      <div className="relative bg-slate-800 rounded-2xl shadow-xl p-8 min-h-[200px] flex flex-col items-center justify-center overflow-hidden select-none">
        {/* Color overlay */}
        <div
          className="absolute inset-0 rounded-2xl transition-opacity pointer-events-none"
          style={{
            background: offset > 0
              ? `rgba(34, 197, 94, ${progress * 0.15})`
              : `rgba(148, 163, 184, ${progress * 0.15})`,
            opacity: progress,
          }}
        />

        {/* DONE label */}
        <div
          className="absolute top-6 left-6 text-green-400 text-2xl font-bold border-3 border-green-400 rounded-lg px-3 py-1 -rotate-12 pointer-events-none"
          style={{ opacity: offset > 0 ? progress : 0 }}
        >
          DONE
        </div>

        {/* SKIP label */}
        <div
          className="absolute top-6 right-6 text-slate-400 text-2xl font-bold border-3 border-slate-400 rounded-lg px-3 py-1 rotate-12 pointer-events-none"
          style={{ opacity: offset < 0 ? progress : 0 }}
        >
          SKIP
        </div>

        {/* Task text */}
        <p className="text-xl text-white text-center font-medium z-10 leading-relaxed">
          {task.text}
        </p>

        {/* Urgent badge */}
        {task.isUrgent && (
          <span className="mt-3 text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full z-10 flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
            </svg>
            Urgent
          </span>
        )}

        {/* Due date badge */}
        {dueInfo && (
          <span className={`mt-4 text-sm px-3 py-1 rounded-full z-10 ${
            dueInfo.urgent
              ? 'bg-red-500/20 text-red-400'
              : 'bg-slate-700 text-slate-300'
          }`}>
            {dueInfo.text}
          </span>
        )}

        {/* Dismiss count */}
        {task.dismissCount > 0 && (
          <span className="mt-2 text-xs text-slate-500 z-10">
            Skipped {task.dismissCount} {task.dismissCount === 1 ? 'time' : 'times'}
          </span>
        )}
      </div>

      {/* Button fallbacks for desktop / accessibility */}
      <div className="flex gap-3 mt-4 justify-center">
        <button
          className="px-6 py-2 rounded-xl bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors"
          onClick={(e) => { e.stopPropagation(); vibrateDismiss(); setExiting('left'); setTimeout(() => onDismiss(), 300); }}
        >
          Skip
        </button>
        <button
          className="px-6 py-2 rounded-xl bg-green-600 text-white text-sm hover:bg-green-500 transition-colors"
          onClick={(e) => { e.stopPropagation(); vibrateSuccess(); setExiting('right'); setTimeout(() => onComplete(), 300); }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

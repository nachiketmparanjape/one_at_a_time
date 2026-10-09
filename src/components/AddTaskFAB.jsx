export default function AddTaskFAB({ onClick }) {
  return (
    <button
      className="fixed bottom-20 right-5 w-14 h-14 bg-blue-500 hover:bg-blue-400 text-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-3xl font-light transition-colors z-40 active:scale-95"
      onClick={onClick}
      aria-label="Add task"
    >
      +
    </button>
  );
}

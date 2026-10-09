import { useState, useEffect } from 'react';
import { onAuth, signInWithGoogle, signInAnonymously, signOut, switchAccount, linkAnonymousToGoogle } from './utils/firebase.js';
import NavBar from './components/NavBar.jsx';
import AddTaskFAB from './components/AddTaskFAB.jsx';
import AddTask from './components/AddTask.jsx';
import SingleTaskView from './components/SingleTaskView.jsx';
import AllTasks from './components/AllTasks.jsx';
import Archive from './components/Archive.jsx';
import Stats from './components/Stats.jsx';

export default function App() {
  const [user, setUser] = useState(undefined);
  const [screen, setScreen] = useState('focus');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    return onAuth((u) => setUser(u));
  }, []);

  function handleTaskAdded() {
    setRefreshKey((k) => k + 1);
  }

  // Auth loading
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400 text-lg">Loading...</div>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">One at a Time</h1>
          <p className="text-slate-400">Swipe through your tasks, one by one</p>
        </div>
        <button
          className="flex items-center gap-3 bg-white text-gray-700 font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => signInWithGoogle()}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
        <button
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2"
          onClick={() => signInAnonymously()}
        >
          Continue without signing in
        </button>
      </div>
    );
  }

  // Screen content
  const content = (() => {
    switch (screen) {
      case 'focus':
        return <SingleTaskView key={refreshKey} />;
      case 'tasks':
        return <AllTasks key={refreshKey} />;
      case 'done':
        return <Archive key={refreshKey} />;
      case 'stats':
        return <Stats key={refreshKey} />;
      default:
        return <SingleTaskView key={refreshKey} />;
    }
  })();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 relative">
        <button
          className="flex items-center gap-2 text-sm text-slate-400 truncate"
          onClick={() => setShowAccountMenu(!showAccountMenu)}
        >
          {user.isAnonymous ? (
            <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-slate-300">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          ) : user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
          ) : null}
          <span className="truncate">{user.isAnonymous ? 'Anonymous' : (user.displayName || user.email)}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 flex-shrink-0">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {/* Account dropdown */}
        {showAccountMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowAccountMenu(false)} />
            <div className="absolute top-full left-2 right-2 mt-1 bg-slate-800 rounded-xl shadow-xl border border-slate-700 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700/50">
                <p className="text-sm text-white font-medium truncate">{user.isAnonymous ? 'Anonymous User' : user.displayName}</p>
                <p className="text-xs text-slate-500 truncate">{user.isAnonymous ? 'Not signed in' : user.email}</p>
              </div>
              {user.isAnonymous ? (
                <button
                  className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                  onClick={() => {
                    setShowAccountMenu(false);
                    linkAnonymousToGoogle()
                      .then(() => setRefreshKey((k) => k + 1))
                      .catch((err) => {
                        if (err.code === 'auth/credential-already-in-use') {
                          alert('That Google account is already linked to another profile. Sign out and sign in with Google directly instead.');
                        }
                      });
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" className="flex-shrink-0">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Link Google account
                </button>
              ) : (
                <button
                  className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                  onClick={() => { setShowAccountMenu(false); switchAccount().then(() => setRefreshKey((k) => k + 1)); }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>
                  </svg>
                  Switch account
                </button>
              )}
              <button
                className="w-full text-left px-4 py-3 text-sm text-slate-500 hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                onClick={() => { setShowAccountMenu(false); signOut(); }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign out
              </button>
            </div>
          </>
        )}
      </div>

      {/* Screen content */}
      <div className="flex-1 overflow-hidden relative">
        {content}
      </div>

      {/* FAB */}
      <AddTaskFAB onClick={() => setShowAddTask(true)} />

      {/* Add task modal */}
      {showAddTask && (
        <AddTask
          onClose={() => setShowAddTask(false)}
          onTaskAdded={handleTaskAdded}
        />
      )}

      {/* Bottom nav */}
      <NavBar screen={screen} onNavigate={setScreen} />
    </div>
  );
}

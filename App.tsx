import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Task, DailyStats, TimerMode } from './types';
import { getTodayString, getTimerDurations, playAlarmSound, playTickSound, stopTickSound } from './utils';
import Home from './pages/Home';
import TodoList from './pages/TodoList';
import RestEndPrompt from './components/RestEndPrompt';

function App() {
  // --- State ---
  // Initialize state from localStorage immediately to avoid flash of empty state
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem('pomodoro_tasks');
      if (savedTasks) {
        return JSON.parse(savedTasks);
      }
    } catch (e) {
      console.error('Failed to load tasks from localStorage:', e);
    }
    return [];
  });

  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    try {
      const savedActiveTaskId = localStorage.getItem('pomodoro_activeTaskId');
      if (savedActiveTaskId && savedActiveTaskId !== '') {
        return savedActiveTaskId;
      }
    } catch (e) {
      console.error('Failed to load activeTaskId from localStorage:', e);
    }
    return null;
  });

  const [dailyStats, setDailyStats] = useState<DailyStats>(() => {
    try {
      const savedStats = localStorage.getItem('pomodoro_stats');
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        // Check if stats are for today
        if (parsedStats.date === getTodayString()) {
          return parsedStats;
        }
      }
    } catch (e) {
      console.error('Failed to load stats from localStorage:', e);
    }
    return {
      date: getTodayString(),
      totalPomodoros: 0,
      completedTasks: 0,
      totalFocusMinutes: 0
    };
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // --- Persistence ---
  
  // Mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Save on change (only after initialization to avoid overwriting loaded data)
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      localStorage.setItem('pomodoro_tasks', JSON.stringify(tasks));
      console.log('Saved tasks to localStorage:', tasks.length, 'tasks');
    } catch (e) {
      console.error('Failed to save tasks to localStorage:', e);
    }
  }, [tasks, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      if (activeTaskId) {
        localStorage.setItem('pomodoro_activeTaskId', activeTaskId);
      } else {
        localStorage.removeItem('pomodoro_activeTaskId');
      }
    } catch (e) {
      console.error('Failed to save activeTaskId to localStorage:', e);
    }
  }, [activeTaskId, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      localStorage.setItem('pomodoro_stats', JSON.stringify(dailyStats));
    } catch (e) {
      console.error('Failed to save stats to localStorage:', e);
    }
  }, [dailyStats, isInitialized]);

  // Recalculate completed tasks count based on current tasks list status (exclude deleted tasks)
  useEffect(() => {
    const activeTasks = tasks.filter(t => t.deletedAt === undefined);
    const doneCount = activeTasks.filter(t => t.status === 'done').length;
    setDailyStats(prev => ({...prev, completedTasks: doneCount}));
  }, [tasks]);

  return (
    <HashRouter>
      <AppContent
        tasks={tasks}
        activeTaskId={activeTaskId}
        dailyStats={dailyStats}
        onUpdateTasks={setTasks}
        onSetActiveTaskId={setActiveTaskId}
        onUpdateStats={setDailyStats}
      />
    </HashRouter>
  );
}

interface AppContentProps {
  tasks: Task[];
  activeTaskId: string | null;
  dailyStats: DailyStats;
  onUpdateTasks: (tasks: Task[]) => void;
  onSetActiveTaskId: (id: string | null) => void;
  onUpdateStats: (stats: DailyStats) => void;
}

function AppContent({
  tasks,
  activeTaskId,
  dailyStats,
  onUpdateTasks,
  onSetActiveTaskId,
  onUpdateStats,
}: AppContentProps) {
  const location = useLocation();
  const timerDurations = getTimerDurations();
  const [timerMode, setTimerMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(timerDurations.focus);
  const [isActive, setIsActive] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showRestEndPrompt, setShowRestEndPrompt] = useState(false);

  const handleModeSwitch = (newMode: TimerMode, autoStart: boolean = false) => {
    setTimerMode(newMode);
    setTimeLeft(timerDurations[newMode]);
    setIsActive(autoStart);
    setHasCompleted(false);
  };

  const handleToggleTimer = () => {
    setIsActive(prev => {
      if (prev) {
        stopTickSound();
      }
      return !prev;
    });
  };

  const handleResetTimer = () => {
    setIsActive(false);
    stopTickSound();
    setTimeLeft(timerDurations[timerMode]);
    setHasCompleted(false);
  };

  const handleTimerComplete = useCallback((mode: TimerMode) => {
    if (mode === 'focus') {
      if (activeTaskId) {
        const updatedTasks = tasks.map(t => {
          if (t.id === activeTaskId) {
            return { ...t, actPomodoros: t.actPomodoros + 1 };
          }
          return t;
        });
        onUpdateTasks(updatedTasks);
      }

      onUpdateStats({
        ...dailyStats,
        totalPomodoros: dailyStats.totalPomodoros + 1,
        totalFocusMinutes: dailyStats.totalFocusMinutes + 25
      });
    } else {
      setShowRestEndPrompt(true);
    }
  }, [activeTaskId, dailyStats, onUpdateStats, onUpdateTasks, tasks]);

  const handleStartBreak = () => {
    setShowRestEndPrompt(false);
    handleModeSwitch('shortBreak', true);
  };

  const handleStartFocus = () => {
    setShowRestEndPrompt(false);
    handleModeSwitch('focus', true);
  };

  const handleDismissRestEndPrompt = () => {
    setShowRestEndPrompt(false);
  };

  const handleSkipTimer = () => {
    setTimeLeft(0);
    setIsActive(true);
    setHasCompleted(false);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (timerMode === 'focus' && newTime > 0) {
            playTickSound();
          } else if (timerMode !== 'focus' && newTime === 0) {
            stopTickSound();
          }
          return newTime;
        });
      }, 1000);

      if (timerMode === 'focus') {
        playTickSound();
      }
    } else if (timeLeft === 0 && isActive && !hasCompleted) {
      stopTickSound();
      setHasCompleted(true);
      setIsActive(false);
      playAlarmSound();
      handleTimerComplete(timerMode);
    } else if (!isActive) {
      stopTickSound();
    }

    return () => {
      if (interval) clearInterval(interval);
      stopTickSound();
    };
  }, [handleTimerComplete, hasCompleted, isActive, timeLeft, timerMode]);

  return (
    <div className="min-h-screen">
      {showRestEndPrompt && (
        <RestEndPrompt
          onStartFocus={handleStartFocus}
          onDismiss={handleDismissRestEndPrompt}
        />
      )}
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/70 border-b border-slate-200/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 text-xl font-semibold text-slate-800 hover:text-pomo-red transition-colors">
              <span className="text-pomo-red text-2xl">🍅</span>
              Pomodoro Desk
            </Link>
            <div className="flex gap-3">
              <Link
                to="/"
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'bg-pomo-red text-white shadow-soft'
                    : 'text-slate-600 hover:text-pomo-red hover:bg-kiwi-pink/10'
                }`}
              >
                Timer
              </Link>
              <Link
                to="/todos"
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  location.pathname === '/todos'
                    ? 'bg-pomo-red text-white shadow-soft'
                    : 'text-slate-600 hover:text-pomo-red hover:bg-kiwi-pink/10'
                }`}
              >
                Todo List
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <Home
              tasks={tasks}
              activeTaskId={activeTaskId}
              dailyStats={dailyStats}
              onUpdateTasks={onUpdateTasks}
              onSetActiveTaskId={onSetActiveTaskId}
              timerMode={timerMode}
              timeLeft={timeLeft}
              isActive={isActive}
              hasCompleted={hasCompleted}
              timerDurations={timerDurations}
              onModeSwitch={handleModeSwitch}
              onToggleTimer={handleToggleTimer}
              onResetTimer={handleResetTimer}
              onSkipTimer={handleSkipTimer}
              onStartBreak={handleStartBreak}
            />
          }
        />
        <Route
          path="/todos"
          element={
            <TodoList
              tasks={tasks}
              onUpdateTasks={onUpdateTasks}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;

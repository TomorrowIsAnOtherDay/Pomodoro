import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Task, DailyStats } from './types';
import { getTodayString } from './utils';
import Home from './pages/Home';
import TodoList from './pages/TodoList';

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
    <BrowserRouter>
      <AppContent
        tasks={tasks}
        activeTaskId={activeTaskId}
        dailyStats={dailyStats}
        onUpdateTasks={setTasks}
        onSetActiveTaskId={setActiveTaskId}
        onUpdateStats={setDailyStats}
      />
    </BrowserRouter>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-pomo-red transition-colors">
              <span className="text-pomo-red text-2xl">🍅</span>
              Pomodoro Todo
            </Link>
            <div className="flex gap-4">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'bg-pomo-red text-white'
                    : 'text-gray-600 hover:text-pomo-red hover:bg-red-50'
                }`}
              >
                Timer
              </Link>
              <Link
                to="/todos"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === '/todos'
                    ? 'bg-pomo-red text-white'
                    : 'text-gray-600 hover:text-pomo-red hover:bg-red-50'
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
              onUpdateStats={onUpdateStats}
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

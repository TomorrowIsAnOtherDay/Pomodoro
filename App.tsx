import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Task, DailyStats } from './types';
import { getTodayString } from './utils';
import Home from './pages/Home';
import TodoList from './pages/TodoList';

function App() {
  // --- State ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    date: getTodayString(),
    totalPomodoros: 0,
    completedTasks: 0,
    totalFocusMinutes: 0
  });

  // --- Persistence ---
  
  // Load initial data
  useEffect(() => {
    const savedTasks = localStorage.getItem('pomodoro_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    const savedStats = localStorage.getItem('pomodoro_stats');
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      // Check if stats are for today
      if (parsedStats.date === getTodayString()) {
        setDailyStats(parsedStats);
      } else {
        // Reset stats for new day but keep history (todo: implement full history)
        setDailyStats({
          date: getTodayString(),
          totalPomodoros: 0,
          completedTasks: 0,
          totalFocusMinutes: 0
        });
      }
    }
  }, []);

  // Save on change
  useEffect(() => {
    localStorage.setItem('pomodoro_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('pomodoro_stats', JSON.stringify(dailyStats));
  }, [dailyStats]);

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

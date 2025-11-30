import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TimerDisplay from './components/TimerDisplay';
import TaskSection from './components/TaskSection';
import StatsSection from './components/StatsSection';
import { Task, DailyStats, TimerMode } from './types';
import { getTodayString } from './utils';

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
  
  // Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Recalculate completed tasks count based on current tasks list status
  useEffect(() => {
    const doneCount = tasks.filter(t => t.status === 'done').length;
    setDailyStats(prev => ({...prev, completedTasks: doneCount}));
  }, [tasks]);


  // --- Handlers ---

  const handleAddTask = (task: Task) => {
    setTasks(prev => [task, ...prev]);
    // If it's the first active task, select it automatically
    if (!activeTaskId) {
      setActiveTaskId(task.id);
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
      if (activeTaskId === id) setActiveTaskId(null);
    }
  };

  const handleTimerComplete = (mode: TimerMode) => {
    if (mode === 'focus') {
      // 1. Update active task
      if (activeTaskId) {
        setTasks(prev => prev.map(t => {
          if (t.id === activeTaskId) {
            return { ...t, actPomodoros: t.actPomodoros + 1 };
          }
          return t;
        }));
      }

      // 2. Update Stats
      setDailyStats(prev => ({
        ...prev,
        totalPomodoros: prev.totalPomodoros + 1,
        totalFocusMinutes: prev.totalFocusMinutes + 25
      }));

      // 3. Prompt
      setToastMessage("Focus session complete! Time for a break?");
    } else {
      setToastMessage("Break over! Ready to focus again?");
    }
  };

  // Close toast automatically
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);


  const activeTask = tasks.find(t => t.id === activeTaskId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Header />
      
      <StatsSection stats={dailyStats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Timer */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <TimerDisplay 
            activeTask={activeTask}
            onTimerComplete={handleTimerComplete}
            onModeChange={() => {}} // Could be used to log interruptions
          />
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            <h4 className="font-bold mb-1">💡 Pro Tip</h4>
            <p>Select a task from the list on the right before starting your timer to track your actual effort versus estimated effort.</p>
          </div>
        </div>

        {/* Right Column: Tasks */}
        <div className="lg:col-span-7 h-[600px]">
          <TaskSection 
            tasks={tasks}
            activeTaskId={activeTaskId}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onSelectActive={setActiveTaskId}
          />
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce-in z-50">
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

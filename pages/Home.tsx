import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TimerDisplay from '../components/TimerDisplay';
import TaskSection from '../components/TaskSection';
import StatsSection from '../components/StatsSection';
import BreakPrompt from '../components/BreakPrompt';
import RestEndPrompt from '../components/RestEndPrompt';
import { Task, DailyStats, TimerMode } from '../types';
import { getTodayString } from '../utils';

interface HomeProps {
  tasks: Task[];
  activeTaskId: string | null;
  dailyStats: DailyStats;
  onUpdateTasks: (tasks: Task[]) => void;
  onSetActiveTaskId: (id: string | null) => void;
  onUpdateStats: (stats: DailyStats) => void;
}

const Home: React.FC<HomeProps> = ({
  tasks,
  activeTaskId,
  dailyStats,
  onUpdateTasks,
  onSetActiveTaskId,
  onUpdateStats,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBreakPrompt, setShowBreakPrompt] = useState(false);
  const [showRestEndPrompt, setShowRestEndPrompt] = useState(false);
  const [startBreakTrigger, setStartBreakTrigger] = useState(0);
  const [startFocusTrigger, setStartFocusTrigger] = useState(0);

  const handleAddTask = (task: Task) => {
    onUpdateTasks([task, ...tasks]);
    // If it's the first active task, select it automatically
    if (!activeTaskId) {
      onSetActiveTaskId(task.id);
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    onUpdateTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const updatedTasks = tasks.map(t => 
        t.id === id ? { ...t, deletedAt: Date.now() } : t
      );
      onUpdateTasks(updatedTasks);
      if (activeTaskId === id) onSetActiveTaskId(null);
    }
  };

  const handleTimerComplete = (mode: TimerMode) => {
    if (mode === 'focus') {
      // 1. Update active task
      if (activeTaskId) {
        const updatedTasks = tasks.map(t => {
          if (t.id === activeTaskId) {
            return { ...t, actPomodoros: t.actPomodoros + 1 };
          }
          return t;
        });
        onUpdateTasks(updatedTasks);
      }

      // 2. Update Stats
      onUpdateStats({
        ...dailyStats,
        totalPomodoros: dailyStats.totalPomodoros + 1,
        totalFocusMinutes: dailyStats.totalFocusMinutes + 25
      });

      // 3. Break prompt is now handled directly in TimerDisplay component
      setShowBreakPrompt(false);
      setShowRestEndPrompt(false);
    } else {
      // Rest ended - show rest end prompt
      setShowRestEndPrompt(true);
      setShowBreakPrompt(false);
    }
  };

  const handleStartBreak = () => {
    setShowBreakPrompt(false);
    // Trigger break mode start by updating the trigger value
    setStartBreakTrigger(prev => prev + 1);
  };

  const handleDismissBreakPrompt = () => {
    setShowBreakPrompt(false);
  };

  const handleStartFocus = () => {
    setShowRestEndPrompt(false);
    // Trigger focus mode start by updating the trigger value
    setStartFocusTrigger(prev => prev + 1);
  };

  const handleDismissRestEndPrompt = () => {
    setShowRestEndPrompt(false);
  };

  // Close toast automatically
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const activeTask = tasks.find(t => t.id === activeTaskId && t.deletedAt === undefined);

  return (
    <>
      {/* Break Prompt */}
      {showBreakPrompt && (
        <BreakPrompt
          onStartBreak={handleStartBreak}
          onDismiss={handleDismissBreakPrompt}
        />
      )}

      {/* Rest End Prompt */}
      {showRestEndPrompt && (
        <RestEndPrompt
          onStartFocus={handleStartFocus}
          onDismiss={handleDismissRestEndPrompt}
        />
      )}

      <div className={`max-w-6xl mx-auto px-4 py-8 ${(showBreakPrompt || showRestEndPrompt) ? 'pt-24' : ''}`}>
        <Header />
        
        <StatsSection stats={dailyStats} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Timer */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <TimerDisplay 
              activeTask={activeTask}
              onTimerComplete={handleTimerComplete}
              onModeChange={() => {}} // Could be used to log interruptions
              startBreakTrigger={startBreakTrigger}
              startFocusTrigger={startFocusTrigger}
              onStartBreak={handleStartBreak}
            />
            
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
              <h4 className="font-bold mb-1">💡 Pro Tip</h4>
              <p>Select a task from the list on the right before starting your timer to track your actual effort versus estimated effort.</p>
            </div>
          </div>

          {/* Right Column: Tasks */}
          <div className="lg:col-span-7 h-[600px]">
            <TaskSection 
              tasks={tasks.filter(t => t.deletedAt === undefined)}
              activeTaskId={activeTaskId}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onSelectActive={onSetActiveTaskId}
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
    </>
  );
};

export default Home;


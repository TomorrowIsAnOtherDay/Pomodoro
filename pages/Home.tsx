import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TimerDisplay from '../components/TimerDisplay';
import TaskSection from '../components/TaskSection';
import StatsSection from '../components/StatsSection';
import ModeSwitchPrompt from '../components/ModeSwitchPrompt';
import { Task, DailyStats, TimerMode } from '../types';

interface HomeProps {
  tasks: Task[];
  activeTaskId: string | null;
  dailyStats: DailyStats;
  onUpdateTasks: (tasks: Task[]) => void;
  onSetActiveTaskId: (id: string | null) => void;
  timerMode: TimerMode;
  timeLeft: number;
  isActive: boolean;
  hasCompleted: boolean;
  timerDurations: Record<TimerMode, number>;
  onModeSwitch: (mode: TimerMode, autoStart?: boolean) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSkipTimer: () => void;
  onStartBreak: () => void;
}

const Home: React.FC<HomeProps> = ({
  tasks,
  activeTaskId,
  dailyStats,
  onUpdateTasks,
  onSetActiveTaskId,
  timerMode,
  timeLeft,
  isActive,
  hasCompleted,
  timerDurations,
  onModeSwitch,
  onToggleTimer,
  onResetTimer,
  onSkipTimer,
  onStartBreak
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pendingDeleteTask, setPendingDeleteTask] = useState<Task | null>(null);

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

  const handleDeleteTask = (task: Task) => {
    setPendingDeleteTask(task);
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
      {pendingDeleteTask && (
        <ModeSwitchPrompt
          title="删除任务"
          message={`确定删除 "${pendingDeleteTask.title}" 吗？任务会被移动到回收站。`}
          confirmLabel="删除"
          cancelLabel="取消"
          confirmClassName="bg-kiwi-pink"
          onCancel={() => setPendingDeleteTask(null)}
          onConfirm={() => {
            const updatedTasks = tasks.map(t =>
              t.id === pendingDeleteTask.id ? { ...t, deletedAt: Date.now() } : t
            );
            onUpdateTasks(updatedTasks);
            if (activeTaskId === pendingDeleteTask.id) onSetActiveTaskId(null);
            setPendingDeleteTask(null);
          }}
        />
      )}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Header />
        
        <StatsSection stats={dailyStats} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Timer */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <TimerDisplay 
              activeTask={activeTask}
              mode={timerMode}
              timeLeft={timeLeft}
              isActive={isActive}
              hasCompleted={hasCompleted}
              timerDurations={timerDurations}
              onModeSwitch={onModeSwitch}
              onToggleTimer={onToggleTimer}
              onResetTimer={onResetTimer}
              onSkipTimer={onSkipTimer}
              onStartBreak={onStartBreak}
              className="h-[600px]"
            />
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

        <div className="card-muted p-4 text-sm text-slate-700 mt-6 text-center">
          <h4 className="font-semibold mb-1">💡 Workflow tip</h4>
          <p>Select a task before you start. This keeps your estimate and actual focus aligned.</p>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce-in z-50">
            <span>{toastMessage}</span>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white"
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

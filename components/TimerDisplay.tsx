import React, { useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Coffee, Brain, Armchair } from 'lucide-react';
import { TimerMode, Task } from '../types';
import { cn, formatTime, playNotificationSound } from '../utils';

interface TimerDisplayProps {
  activeTask: Task | undefined;
  onTimerComplete: (mode: TimerMode) => void;
  onModeChange: (mode: TimerMode) => void;
}

const MODES: Record<TimerMode, { label: string; time: number; color: string; icon: React.ElementType }> = {
  focus: { label: 'Focus', time: 25 * 60, color: 'text-pomo-red', icon: Brain },
  shortBreak: { label: 'Short Break', time: 5 * 60, color: 'text-pomo-green', icon: Coffee },
  longBreak: { label: 'Long Break', time: 15 * 60, color: 'text-pomo-blue', icon: Armchair },
};

const TimerDisplay: React.FC<TimerDisplayProps> = ({ activeTask, onTimerComplete, onModeChange }) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.time);
  const [isActive, setIsActive] = useState(false);
  
  // Progress calculation for the circle
  const totalTime = MODES[mode].time;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleModeSwitch = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(MODES[newMode].time);
    setIsActive(false);
    onModeChange(newMode);
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].time);
  };

  const handleComplete = useCallback(() => {
    setIsActive(false);
    playNotificationSound();
    onTimerComplete(mode);
    // Auto reset for next round, but don't start
    setTimeLeft(0); 
  }, [mode, onTimerComplete]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, handleComplete]);

  // Dynamic theme color based on mode
  const themeColor = mode === 'focus' ? 'bg-pomo-red' : mode === 'shortBreak' ? 'bg-pomo-green' : 'bg-pomo-blue';
  const themeTextColor = MODES[mode].color;
  const themeBorderColor = mode === 'focus' ? 'border-pomo-red' : mode === 'shortBreak' ? 'border-pomo-green' : 'border-pomo-blue';

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500">
      {/* Mode Tabs */}
      <div className="flex space-x-2 mb-8 z-10 bg-gray-100 p-1 rounded-full">
        {(Object.keys(MODES) as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeSwitch(m)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
              mode === m 
                ? `${themeColor} text-white shadow-md` 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
            )}
          >
            {React.createElement(MODES[m].icon, { size: 16 })}
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative mb-8">
        <svg className="transform -rotate-90 w-72 h-72">
          <circle
            cx="144"
            cy="144"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-gray-100"
          />
          <circle
            cx="144"
            cy="144"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn("transition-all duration-1000 ease-linear", themeTextColor)}
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className={cn("text-6xl font-bold tabular-nums tracking-tighter", themeTextColor)}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-gray-400 font-medium mt-2 uppercase tracking-widest text-xs">
            {isActive ? 'Running' : 'Paused'}
          </div>
        </div>
      </div>

      {/* Active Task Display */}
      <div className="mb-8 w-full max-w-md text-center h-12">
        {mode === 'focus' ? (
           activeTask ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 flex items-center justify-center gap-2 animate-fadeIn">
              <span className="text-xs font-bold uppercase text-gray-400">Working on:</span>
              <span className="font-medium text-gray-800 truncate max-w-[200px]">{activeTask.title}</span>
            </div>
          ) : (
            <div className="text-gray-400 text-sm italic py-2">Select a task below to track progress</div>
          )
        ) : (
          <div className="text-gray-500 font-medium py-2">Take a breath, relax.</div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 z-10">
        <button
          onClick={toggleTimer}
          className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg transform transition-all hover:scale-105 active:scale-95",
            themeColor
          )}
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>
        
        <button
          onClick={resetTimer}
          className="w-14 h-14 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
          title="Reset Timer"
        >
          <RotateCcw size={24} />
        </button>

        {isActive && (
           <button
           onClick={handleComplete}
           className="w-14 h-14 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
           title="Skip / Finish"
         >
           <SkipForward size={24} />
         </button>
        )}
      </div>
    </div>
  );
};

export default TimerDisplay;

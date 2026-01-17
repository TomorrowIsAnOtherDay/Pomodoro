import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Coffee, Brain, Armchair, Volume2, VolumeX } from 'lucide-react';
import { TimerMode, Task } from '../types';
import { cn, formatTime, getAudioSettings, updateAudioSetting, AudioSettings } from '../utils';
import ModeSwitchPrompt from './ModeSwitchPrompt';

interface TimerDisplayProps {
  activeTask: Task | undefined;
  mode: TimerMode;
  timeLeft: number;
  isActive: boolean;
  hasCompleted: boolean;
  timerDurations: Record<TimerMode, number>;
  onModeSwitch: (mode: TimerMode, autoStart?: boolean) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSkipTimer: () => void;
  onStartBreak?: () => void;
  className?: string;
}

const MODES: Record<TimerMode, { label: string; color: string; icon: React.ElementType }> = {
  focus: { label: 'Focus', color: 'text-pomo-red', icon: Brain },
  shortBreak: { label: 'Short Break', color: 'text-pomo-green', icon: Coffee },
  longBreak: { label: 'Long Break', color: 'text-pomo-blue', icon: Armchair },
};

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  activeTask,
  mode,
  timeLeft,
  isActive,
  hasCompleted,
  timerDurations,
  onModeSwitch,
  onToggleTimer,
  onResetTimer,
  onSkipTimer,
  onStartBreak,
  className
}) => {
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(getAudioSettings());
  const [showCelebration, setShowCelebration] = useState(false);
  const [pendingModeSwitch, setPendingModeSwitch] = useState<TimerMode | null>(null);
  const [pendingAutoStart, setPendingAutoStart] = useState(false);
  
  // Progress calculation for the circle
  const totalTime = timerDurations[mode];
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getFocusToBreakConfirmationMessage = (targetMode: TimerMode): string | null => {
    if (targetMode !== 'shortBreak' && targetMode !== 'longBreak') return null;

    const elapsedSeconds = Math.max(0, timerDurations.focus - timeLeft);
    const targetLabel = targetMode === 'shortBreak' ? '短休息' : '长休息';

    if (!isActive && elapsedSeconds === 0) return null;
    if (timeLeft === 0) return null;

    const elapsedLabel = formatTime(elapsedSeconds);

    if (isActive) {
      if (elapsedSeconds < 60) {
        return `确定结束本次专注并开始${targetLabel}吗？`;
      }
      if (elapsedSeconds < 5 * 60) {
        return `你已专注 ${elapsedLabel}，现在开始${targetLabel}吗？`;
      }
      return `你已专注 ${elapsedLabel}，确定提前结束并开始${targetLabel}吗？`;
    }

    if (elapsedSeconds < 60) {
      return `切换到${targetLabel}会重置本次专注，是否继续？`;
    }
    return `本次专注已进行 ${elapsedLabel}，切换到${targetLabel}将重置专注，是否继续？`;
  };

  const getBreakToOtherConfirmationMessage = (currentMode: TimerMode, targetMode: TimerMode): string | null => {
    if (currentMode !== 'shortBreak' && currentMode !== 'longBreak') return null;
    if (targetMode === currentMode) return null;

    const currentLabel = currentMode === 'shortBreak' ? '短休息' : '长休息';
    const targetLabel =
      targetMode === 'focus'
        ? '专注'
        : targetMode === 'shortBreak'
          ? '短休息'
          : '长休息';
    const elapsedSeconds = Math.max(0, timerDurations[currentMode] - timeLeft);

    if (!isActive && elapsedSeconds === 0) return null;
    if (timeLeft === 0) return null;

    const elapsedLabel = formatTime(elapsedSeconds);

    if (isActive) {
      if (elapsedSeconds < 60) {
        return `确定结束本次${currentLabel}并切换到${targetLabel}吗？`;
      }
      if (elapsedSeconds < 5 * 60) {
        return `你已休息 ${elapsedLabel}，现在切换到${targetLabel}吗？`;
      }
      return `你已休息 ${elapsedLabel}，确定提前结束并切换到${targetLabel}吗？`;
    }

    if (elapsedSeconds < 60) {
      return `切换到${targetLabel}会重置本次${currentLabel}，是否继续？`;
    }
    return `本次${currentLabel}已进行 ${elapsedLabel}，切换到${targetLabel}将重置休息，是否继续？`;
  };

  const handleModeSwitch = (newMode: TimerMode, autoStart: boolean = false) => {
    if (mode === 'focus' && (newMode === 'shortBreak' || newMode === 'longBreak')) {
      const message = getFocusToBreakConfirmationMessage(newMode);
      if (message) {
        setPendingModeSwitch(newMode);
        setPendingAutoStart(autoStart);
        return;
      }
    }

    if ((mode === 'shortBreak' || mode === 'longBreak') && newMode !== mode) {
      const message = getBreakToOtherConfirmationMessage(mode, newMode);
      if (message) {
        setPendingModeSwitch(newMode);
        setPendingAutoStart(autoStart);
        return;
      }
    }

    onModeSwitch(newMode, autoStart);
  };

  const handleTakeBreak = () => {
    // Show celebration animation
    setShowCelebration(true);
    
    // Hide celebration after animation
    setTimeout(() => {
      setShowCelebration(false);
      // Trigger break start
      if (onStartBreak) {
        onStartBreak();
      }
    }, 1500); // Celebration animation duration
  };

  // Load settings on mount
  useEffect(() => {
    setAudioSettings(getAudioSettings());
  }, []);

  const handleToggleTickSound = () => {
    const newValue = !audioSettings.tickSoundEnabled;
    updateAudioSetting('tickSoundEnabled', newValue);
    setAudioSettings({ ...audioSettings, tickSoundEnabled: newValue });
  };

  // Dynamic theme color based on mode
  const themeColor = mode === 'focus' ? 'bg-pomo-red' : mode === 'shortBreak' ? 'bg-pomo-green' : 'bg-pomo-blue';
  const themeTextColor = MODES[mode].color;
  const themeBorderColor = mode === 'focus' ? 'border-pomo-red' : mode === 'shortBreak' ? 'border-pomo-green' : 'border-pomo-blue';

  return (
    <div className={cn(
      "card p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500",
      className
    )}>
      {pendingModeSwitch && (
        <ModeSwitchPrompt
          title={mode === 'focus' ? '切换休息模式' : '切换计时模式'}
          message={
            getFocusToBreakConfirmationMessage(pendingModeSwitch) ??
            getBreakToOtherConfirmationMessage(mode, pendingModeSwitch) ??
            ''
          }
          confirmLabel={
            pendingModeSwitch === 'focus'
              ? '开始专注'
              : `开始${pendingModeSwitch === 'shortBreak' ? '短休息' : '长休息'}`
          }
          cancelLabel={
            mode === 'focus'
              ? '继续专注'
              : `继续${mode === 'shortBreak' ? '短休息' : '长休息'}`
          }
          onConfirm={() => {
            const nextMode = pendingModeSwitch;
            const nextAutoStart = pendingAutoStart;
            setPendingModeSwitch(null);
            setPendingAutoStart(false);
            onModeSwitch(nextMode, nextAutoStart);
          }}
          onCancel={() => {
            setPendingModeSwitch(null);
            setPendingAutoStart(false);
          }}
        />
      )}
      {/* Tick Sound Toggle - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-20">
        <button
          onClick={handleToggleTickSound}
          className={cn(
            "p-2 rounded-lg transition-all",
            audioSettings.tickSoundEnabled 
              ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" 
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          )}
          title={audioSettings.tickSoundEnabled ? "Disable tick sound" : "Enable tick sound"}
        >
          {audioSettings.tickSoundEnabled ? (
            <Volume2 size={20} />
          ) : (
            <VolumeX size={20} />
          )}
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex space-x-2 mb-8 z-10 glass p-1 rounded-full">
        {(Object.keys(MODES) as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeSwitch(m)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
              mode === m 
                ? `${themeColor} text-white shadow-md` 
                : "text-slate-500 hover:text-slate-700 hover:bg-white/70"
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
            className="text-slate-100"
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
          <div className={cn("text-6xl font-semibold tabular-nums tracking-tighter", themeTextColor)}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-slate-400 font-medium mt-2 uppercase tracking-[0.35em] text-xs">
            {isActive ? 'Running' : 'Paused'}
          </div>
        </div>
      </div>

      {/* Active Task Display */}
      <div className="mb-8 w-full max-w-md text-center h-12">
        {mode === 'focus' ? (
           activeTask ? (
            <div className="card-muted px-3 py-2 flex items-center justify-center gap-2 animate-fadeIn">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Working on</span>
              <span className="font-medium text-slate-800 truncate max-w-[200px]">{activeTask.title}</span>
            </div>
          ) : (
            <div className="text-slate-400 text-sm italic py-2">Select a task below to track progress</div>
          )
        ) : (
          <div className="text-slate-500 font-medium py-2">Take a breath, relax.</div>
        )}
      </div>

      {/* Celebration Animation */}
      {showCelebration && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none overflow-hidden">
          <div className="text-7xl animate-bounce">
            🎉
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(30)].map((_, i) => {
              const angle = (i / 30) * Math.PI * 2;
              const distance = 100 + Math.random() * 50;
              const x = 50 + Math.cos(angle) * (distance / 10);
              const y = 50 + Math.sin(angle) * (distance / 10);
              return (
                <div
                  key={i}
                  className="absolute text-2xl animate-ping"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    animationDelay: `${Math.random() * 0.3}s`,
                    animationDuration: `${0.8 + Math.random() * 0.4}s`,
                  }}
                >
                  ✨
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4 z-10">
        {/* Show "Take a Break" button when focus mode completes */}
        {mode === 'focus' && timeLeft === 0 && hasCompleted ? (
          <button
            onClick={handleTakeBreak}
            className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center bg-pomo-green text-white shadow-lg transform transition-all hover:scale-105 active:scale-95"
          >
            <Coffee size={32} />
            <span className="text-xs font-medium mt-1">Take a Break</span>
          </button>
        ) : (
          <button
            onClick={onToggleTimer}
            className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg transform transition-all hover:scale-105 active:scale-95",
              themeColor
            )}
          >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
        )}
        
        <button
          onClick={onResetTimer}
          className="w-14 h-14 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
          title="Reset Timer"
        >
          <RotateCcw size={24} />
        </button>

        {isActive && timeLeft > 0 && (
           <button
           onClick={onSkipTimer}
           className="w-14 h-14 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
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

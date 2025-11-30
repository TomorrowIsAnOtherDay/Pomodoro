import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Coffee, Brain, Armchair, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { TimerMode, Task } from '../types';
import { cn, formatTime, playAlarmSound, playTickSound, stopTickSound, getAudioSettings, updateAudioSetting, AudioSettings } from '../utils';

interface TimerDisplayProps {
  activeTask: Task | undefined;
  onTimerComplete: (mode: TimerMode) => void;
  onModeChange: (mode: TimerMode) => void;
  startBreakTrigger?: number; // When this changes, start short break mode
  startFocusTrigger?: number; // When this changes, start focus mode
  onStartBreak?: () => void; // Callback to trigger break start
}

// Check if debug mode is enabled via URL parameter (?debug=true)
const getDebugMode = (): boolean => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('debug') === 'true';
  }
  return false;
};

const DEBUG_MODE = getDebugMode();

const MODES: Record<TimerMode, { label: string; time: number; color: string; icon: React.ElementType }> = {
  focus: { label: 'Focus', time: DEBUG_MODE ? 5 : 25 * 60, color: 'text-pomo-red', icon: Brain },
  shortBreak: { label: 'Short Break', time: DEBUG_MODE ? 5 : 5 * 60, color: 'text-pomo-green', icon: Coffee },
  longBreak: { label: 'Long Break', time: DEBUG_MODE ? 5 : 15 * 60, color: 'text-pomo-blue', icon: Armchair },
};

const TimerDisplay: React.FC<TimerDisplayProps> = ({ activeTask, onTimerComplete, onModeChange, startBreakTrigger, startFocusTrigger, onStartBreak }) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.time);
  const [isActive, setIsActive] = useState(false);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(getAudioSettings());
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Progress calculation for the circle
  const totalTime = MODES[mode].time;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleModeSwitch = (newMode: TimerMode, autoStart: boolean = false) => {
    setMode(newMode);
    setTimeLeft(MODES[newMode].time);
    setIsActive(autoStart);
    setHasCompleted(false); // Reset completion flag when switching modes
    onModeChange(newMode);
  };

  // Handle external trigger to start break
  useEffect(() => {
    if (startBreakTrigger && startBreakTrigger > 0) {
      setMode('shortBreak');
      setTimeLeft(MODES.shortBreak.time);
      setIsActive(true);
      setHasCompleted(false); // Reset completion flag when starting break
      onModeChange('shortBreak');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startBreakTrigger]);

  // Handle external trigger to start focus
  useEffect(() => {
    if (startFocusTrigger && startFocusTrigger > 0) {
      setMode('focus');
      setTimeLeft(MODES.focus.time);
      setIsActive(true);
      setHasCompleted(false); // Reset completion flag when starting focus
      onModeChange('focus');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startFocusTrigger]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    // Stop tick sound when pausing
    if (isActive) {
      stopTickSound();
    }
  };
  
  const resetTimer = () => {
    setIsActive(false);
    stopTickSound(); // Stop tick sound when resetting
    setTimeLeft(MODES[mode].time);
    setHasCompleted(false); // Reset completion flag when resetting
  };

  const handleComplete = useCallback(() => {
    // Only complete if timer actually reached 0 while active and hasn't been completed yet
    if (timeLeft === 0 && isActive && !hasCompleted) {
      setHasCompleted(true);
      setIsActive(false);
      playAlarmSound(); // Play alarm sound when timer completes
      onTimerComplete(mode);
      // Auto reset for next round, but don't start
      setTimeLeft(0); 
    }
  }, [mode, onTimerComplete, timeLeft, isActive, hasCompleted]);

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

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          // Play tick sound on each second only in focus mode
          if (mode === 'focus' && newTime > 0) {
            playTickSound();
          } else if (mode !== 'focus' && newTime === 0) {
            // Stop tick sound when timer reaches 0 in break mode
            stopTickSound();
          }
          return newTime;
        });
      }, 1000);
      // Play initial tick when timer starts, only in focus mode
      if (mode === 'focus') {
        playTickSound();
      }
    } else if (timeLeft === 0 && isActive && !hasCompleted) {
      stopTickSound(); // Ensure tick sound is stopped before alarm
      handleComplete();
    } else if (!isActive) {
      // Stop tick sound when timer is paused
      stopTickSound();
    }

    return () => {
      clearInterval(interval);
      // Stop tick sound when component unmounts or effect cleans up
      stopTickSound();
    };
  }, [isActive, timeLeft, handleComplete, mode]);

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
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500">
      {/* Tick Sound Toggle - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-20">
        <button
          onClick={handleToggleTickSound}
          className={cn(
            "p-2 rounded-lg transition-all",
            audioSettings.tickSoundEnabled 
              ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100" 
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
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
            onClick={toggleTimer}
            className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg transform transition-all hover:scale-105 active:scale-95",
              themeColor
            )}
          >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
        )}
        
        <button
          onClick={resetTimer}
          className="w-14 h-14 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
          title="Reset Timer"
        >
          <RotateCcw size={24} />
        </button>

        {isActive && timeLeft > 0 && (
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

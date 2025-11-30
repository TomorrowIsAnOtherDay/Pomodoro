import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Audio file path for tick sound (can be customized)
// Place your audio file in public/sounds/ directory
// Supported formats: .mp3, .wav, .ogg, .m4a
const TICK_SOUND_PATH = '/sounds/tick.mp3'; // Default path, change this to your file name

// Cache the audio element for better performance
let tickAudio: HTMLAudioElement | null = null;

// Initialize the audio element
const initTickAudio = (): HTMLAudioElement | null => {
  if (tickAudio) return tickAudio;
  
  try {
    const audio = new Audio(TICK_SOUND_PATH);
    audio.volume = 0.5; // Set volume (0.0 to 1.0)
    audio.preload = 'auto'; // Preload the audio file
    
    // Handle loading errors
    audio.addEventListener('error', (e) => {
      console.warn('Tick sound file not found, falling back to generated sound:', TICK_SOUND_PATH);
      tickAudio = null; // Reset to allow fallback
    });
    
    tickAudio = audio;
    return audio;
  } catch (e) {
    console.warn('Failed to initialize tick audio:', e);
    return null;
  }
};

// Create a ticking sound for the timer
export const playTickSound = () => {
  const settings = getAudioSettings();
  if (!settings.tickSoundEnabled) return;
  
  try {
    // Try to use local audio file first
    const audio = initTickAudio();
    
    if (audio) {
      // Reset audio to start if it's already playing
      audio.currentTime = 0;
      audio.play().catch((e) => {
        // If play fails (e.g., user hasn't interacted with page), fall back to generated sound
        console.warn('Audio play failed, using fallback:', e);
        playTickSoundFallback();
      });
      return;
    }
    
    // Fallback to generated sound if audio file is not available
    playTickSoundFallback();
  } catch (e) {
    // Silently fail if audio is not available
    playTickSoundFallback();
  }
};

// Fallback: Generate tick sound using Web Audio API
const playTickSoundFallback = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Create a short, sharp "tick" sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime); // Higher pitch for tick
    
    // Very short duration (0.05 seconds) for a sharp tick
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    // Silently fail if audio is not available
  }
};

// Stop tick sound if it's playing
export const stopTickSound = () => {
  try {
    if (tickAudio && !tickAudio.paused) {
      tickAudio.pause();
      tickAudio.currentTime = 0;
    }
  } catch (e) {
    // Silently fail if audio is not available
  }
};

// Function to set custom tick sound path (optional, for future use)
export const setTickSoundPath = (path: string) => {
  tickAudio = null; // Reset cached audio
  // Note: This would require updating TICK_SOUND_PATH, which is a constant
  // For a more dynamic solution, you could use a state management system
};

// Audio file path for alarm sound (can be customized)
// Place your audio file in public/sounds/ directory
// Supported formats: .mp3, .wav, .ogg, .m4a
const ALARM_SOUND_PATH = '/sounds/alarm.mp3'; // Default path, change this to your file name

// Cache the alarm audio element for better performance
let alarmAudio: HTMLAudioElement | null = null;

// Initialize the alarm audio element
const initAlarmAudio = (): HTMLAudioElement | null => {
  if (alarmAudio) return alarmAudio;
  
  try {
    const audio = new Audio(ALARM_SOUND_PATH);
    audio.volume = 0.7; // Set volume (0.0 to 1.0)
    audio.preload = 'auto'; // Preload the audio file
    audio.loop = false; // Don't loop by default
    
    // Handle loading errors
    audio.addEventListener('error', (e) => {
      console.warn('Alarm sound file not found, falling back to generated sound:', ALARM_SOUND_PATH);
      alarmAudio = null; // Reset to allow fallback
    });
    
    alarmAudio = audio;
    return audio;
  } catch (e) {
    console.warn('Failed to initialize alarm audio:', e);
    return null;
  }
};

// Play alarm sound when timer completes (max 5 seconds)
export const playAlarmSound = () => {
  // Stop tick sound first
  stopTickSound();
  
  try {
    // Try to use local audio file first
    const audio = initAlarmAudio();
    
    if (audio) {
      // Reset audio to start if it's already playing
      audio.currentTime = 0;
      
      // Set up timeout to stop audio after 5 seconds
      const stopTimeout = setTimeout(() => {
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      }, 5000); // Stop after 5 seconds
      
      // Clear timeout if audio ends naturally before 5 seconds
      audio.addEventListener('ended', () => {
        clearTimeout(stopTimeout);
      });
      
      audio.play().catch((e) => {
        // If play fails (e.g., user hasn't interacted with page), fall back to generated sound
        clearTimeout(stopTimeout);
        console.warn('Alarm audio play failed, using fallback:', e);
        playAlarmSoundFallback();
      });
      return;
    }
    
    // Fallback to generated sound if audio file is not available
    playAlarmSoundFallback();
  } catch (e) {
    // Silently fail if audio is not available
    playAlarmSoundFallback();
  }
};

// Fallback: Generate alarm sound using Web Audio API (max 5 seconds)
const playAlarmSoundFallback = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    
    // Create a more noticeable alarm sound (multiple tones)
    // Limit to 5 seconds total - play 5 tones over 5 seconds
    const maxDuration = 5000; // 5 seconds in milliseconds
    const toneCount = 5;
    const interval = maxDuration / toneCount; // 1 second per tone
    
    for (let i = 0; i < toneCount; i++) {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.setValueAtTime(1108, ctx.currentTime + 0.1); // C#6
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
        
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }, i * interval);
    }
  } catch (e) {
    // Silently fail if audio is not available
  }
};

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Audio settings management
export interface AudioSettings {
  tickSoundEnabled: boolean;
  alarmSoundEnabled: boolean;
  notificationSoundEnabled: boolean;
}

const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  tickSoundEnabled: true,
  alarmSoundEnabled: true,
  notificationSoundEnabled: true,
};

const SETTINGS_KEY = 'pomodoro_audio_settings';

export const getAudioSettings = (): AudioSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load audio settings:', e);
  }
  return DEFAULT_AUDIO_SETTINGS;
};

export const saveAudioSettings = (settings: AudioSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save audio settings:', e);
  }
};

export const updateAudioSetting = <K extends keyof AudioSettings>(
  key: K,
  value: AudioSettings[K]
): void => {
  const settings = getAudioSettings();
  settings[key] = value;
  saveAudioSettings(settings);
};

// Request notification permission and send desktop notification
export const sendDesktopNotification = (title: string, options?: NotificationOptions) => {
  const settings = getAudioSettings();
  if (!settings.notificationSoundEnabled) {
    // Still send notification even if sound is disabled
  }
  
  // Check if browser supports notifications
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notifications');
    return;
  }

  // Check if permission is already granted
  if (Notification.permission === 'granted') {
    new Notification(title, options);
    return;
  }

  // Request permission if not yet requested
  if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, options);
      }
    });
  }
};

// Play notification sound (used in RestEndPrompt)
export const playNotificationSound = () => {
  const settings = getAudioSettings();
  if (!settings.notificationSoundEnabled) return;
  
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

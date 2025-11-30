export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export type TaskStatus = 'todo' | 'doing' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  note?: string;
  estPomodoros: number;
  actPomodoros: number;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: number;
  deletedAt?: number; // Timestamp when task was deleted, undefined if not deleted
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  totalPomodoros: number;
  completedTasks: number;
  totalFocusMinutes: number;
}

export interface TimerConfig {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

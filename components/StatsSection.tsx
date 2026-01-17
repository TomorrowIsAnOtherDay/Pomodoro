import React from 'react';
import { DailyStats } from '../types';
import { Flame, CheckCircle2, Clock } from 'lucide-react';

interface StatsSectionProps {
  stats: DailyStats;
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="card p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-kiwi-pink/15 flex items-center justify-center text-kiwi-pink">
          <Flame size={24} />
        </div>
        <div>
          <div className="text-2xl font-semibold text-slate-900">{stats.totalPomodoros}</div>
          <div className="text-xs text-slate-400 uppercase tracking-[0.2em]">Pomodoros Today</div>
        </div>
      </div>

      <div className="card p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-kiwi-cyan/15 flex items-center justify-center text-kiwi-cyan">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <div className="text-2xl font-semibold text-slate-900">{stats.completedTasks}</div>
          <div className="text-xs text-slate-400 uppercase tracking-[0.2em]">Tasks Completed</div>
        </div>
      </div>

      <div className="card p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-kiwi-yellow/40 flex items-center justify-center text-slate-700">
          <Clock size={24} />
        </div>
        <div>
          <div className="text-2xl font-semibold text-slate-900">{stats.totalFocusMinutes}</div>
          <div className="text-xs text-slate-400 uppercase tracking-[0.2em]">Minutes Focused</div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;

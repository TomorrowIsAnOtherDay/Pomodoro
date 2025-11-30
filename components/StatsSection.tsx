import React from 'react';
import { DailyStats } from '../types';
import { Flame, CheckCircle2, Clock } from 'lucide-react';

interface StatsSectionProps {
  stats: DailyStats;
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-pomo-red">
          <Flame size={24} />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalPomodoros}</div>
          <div className="text-xs text-gray-500 uppercase font-semibold">Pomodoros Today</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-pomo-green">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-800">{stats.completedTasks}</div>
          <div className="text-xs text-gray-500 uppercase font-semibold">Tasks Completed</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-pomo-blue">
          <Clock size={24} />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalFocusMinutes}</div>
          <div className="text-xs text-gray-500 uppercase font-semibold">Minutes Focused</div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;

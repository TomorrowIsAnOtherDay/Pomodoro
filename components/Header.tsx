import React from 'react';

const Header: React.FC = () => {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-kiwi-pink/15 text-kiwi-pink flex items-center justify-center text-2xl shadow-soft">
            🍅
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Pomodoro Desk</p>
            <h1 className="text-3xl font-semibold text-slate-900 font-display">Focus dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Stay steady, keep the rhythm, finish with clarity.</p>
          </div>
        </div>
        <div className="card px-4 py-2 text-sm text-slate-600 font-medium">
          {dateStr}
        </div>
      </div>
    </header>
  );
};

export default Header;

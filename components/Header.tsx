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
    <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-pomo-red text-3xl">🍅</span> Pomodoro Timer
        </h1>
        <p className="text-gray-500 text-sm mt-1">Focus, track, and get things done.</p>
      </div>
      <div className="mt-2 md:mt-0 text-gray-600 font-medium bg-white px-3 py-1 rounded-md shadow-sm border border-gray-100">
        {dateStr}
      </div>
    </header>
  );
};

export default Header;

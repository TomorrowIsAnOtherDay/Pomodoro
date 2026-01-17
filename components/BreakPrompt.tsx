import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface BreakPromptProps {
  onStartBreak: () => void;
  onDismiss: () => void;
}

const BreakPrompt: React.FC<BreakPromptProps> = ({ onStartBreak, onDismiss }) => {
  const [isClosing, setIsClosing] = useState(false);

  // Auto dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsClosing(true);
    // Wait for animation to complete before calling onDismiss
    setTimeout(() => {
      onDismiss();
    }, 300); // Match animation duration
  };

  const handleStartBreak = () => {
    setIsClosing(true);
    setTimeout(() => {
      onStartBreak();
    }, 300);
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${isClosing ? 'animate-slide-up' : 'animate-slide-down'}`}>
      <div className="bg-kiwi-yellow/35 border-b border-kiwi-yellow/60 shadow-md backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl flex-shrink-0">🍅</span>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 font-medium">
                  本次番茄完成！是否开始 5 分钟短休息？
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleStartBreak}
                className="px-4 py-2 bg-pomo-green text-white rounded-lg font-medium hover:brightness-95 transition-all duration-200 shadow-sm whitespace-nowrap hover:shadow-md hover:scale-105 active:scale-95"
              >
                开始短休息
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-white/70 text-slate-700 rounded-lg font-medium hover:bg-white transition-all duration-200 whitespace-nowrap hover:scale-105 active:scale-95"
              >
                忽略
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 text-slate-400 hover:text-slate-600 transition-all duration-200 flex-shrink-0 rounded-lg hover:bg-white/70 active:scale-95"
                title="关闭"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakPrompt;

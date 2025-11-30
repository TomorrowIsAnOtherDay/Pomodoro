import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { sendDesktopNotification, playNotificationSound } from '../utils';

interface RestEndPromptProps {
  onStartFocus: () => void;
  onDismiss: () => void;
}

const RestEndPrompt: React.FC<RestEndPromptProps> = ({ onStartFocus, onDismiss }) => {
  const [isClosing, setIsClosing] = useState(false);

  // Auto dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  // Send notification and play sound when prompt appears
  useEffect(() => {
    // Play a gentle notification sound
    playNotificationSound();
    
    // Send desktop notification if user is on another tab
    sendDesktopNotification('休息结束，可以开始新一轮专注！', {
      body: '你的休息时间已结束，准备开始下一轮专注吗？',
      icon: '/favicon.ico', // You can customize this
      tag: 'rest-end', // Prevent duplicate notifications
      requireInteraction: false,
    });
  }, []);

  const handleDismiss = () => {
    setIsClosing(true);
    // Wait for animation to complete before calling onDismiss
    setTimeout(() => {
      onDismiss();
    }, 350); // Match animation duration
  };

  const handleStartFocus = () => {
    setIsClosing(true);
    setTimeout(() => {
      onStartFocus();
    }, 350);
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${isClosing ? 'animate-slide-up' : 'animate-slide-down'}`}>
      <div className="bg-green-50 border-b border-green-200 shadow-md backdrop-blur-sm bg-opacity-95">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl flex-shrink-0">🌿</span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 font-medium">
                  休息结束，可以开始新的专注啦！
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleStartFocus}
                className="px-4 py-2 bg-pomo-green text-white rounded-lg font-medium hover:bg-green-600 transition-all duration-200 shadow-sm whitespace-nowrap hover:shadow-md hover:scale-105 active:scale-95"
              >
                开始 25 分钟专注
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 whitespace-nowrap hover:scale-105 active:scale-95"
              >
                忽略
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 text-gray-400 hover:text-gray-600 transition-all duration-200 flex-shrink-0 rounded-lg hover:bg-gray-100 active:scale-95"
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

export default RestEndPrompt;


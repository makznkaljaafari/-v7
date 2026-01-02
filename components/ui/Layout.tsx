
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

interface LayoutProps {
  title: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  onBack?: () => void;
}

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const timeString = time.toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="flex flex-col items-end justify-center px-3 border-r border-slate-900/10 dark:border-white/10 ml-1">
      <div className="text-[11px] font-black tabular-nums text-white dark:text-emerald-400">{timeString}</div>
    </div>
  );
};

export const PageLayout: React.FC<LayoutProps> = ({ title, headerExtra, children, onBack }) => {
  const { navigate, notifications } = useApp();
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="flex flex-col min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-500 w-full">
      {/* Sticky Header Optimized for Mobile */}
      <div className="sticky top-0 z-40 w-full flex justify-center px-2 pt-2 pointer-events-none">
        <header className="w-full max-w-7xl bg-sky-600 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[1.5rem] border border-sky-500/50 dark:border-white/10 shadow-lg pointer-events-auto overflow-hidden">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {onBack && (
                <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white/20 dark:bg-white/10 flex items-center justify-center text-lg text-white active:scale-90 transition-all border border-white/30 dark:border-white/5">
                  <span className="rotate-0">→</span>
                </button>
              )}
              <div className="flex flex-col truncate">
                <h1 className="text-base font-black text-white dark:text-emerald-400 truncate leading-none">{title}</h1>
                <p className="text-[7px] font-black text-white/60 dark:text-white/30 tracking-[0.1em] mt-0.5 uppercase">Al-Shwaia Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <DigitalClock />
              <div className="flex items-center gap-1">
                {headerExtra}
                
                <button 
                  onClick={() => navigate('notifications')} 
                  className="w-9 h-9 rounded-xl bg-white/20 dark:bg-white/10 flex items-center justify-center text-lg text-white border border-white/30 dark:border-white/5 active:scale-90 transition-all relative"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-sky-600 animate-pulse"></span>
                  )}
                </button>

                <button 
                  onClick={() => navigate('settings')} 
                  className="w-9 h-9 rounded-xl bg-white/20 dark:bg-white/10 flex items-center justify-center text-lg text-white border border-white/30 dark:border-white/5 active:scale-90 transition-all"
                >
                  ⚙️
                </button>
              </div>
            </div>
          </div>
        </header>
      </div>
      <main className="flex-1 w-full px-4 pt-4 pb-32 flex flex-col items-center">
        <div className="w-full max-w-4xl">{children}</div>
      </main>
    </div>
  );
};

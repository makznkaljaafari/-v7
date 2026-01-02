
import React, { memo } from 'react';
import { useApp } from '../context/AppContext';

const BottomNav: React.FC = () => {
  const { currentPage, navigate } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: '🏠' },
    { id: 'sales', label: 'المبيعات', icon: '💰' },
    { id: 'add-sale', label: 'إضافة', icon: '＋', primary: true },
    { id: 'ai-advisor', label: 'الذكاء', icon: '🤖' },
    { id: 'customers', label: 'العملاء', icon: '👥' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-3 pb-4 safe-bottom pointer-events-none">
      <nav className="w-full max-w-lg glass-card h-16 flex justify-around items-center rounded-[1.8rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] pointer-events-auto px-1">
        {navItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => navigate(item.id as any)}
            className={`flex flex-col items-center justify-center transition-all relative flex-1 ${
              item.primary ? 'pb-0' : 'active:scale-90'
            }`}
          >
            {item.primary ? (
              <div className="relative -top-7">
                <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-sky-700 rounded-2xl flex items-center justify-center text-2xl text-white shadow-[0_10px_25px_-5px_rgba(14,165,233,0.5)] border-4 border-white dark:border-slate-900 transform transition-transform active:scale-90">
                  {item.icon}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className={`text-xl transition-all ${currentPage === item.id ? 'scale-110 text-sky-600 dark:text-emerald-400' : 'opacity-40 text-slate-500'}`}>
                  {item.icon}
                </span>
                <span className={`text-[9px] font-black tracking-tighter uppercase mt-0.5 ${currentPage === item.id ? 'text-sky-700 dark:text-emerald-400' : 'opacity-40 text-slate-500'}`}>
                  {item.label}
                </span>
                {currentPage === item.id && (
                  <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-sky-600 dark:bg-emerald-400"></div>
                )}
              </div>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default memo(BottomNav);

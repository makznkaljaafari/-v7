import React from 'react';
import { useApp } from '../context/AppContext';

const Sidebar: React.FC = () => {
  const { currentPage, navigate, logoutAction, user, isSidebarCollapsed, toggleSidebar } = useApp();

  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: '🏠' },
    { id: 'sales', label: 'المبيعات', icon: '💰' },
    { id: 'purchases', label: 'المشتريات', icon: '📦' },
    { id: 'vouchers', label: 'السندات', icon: '📥' },
    { id: 'debts', label: 'الميزانية', icon: '⚖️' },
    { id: 'customers', label: 'العملاء', icon: '👥' },
    { id: 'suppliers', label: 'الموردين', icon: '🚛' },
    { id: 'categories', label: 'المخزون', icon: '🌿' },
    { id: 'reports', label: 'التقارير', icon: '📊' },
    { id: 'expenses', label: 'المصاريف', icon: '💸' },
    { id: 'waste', label: 'التالف', icon: '🥀' },
    { id: 'activity-log', label: 'الرقابة', icon: '🛡️' },
    { id: 'settings', label: 'الإعدادات', icon: '⚙️' },
  ];

  return (
    <aside 
      className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-screen sticky top-0 right-0 z-50 transition-all duration-500 overflow-y-auto no-scrollbar shadow-[25px_0_60px_-15px_rgba(0,0,0,0.1)] relative ${isSidebarCollapsed ? 'w-28' : 'w-96'}`}
    >
      <button 
        onClick={toggleSidebar}
        className="absolute left-4 top-8 w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-sky-500 active:scale-90 transition-all z-50 border-2 border-white dark:border-slate-800"
      >
        <span className={`text-xl transition-transform duration-500 ${isSidebarCollapsed ? 'rotate-180' : 'rotate-0'}`}>
          ←
        </span>
      </button>

      <div className={`p-6 lg:p-10 transition-all duration-500 ${isSidebarCollapsed ? 'items-center' : ''}`}>
        
        <div className={`flex items-center gap-6 mb-16 group cursor-pointer transition-all duration-500 ${isSidebarCollapsed ? 'justify-center' : ''}`} onClick={() => navigate('dashboard')}>
          <div className={`bg-gradient-to-br from-sky-400 to-sky-700 dark:from-emerald-400 dark:to-emerald-800 rounded-[1.5rem] flex items-center justify-center shadow-2xl border-4 border-white/20 group-hover:scale-110 group-hover:rotate-6 transition-all animate-bounce-soft ${isSidebarCollapsed ? 'w-16 h-16 text-3xl' : 'w-20 h-20 text-4xl'}`}>🌿</div>
          {!isSidebarCollapsed && (
            <div className="text-right animate-in fade-in slide-in-from-right-4">
              <h1 className="font-black text-sky-900 dark:text-emerald-400 text-3xl lg:text-4xl leading-none group-hover:scale-[1.05] transition-all py-1">وكالة الشويع</h1>
              <p className="text-[12px] font-black text-sky-600/60 dark:text-emerald-500/60 uppercase tracking-[0.5em] mt-2">الذكاء المحاسبي v3.1</p>
            </div>
          )}
        </div>

        <nav className="space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id as any)}
              className={`w-full flex items-center gap-6 rounded-[2rem] font-black transition-all duration-300 ${isSidebarCollapsed ? 'justify-center p-5' : 'px-8 py-5 text-base'} ${
                currentPage === item.id
                  ? 'bg-sky-600 text-white shadow-[0_20px_40px_-10px_rgba(14,165,233,0.5)] translate-x-[-10px]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600'
              }`}
              title={item.label}
            >
              <span className={`transition-all duration-300 ${isSidebarCollapsed ? 'text-4xl' : 'text-3xl'}`}>{item.icon}</span>
              {!isSidebarCollapsed && <span className="animate-in fade-in slide-in-from-right-2">{item.label}</span>}
              {!isSidebarCollapsed && currentPage === item.id && <div className="mr-auto w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_12px_white]"></div>}
            </button>
          ))}
        </nav>

        <div className={`mt-16 pt-12 border-t-4 border-slate-50 dark:border-slate-800/50 transition-all duration-500 ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
          <div 
            className={`bg-slate-100 dark:bg-slate-800/50 rounded-[3rem] mb-8 flex items-center gap-6 border border-slate-200 dark:border-white/5 group hover:scale-[1.05] transition-all cursor-pointer shadow-inner ${isSidebarCollapsed ? 'p-4 justify-center' : 'p-8'}`} 
            onClick={() => navigate('settings')}
          >
             <div className={`bg-sky-600 dark:bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black shadow-2xl group-hover:rotate-12 transition-all ${isSidebarCollapsed ? 'w-12 h-12 text-xl' : 'w-18 h-18 text-3xl'}`}>{user?.full_name?.[0] || 'M'}</div>
             {!isSidebarCollapsed && (
               <div className="text-right flex-1 overflow-hidden animate-in fade-in slide-in-from-right-2">
                  <p className="font-black text-slate-950 dark:text-white text-2xl truncate mb-1 group-hover:translate-x-2 transition-transform">{user?.full_name || 'مدير النظام'}</p>
                  <p className="text-xs font-bold text-slate-500 truncate opacity-70 italic tracking-tight">{user?.email || 'shwaia@cloud.com'}</p>
               </div>
             )}
          </div>
          
          <button 
            onClick={() => logoutAction()}
            className={`w-full flex items-center gap-6 rounded-[2rem] font-black text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all border-2 border-transparent hover:border-rose-100 dark:border-rose-900/20 group ${isSidebarCollapsed ? 'justify-center p-5' : 'px-8 py-5 text-sm'}`}
          >
            <span className={`group-hover:scale-125 transition-transform ${isSidebarCollapsed ? 'text-4xl' : 'text-3xl'}`}>🚪</span>
            {!isSidebarCollapsed && <span className="tracking-tighter animate-in fade-in slide-in-from-right-2">خروج آمن</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
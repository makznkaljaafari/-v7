
import React, { useMemo, useState } from 'react';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PageLayout } from './ui/Layout';
import { financeService } from '../services/financeService';

const Dashboard: React.FC = () => {
  const { navigate, theme, toggleTheme } = useUI();
  const { user } = useAuth();
  const { sales, purchases, vouchers, customers, suppliers } = useData();
  const [isMasked, setIsMasked] = useState(false);

  const yerSummary = useMemo(() => {
    const summary = financeService.getGlobalBudgetSummary(customers, suppliers, sales, purchases, vouchers);
    return summary.find(s => s.currency === 'YER') || { assets: 0, liabilities: 0, net: 0 };
  }, [customers, suppliers, sales, purchases, vouchers]);

  const mainServices = [
    { id: 'sales', label: 'المبيعات', icon: '💰', bg: 'bg-sky-100 dark:bg-emerald-900/30', text: 'text-sky-900 dark:text-emerald-400' },
    { id: 'purchases', label: 'المشتريات', icon: '📦', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-900 dark:text-orange-400' },
    { id: 'vouchers', label: 'السندات', icon: '📥', bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-900 dark:text-indigo-400' },
    { id: 'debts', label: 'الميزانية', icon: '⚖️', bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-900 dark:text-rose-400' },
    { id: 'customers', label: 'العملاء', icon: '👥', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-900 dark:text-blue-400' },
    { id: 'categories', label: 'المخزون', icon: '🌿', bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-900 dark:text-teal-400' },
    { id: 'returns', label: 'المرتجعات', icon: '🔄', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-900 dark:text-red-400' },
    { id: 'waste', label: 'التالف', icon: '🥀', bg: 'bg-rose-200 dark:bg-rose-900/20', text: 'text-rose-900 dark:text-rose-400' },
    { id: 'expenses', label: 'المصاريف', icon: '💸', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-900 dark:text-amber-400' },
    { id: 'suppliers', label: 'الموردين', icon: '🚛', bg: 'bg-slate-200 dark:bg-slate-800', text: 'text-slate-900 dark:text-slate-400' },
    { id: 'activity-log', label: 'النشاطات', icon: '🛡️', bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-300' },
    { id: 'reports', label: 'التقارير', icon: '📊', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-900 dark:text-purple-400' },
  ];

  const formatAmount = (val: number) => isMasked ? '••••••' : val.toLocaleString();

  return (
    <PageLayout 
      title={user?.agency_name || 'وكالة الشويع'}
      headerExtra={
        <button onClick={toggleTheme} className="w-9 h-9 rounded-xl bg-white/20 dark:bg-white/10 flex items-center justify-center text-lg text-white border border-white/30 dark:border-white/5 active:scale-90 transition-all">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      }
    >
      <div className="space-y-4 page-enter pb-10">
        <div className="px-1">
           <h2 className="text-2xl font-black text-vibrant-hero leading-tight animate-vibrant-pulse">
             أهلاً بك، {user?.full_name?.split(' ')[0] || 'مدير النظام'}
           </h2>
           <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-widest opacity-70">
             وكالة الشويع ترحب بك مجدداً
           </p>
        </div>

        {/* Ultra-Compact Budget Card */}
        <div className={`relative overflow-hidden rounded-[1.8rem] p-4 shadow-xl transition-all duration-500 border ${
          theme === 'dark' ? 'bg-slate-900 border-white/5 text-white' : 'bg-white border-sky-100 text-slate-950 shadow-sky-900/5'
        }`}>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-sky-400 to-emerald-400 opacity-40"></div>
          
          <div className="flex justify-between items-center mb-1">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">صافي الرصيد الحالي (YER)</span>
            <button onClick={() => setIsMasked(!isMasked)} className="text-sm opacity-30 active:scale-90 transition-all">{isMasked ? '👁️' : '🙈'}</button>
          </div>

          <div className="flex items-baseline justify-between">
            <h1 className={`text-3xl font-black tabular-nums tracking-tighter ${theme === 'dark' ? 'text-emerald-400' : 'text-sky-900'}`}>
              {formatAmount(yerSummary.net)}
            </h1>
            <div className="flex gap-3">
              <div className="text-right">
                <p className="text-[7px] font-black text-slate-400 uppercase leading-none">لنا</p>
                <p className="text-[11px] font-black text-emerald-500">+{formatAmount(yerSummary.assets)}</p>
              </div>
              <div className="text-right">
                <p className="text-[7px] font-black text-slate-400 uppercase leading-none">علينا</p>
                <p className="text-[11px] font-black text-rose-500">-{formatAmount(yerSummary.liabilities)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Grid - Larger Icons for Touch */}
        <div className="grid grid-cols-3 gap-2">
          {mainServices.map((s) => (
            <button 
              key={s.id} 
              onClick={() => navigate(s.id as any)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-[1.5rem] border transition-all active:scale-95 ${
                theme === 'dark' ? 'bg-slate-900/60 border-white/5' : 'bg-white border-slate-100 shadow-sm'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${s.bg}`}>
                {s.icon}
              </div>
              <span className={`text-[9px] font-black tracking-tighter ${s.text}`}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* AI Banner - Compact & Floating */}
        <div 
          onClick={() => navigate('ai-advisor')}
          className={`relative overflow-hidden p-4 rounded-[1.5rem] shadow-lg cursor-pointer active:scale-95 transition-all border ${
            theme === 'dark' ? 'bg-indigo-900/30 border-indigo-500/10 text-white' : 'bg-sky-50 border-sky-100 text-sky-950'
          }`}
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 bg-sky-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center text-lg shadow-lg border border-white/20 animate-pulse">🤖</div>
            <div className="flex-1">
              <h3 className="text-[11px] font-black">المحاسب الذكي Gemini</h3>
              <p className={`text-[8px] font-bold mt-0.5 opacity-60`}>تحليل مالي فوري بأمر صوتي</p>
            </div>
            <div className="text-lg opacity-40">←</div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;

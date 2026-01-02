
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, formatVoucherReceipt } from '../services/shareService';
import { Voucher } from '../types';

const VouchersList: React.FC = () => {
  const { vouchers, navigate, theme } = useApp();
  const [filter, setFilter] = useState<'الكل' | 'قبض' | 'دفع'>('الكل');

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => filter === 'الكل' || v.type === filter);
  }, [vouchers, filter]);

  const stats = useMemo(() => {
    const receipts = vouchers.filter(v => v.type === 'قبض').reduce((sum, v) => sum + v.amount, 0);
    const payments = vouchers.filter(v => v.type === 'دفع').reduce((sum, v) => sum + v.amount, 0);
    return { receipts, payments };
  }, [vouchers]);

  return (
    <PageLayout title="السندات المالية" onBack={() => navigate('dashboard')}>
      <div className="space-y-4 pt-2 page-enter pb-32">
        
        {/* Quick Stats Header */}
        <div className="grid grid-cols-2 gap-2">
           <div className={`p-4 rounded-[1.8rem] border-2 ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">مقبوضات (لنا)</p>
              <p className="text-xl font-black text-emerald-500 tabular-nums">+{stats.receipts.toLocaleString()}</p>
           </div>
           <div className={`p-4 rounded-[1.8rem] border-2 ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">مدفوعات (علينا)</p>
              <p className="text-xl font-black text-rose-500 tabular-nums">-{stats.payments.toLocaleString()}</p>
           </div>
        </div>

        {/* Filter Switcher */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex">
          {['الكل', 'قبض', 'دفع'].map(f => (
            <button
              key={f} onClick={() => setFilter(f as any)}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all ${filter === f ? 'bg-white dark:bg-slate-700 text-sky-600 shadow-sm' : 'text-slate-400'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredVouchers.map((v) => (
            <div 
              key={v.id} 
              className={`p-5 rounded-[1.8rem] border-2 transition-all active:scale-[0.98] ${
                theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                    v.type === 'قبض' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {v.type === 'قبض' ? '📥' : '📤'}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">{v.person_name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 tabular-nums">
                      {new Date(v.date).toLocaleDateString('ar-YE')} • {v.notes || 'سند مالي'}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`text-xl font-black tabular-nums tracking-tighter ${v.type === 'قبض' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {v.type === 'قبض' ? '+' : '-'}{v.amount.toLocaleString()}
                  </p>
                  <small className="text-[8px] font-black opacity-30 uppercase tracking-widest block text-left">{v.currency}</small>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <button onClick={() => shareToWhatsApp(formatVoucherReceipt(v))} className="flex-1 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 py-2.5 rounded-xl font-black text-[10px] border border-sky-100">💬 مشاركة</button>
                <button onClick={() => navigate('add-voucher', { id: v.id })} className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-500 py-2.5 rounded-xl font-black text-[10px] border border-slate-200">📝 تفاصيل</button>
              </div>
            </div>
          ))}
          {filteredVouchers.length === 0 && (
            <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
              <span className="text-6xl">📥</span>
              <p className="font-black">لا توجد سندات مسجلة</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="fixed bottom-24 left-6 flex flex-col gap-3">
        <button onClick={() => navigate('add-voucher', { type: 'دفع' })} className="w-14 h-14 rounded-2xl bg-rose-600 text-white shadow-xl flex items-center justify-center text-2xl border-4 border-white dark:border-slate-800 active:scale-90 transition-all">📤</button>
        <button onClick={() => navigate('add-voucher', { type: 'قبض' })} className="w-16 h-16 rounded-2xl bg-sky-600 text-white shadow-2xl flex items-center justify-center text-3xl border-4 border-white dark:border-slate-800 active:scale-90 transition-all">📥</button>
      </div>
    </PageLayout>
  );
};

export default VouchersList;

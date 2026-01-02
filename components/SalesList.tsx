
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { Sale } from '../types';
import { formatSaleInvoice, shareToWhatsApp } from '../services/shareService';

const SalesList: React.FC = () => {
  const { sales, navigate, deleteSale, user, theme } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSales = useMemo(() => {
    return sales.filter(s => s.customer_name.includes(searchTerm) || s.qat_type.includes(searchTerm));
  }, [sales, searchTerm]);

  return (
    <PageLayout title="سجل المبيعات" onBack={() => navigate('dashboard')}>
      <div className="space-y-4 pt-2 page-enter pb-32">
        {/* Search Bar - Modern Rounded */}
        <div className="relative group">
          <input 
            type="text" placeholder="ابحث باسم العميل أو الصنف..."
            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-transparent focus:border-emerald-500 rounded-2xl p-4 pr-12 font-bold text-slate-900 dark:text-white shadow-sm"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
        </div>

        {/* Mobile-Friendly Cards */}
        <div className="grid grid-cols-1 gap-3">
          {filteredSales.map((sale) => (
            <div 
              key={sale.id} 
              className={`p-5 rounded-[1.8rem] border-2 transition-all active:scale-[0.98] ${
                theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">{sale.customer_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-lg border border-emerald-500/20">🌿 {sale.qat_type}</span>
                    <span className="text-[9px] font-bold text-slate-400 tabular-nums">📅 {new Date(sale.date).toLocaleDateString('ar-YE')}</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-sky-900 dark:text-emerald-400 tabular-nums tracking-tighter">{sale.total.toLocaleString()}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">YER</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex gap-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase">الكمية</span>
                    <span className="text-xs font-black">{sale.quantity} أكياس</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase">الحالة</span>
                    <span className={`text-xs font-black ${sale.status === 'نقدي' ? 'text-emerald-500' : 'text-orange-500'}`}>{sale.status}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => shareToWhatsApp(formatSaleInvoice(sale, user?.agency_name || 'وكالة الشويع'))} className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-200">💬</button>
                   <button onClick={() => navigate('invoice-view', { sale })} className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl flex items-center justify-center border border-slate-200">📄</button>
                   <button onClick={() => { if(window.confirm('حذف؟')) deleteSale(sale.id) }} className="w-10 h-10 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-xl flex items-center justify-center border border-rose-100">🗑️</button>
                </div>
              </div>
            </div>
          ))}
          {filteredSales.length === 0 && (
            <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
              <span className="text-6xl">📦</span>
              <p className="font-black">لا توجد مبيعات حالياً</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Action Button */}
      <button 
        onClick={() => navigate('add-sale')} 
        className="fixed bottom-24 left-6 w-16 h-16 rounded-2xl bg-sky-600 text-white shadow-2xl flex items-center justify-center text-4xl border-4 border-white dark:border-slate-800 z-40 active:scale-90 transition-all"
      >＋</button>
    </PageLayout>
  );
};

export default SalesList;

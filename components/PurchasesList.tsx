
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { Purchase } from '../types';

const PurchasesList: React.FC = () => {
  const { purchases, navigate, returnPurchase, theme } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => p.supplier_name.includes(searchTerm) || p.qat_type.includes(searchTerm));
  }, [purchases, searchTerm]);

  return (
    <PageLayout title="سجل التوريد" onBack={() => navigate('dashboard')}>
      <div className="space-y-4 pt-2 page-enter pb-32">
        <div className="relative group">
          <input 
            type="text" placeholder="ابحث باسم المورد أو الصنف..."
            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-transparent focus:border-orange-500 rounded-2xl p-4 pr-12 font-bold text-slate-900 dark:text-white shadow-sm"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredPurchases.map((purchase) => (
            <div 
              key={purchase.id} 
              className={`p-5 rounded-[1.8rem] border-2 transition-all active:scale-[0.98] ${
                theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl flex items-center justify-center text-xl">🚛</div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">{purchase.supplier_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[9px] font-black px-2 py-0.5 rounded-lg">🌿 {purchase.qat_type}</span>
                      <span className="text-[9px] font-bold text-slate-400 tabular-nums">{new Date(purchase.date).toLocaleDateString('ar-YE')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-orange-600 tabular-nums tracking-tighter">{purchase.total.toLocaleString()}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">YER</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex gap-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase">الكمية الموردة</span>
                    <span className="text-xs font-black">{purchase.quantity} أكياس</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase">حالة الدفع</span>
                    <span className={`text-xs font-black ${purchase.status === 'نقدي' ? 'text-emerald-500' : 'text-orange-500'}`}>{purchase.status}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                   {!purchase.is_returned && (
                     <button onClick={() => { if(window.confirm('إرجاع توريد؟')) returnPurchase(purchase.id) }} className="bg-rose-50 dark:bg-rose-900/30 text-rose-500 px-4 py-2 rounded-xl text-[10px] font-black border border-rose-100">🔄 مرتجع</button>
                   )}
                   {purchase.is_returned && <span className="text-[9px] font-black text-rose-500 uppercase italic">تم الإرجاع</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button 
        onClick={() => navigate('add-purchase')} 
        className="fixed bottom-24 left-6 w-16 h-16 rounded-2xl bg-orange-600 text-white shadow-2xl flex items-center justify-center text-4xl border-4 border-white dark:border-slate-800 z-40 active:scale-90 transition-all"
      >＋</button>
    </PageLayout>
  );
};

export default PurchasesList;

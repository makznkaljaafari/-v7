
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { Customer } from '../types';
import { financeService } from '../services/financeService';

const CustomersList: React.FC = () => {
  const { customers, sales, vouchers, navigate, theme } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter((c: Customer) => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.phone && c.phone.includes(searchTerm))
    );
  }, [customers, searchTerm]);

  return (
    <PageLayout title="دليل العملاء" onBack={() => navigate('dashboard')}>
      <div className="space-y-4 pt-2 page-enter pb-32">
        <div className="relative group">
          <input 
            type="text" placeholder="ابحث عن عميل..."
            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-transparent focus:border-indigo-500 rounded-2xl p-4 pr-12 font-bold text-slate-900 dark:text-white shadow-sm"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredCustomers.map((c) => {
            const debts = financeService.getCustomerBalances(c.id, sales, vouchers);
            const totalDebt = debts.find(d => d.currency === 'YER')?.amount || 0;
            return (
              <div 
                key={c.id} 
                className={`p-5 rounded-[2rem] border-2 transition-all active:scale-[0.98] ${
                  theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-sm shadow-indigo-900/5'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-xl text-white shadow-md">👤</div>
                    <div>
                      <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">{c.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5 tabular-nums">📱 {c.phone || 'بدون هاتف'}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className={`text-xl font-black tabular-nums tracking-tighter ${totalDebt > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {totalDebt.toLocaleString()}
                    </p>
                    <small className="text-[8px] font-black opacity-30 uppercase tracking-widest block text-left">YER</small>
                  </div>
                </div>

                <div className="flex gap-2 mt-5">
                   <button 
                     onClick={() => navigate('account-statement', { personId: c.id, personType: 'عميل' })} 
                     className="flex-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 py-3 rounded-xl font-black text-[10px] border border-emerald-500/20 flex items-center justify-center gap-2"
                   >
                     📑 كشف حساب مفصل
                   </button>
                   <button 
                     onClick={() => navigate('add-sale', { customerId: c.id })} 
                     className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-[10px] shadow-lg flex items-center justify-center gap-2"
                   >
                     💰 بيع جديد
                   </button>
                   <button 
                     onClick={() => navigate('add-voucher', { type: 'قبض', personId: c.id, personType: 'عميل', currency: 'YER' })} 
                     className="w-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-200 dark:border-white/10"
                   >
                     📥
                   </button>
                </div>
              </div>
            );
          })}
          {filteredCustomers.length === 0 && (
            <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
              <span className="text-6xl">👥</span>
              <p className="font-black">لا يوجد عملاء بهذا الاسم</p>
            </div>
          )}
        </div>
      </div>
      
      <button 
        onClick={() => navigate('add-customer')} 
        className="fixed bottom-24 right-6 w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-2xl flex items-center justify-center text-4xl border-4 border-white dark:border-slate-800 z-40 active:scale-90 transition-all"
      >👤＋</button>
    </PageLayout>
  );
};

export default CustomersList;


import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, formatSaleInvoice } from '../services/shareService';

const AddSale: React.FC = () => {
  const { customers, categories, addSale, navigate, navigationParams, addNotification, user, theme } = useApp();
  const [formData, setFormData] = useState({
    customer_id: navigationParams?.customerId || '',
    qat_type: navigationParams?.qatType || '',
    quantity: 1,
    unit_price: 0,
    status: 'نقدي' as 'نقدي' | 'آجل',
    currency: 'YER' as 'YER' | 'SAR' | 'OMR',
    notes: ''
  });
  
  const [shareAfterSave, setShareAfterSave] = useState(true);

  useEffect(() => {
    if (!formData.qat_type && categories.length > 0) {
      setFormData(prev => ({ ...prev, qat_type: categories[0].name }));
    }
  }, [categories, formData.qat_type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === formData.customer_id);
    if (!customer) { addNotification("تنبيه ⚠️", "يرجى اختيار العميل أولاً", "warning"); return; }
    if (formData.unit_price <= 0) { addNotification("خطأ ⚠️", "يرجى إدخال سعر البيع", "warning"); return; }

    const total = formData.quantity * formData.unit_price;
    const saleData = { ...formData, customer_name: customer.name, total, date: new Date().toISOString() };
    await addSale(saleData);
    if (shareAfterSave) shareToWhatsApp(formatSaleInvoice(saleData as any, user?.agency_name || 'وكالة الشويع'), customer.phone);
    navigate('sales');
  };

  return (
    <PageLayout title="فاتورة بيع" onBack={() => navigate('sales')}>
      <form onSubmit={handleSubmit} className="space-y-4 page-enter pb-32 max-w-lg mx-auto">
        
        {/* Customer & Qat Type Selection */}
        <div className={`p-6 rounded-[2rem] border-2 space-y-4 ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">العميل</label>
            <select 
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-slate-900 dark:text-white border-none outline-none"
              value={formData.customer_id}
              onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
              required
            >
              <option value="">-- اختر العميل --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">نوع القات</label>
            <select 
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-slate-900 dark:text-white border-none outline-none"
              value={formData.qat_type}
              onChange={e => setFormData({ ...formData, qat_type: e.target.value })}
              required
            >
              <option value="">-- اختر النوع --</option>
              {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
          </div>
        </div>

        {/* Currency & Status Selectors */}
        <div className="grid grid-cols-2 gap-2">
           <div className={`p-1.5 rounded-2xl flex border-2 ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
              {['YER', 'SAR'].map(cur => (
                <button
                  key={cur} type="button"
                  onClick={() => setFormData({...formData, currency: cur as any})}
                  className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${formData.currency === cur ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400'}`}
                >
                  {cur}
                </button>
              ))}
           </div>
           <div className={`p-1.5 rounded-2xl flex border-2 ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
              {['نقدي', 'آجل'].map(s => (
                <button
                  key={s} type="button"
                  onClick={() => setFormData({...formData, status: s as any})}
                  className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${formData.status === s ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}
                >
                  {s}
                </button>
              ))}
           </div>
        </div>

        {/* Quantity Controller */}
        <div className={`p-6 rounded-[2rem] border-2 text-center ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">الكمية (أكياس)</label>
          <div className="flex items-center justify-between max-w-[200px] mx-auto">
            <button type="button" onClick={() => setFormData(p => ({...p, quantity: Math.max(1, p.quantity-1)}))} className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl text-xl font-black">－</button>
            <span className="text-4xl font-black tabular-nums">{formData.quantity}</span>
            <button type="button" onClick={() => setFormData(p => ({...p, quantity: p.quantity+1}))} className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 text-sky-600 rounded-xl text-xl font-black">＋</button>
          </div>
        </div>

        {/* Price Input - Main Focus */}
        <div className={`p-6 rounded-[2rem] border-2 ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-center">سعر الكيس ({formData.currency})</label>
          <input 
            type="number" 
            className="w-full bg-transparent text-center font-black text-5xl outline-none text-sky-900 dark:text-emerald-400 tabular-nums border-b-2 border-slate-100 dark:border-white/5 pb-4" 
            value={formData.unit_price || ''} 
            placeholder="0" 
            onChange={e => setFormData({ ...formData, unit_price: parseInt(e.target.value) || 0 })} 
          />
        </div>

        {/* Final Submission Card */}
        <div className={`p-6 rounded-[2.5rem] border-2 flex flex-col items-center gap-4 ${theme === 'dark' ? 'bg-emerald-600 text-white border-transparent' : 'bg-slate-900 text-white border-transparent shadow-xl shadow-sky-900/20'}`}>
           <div className="text-center">
              <p className="text-[9px] font-black uppercase opacity-60 tracking-[0.2em] mb-1">الإجمالي المستحق</p>
              <h2 className="text-4xl font-black tabular-nums">{(formData.quantity * formData.unit_price).toLocaleString()} <small className="text-xs">{formData.currency}</small></h2>
           </div>
           <button type="submit" className="w-full bg-white text-slate-900 p-5 rounded-2xl font-black text-lg active:scale-95 transition-all shadow-lg">حفظ ومشاركة الفاتورة ✅</button>
        </div>
      </form>
    </PageLayout>
  );
};

export default AddSale;

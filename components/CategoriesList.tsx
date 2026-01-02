
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { QatCategory } from '../types';

const CategoriesList: React.FC = () => {
  const { categories, navigate, deleteCategory, addNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [categories, searchTerm]);

  const handleDelete = async (cat: QatCategory) => {
    if (window.confirm(`هل أنت متأكد من حذف صنف "${cat.name}"؟`)) {
      try {
        await deleteCategory(cat.id);
        addNotification("تم الحذف 🗑️", `تم حذف صنف ${cat.name}.`, "success");
      } catch (err: any) { addNotification("عذراً ⚠️", "لا يمكن الحذف لوجود عمليات مرتبطة.", "warning"); }
    }
  };

  return (
    <PageLayout title="جرد ومخازن القات" onBack={() => navigate('dashboard')} headerGradient="from-teal-700 to-emerald-900">
      <div className="space-y-6 pt-4 page-enter pb-44">
        
        <div className="relative px-1 max-w-xl mx-auto w-full">
          <input 
            type="text" placeholder="ابحث عن صنف في المخازن..."
            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-white/5 focus:border-emerald-500 rounded-2xl p-4 pr-12 outline-none transition-all font-black shadow-lg text-slate-800 dark:text-white"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 opacity-30 text-xl">🔍</span>
        </div>

        {/* جدول جرد الأصناف الشبكي (Desktop) */}
        <div className="overflow-hidden rounded-[2.5rem] shadow-2xl border-2 border-teal-100 dark:border-teal-900/30 bg-white dark:bg-slate-950">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gradient-to-l from-emerald-700 to-emerald-900 text-white">
                  <th className="p-5 border-r border-white/20 font-black text-xs text-center w-16">#</th>
                  <th className="p-5 border-r border-white/20 font-black text-xs">نوع القات (الصنف)</th>
                  <th className="p-5 border-r border-white/20 font-black text-xs text-center">الرصيد (كيس)</th>
                  <th className="p-5 border-r border-white/20 font-black text-xs text-center">السعر الافتراضي</th>
                  <th className="p-5 border-r border-white/20 font-black text-xs text-center">حالة المخزون</th>
                  <th className="p-5 font-black text-xs text-center">إدارة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-100 dark:divide-teal-900/20">
                {filteredCategories.map((cat, idx) => (
                  <tr key={cat.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10 transition-colors">
                    <td className="p-5 border-r border-teal-100 dark:border-teal-900/20 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-5 border-r border-teal-100 dark:border-teal-900/20 font-black text-slate-900 dark:text-white text-lg">🌿 {cat.name}</td>
                    <td className="p-5 border-r border-teal-100 dark:border-teal-900/20 text-center">
                      <p className={`text-3xl font-black tabular-nums ${cat.stock < 5 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {cat.stock}
                      </p>
                    </td>
                    <td className="p-5 border-r border-teal-100 dark:border-teal-900/20 text-center font-black tabular-nums text-slate-500">
                      {cat.price.toLocaleString()} <small className="text-[10px] uppercase">{cat.currency}</small>
                    </td>
                    <td className="p-5 border-r border-teal-100 dark:border-teal-900/20 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${cat.stock < 5 ? 'bg-rose-100 text-rose-600 border border-rose-200 animate-pulse' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                        {cat.stock < 5 ? 'مخزون حرج ⚠️' : 'متوفر ومستقر ✅'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => navigate('add-sale', { qatType: cat.name })} className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] shadow-md hover:bg-emerald-500 transition-all">💰 بيع من الصنف</button>
                        <button onClick={() => navigate('add-category', { categoryId: cat.id })} className="p-2 bg-slate-100 text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-900 hover:text-white transition-all">📝</button>
                        <button onClick={() => handleDelete(cat)} className="p-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-200 hover:bg-rose-600 hover:text-white transition-all">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredCategories.length === 0 && <div className="p-24 text-center opacity-30 font-black text-xl">المخزن فارغ حالياً</div>}
        </div>
      </div>
      
      <button onClick={() => navigate('add-category')} className="fixed bottom-32 left-6 lg:bottom-12 lg:left-12 w-16 h-16 bg-emerald-600 text-white rounded-2xl shadow-2xl flex items-center justify-center text-4xl border-4 border-white z-40 active:scale-90 transition-transform">＋</button>
    </PageLayout>
  );
};

export default CategoriesList;

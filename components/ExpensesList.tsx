
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { Expense } from '../types';

const ExpensesList: React.FC = () => {
  const { expenses, expenseTemplates, navigate, updateExpense, addExpense } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Expense>>({});

  const filteredExpenses = expenses.filter(e => e.title.includes(searchTerm) || e.category.includes(searchTerm));

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditForm(expense);
  };

  const saveEdit = () => {
    if (editingId && editForm.title && editForm.amount) {
      updateExpense(editingId, editForm);
      setEditingId(null);
    }
  };

  return (
    <PageLayout title="سجل المصروفات" onBack={() => navigate('dashboard')} headerGradient="from-amber-600 to-orange-700">
      <div className="space-y-8 pt-4 page-enter pb-40">
        
        {/* المصاريف المتكررة */}
        <section className="space-y-4 px-1">
          <h3 className="font-black text-lg text-amber-900 dark:text-amber-400 flex items-center gap-2"><span>🔁</span> المصاريف المتكررة</h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {expenseTemplates.map(template => (
              <div key={template.id} className="flex-shrink-0 bg-white dark:bg-slate-900 p-5 rounded-3xl border-2 border-amber-100 dark:border-slate-800 shadow-sm w-52 flex flex-col justify-between">
                <div>
                   <p className="font-black text-slate-800 dark:text-white truncate text-sm">{template.title}</p>
                   <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-lg text-[8px] font-black">{template.frequency}</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-black text-amber-600 tabular-nums">{template.amount.toLocaleString()}</span>
                  <button onClick={() => addExpense({ title: template.title, category: template.category, amount: template.amount, currency: template.currency, notes: `تكرار ${template.frequency}` })} className="w-8 h-8 bg-amber-600 text-white rounded-lg flex items-center justify-center font-black">＋</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* البحث */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <input 
            type="text" placeholder="ابحث في المصروفات..."
            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-500 rounded-2xl p-4 font-black outline-none transition-all"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* جدول المصروفات الشامل (Desktop) */}
        <div className="overflow-x-auto rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gradient-to-l from-amber-600 to-amber-800 text-white">
                <th className="p-5 border-l border-white/10 font-black text-xs text-center w-16">#</th>
                <th className="p-5 border-l border-white/10 font-black text-xs">التاريخ</th>
                <th className="p-5 border-l border-white/10 font-black text-xs">بيان المصروف</th>
                <th className="p-5 border-l border-white/10 font-black text-xs">الفئة</th>
                <th className="p-5 border-l border-white/10 font-black text-xs text-center">المبلغ</th>
                <th className="p-5 border-l border-white/10 font-black text-xs text-center">العملة</th>
                <th className="p-5 font-black text-xs text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.map((e, idx) => {
                const isEditing = editingId === e.id;
                return (
                  <tr key={e.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="p-5 border-l border-slate-100 dark:border-slate-800 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-5 border-l border-slate-100 dark:border-slate-800 font-bold text-xs tabular-nums text-slate-500">{new Date(e.date).toLocaleDateString('ar-YE')}</td>
                    <td className="p-5 border-l border-slate-100 dark:border-slate-800">
                      {isEditing ? <input className="w-full bg-white dark:bg-slate-700 border border-amber-500 rounded p-2 font-black text-xs" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} /> : <p className="font-black text-slate-900 dark:text-white">{e.title}</p>}
                    </td>
                    <td className="p-5 border-l border-slate-100 dark:border-slate-800">
                      <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-xl text-[10px] font-black border border-amber-100 dark:border-amber-800/50">{e.category}</span>
                    </td>
                    <td className="p-5 border-l border-slate-100 dark:border-slate-800 text-center">
                      {isEditing ? <input type="number" className="w-24 bg-white dark:bg-slate-700 border border-amber-500 rounded p-2 font-black text-center text-xs" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: parseInt(e.target.value) || 0})} /> : <p className="font-black text-xl tabular-nums text-amber-600">{e.amount.toLocaleString()}</p>}
                    </td>
                    <td className="p-5 border-l border-slate-100 dark:border-slate-800 text-center font-black text-slate-400">{e.currency}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center">
                        {isEditing ? <button onClick={saveEdit} className="px-4 py-2 bg-green-600 text-white rounded-xl font-black text-xs shadow-md">حفظ ✅</button> : <button onClick={() => handleEdit(e)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">📝</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredExpenses.length === 0 && <div className="p-20 text-center opacity-30 font-black">لا توجد مصروفات مسجلة</div>}
        </div>

        <button onClick={() => navigate('add-expense')} className="fixed bottom-32 left-6 lg:bottom-12 lg:left-12 w-16 h-16 bg-amber-600 text-white rounded-2xl shadow-2xl flex items-center justify-center text-3xl border-4 border-white z-40">＋</button>
      </div>
    </PageLayout>
  );
};

export default ExpensesList;

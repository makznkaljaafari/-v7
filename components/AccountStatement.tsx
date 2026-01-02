
import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp } from '../services/shareService';

const AccountStatement: React.FC = () => {
  const { 
    navigationParams, navigate, sales, purchases, vouchers, 
    customers, suppliers, theme, user 
  } = useApp();
  
  const personId = navigationParams?.personId;
  const personType = navigationParams?.personType; // 'عميل' | 'مورد'
  const [selectedCurrency, setSelectedCurrency] = useState<'YER' | 'SAR' | 'OMR'>('YER');

  const person = useMemo(() => {
    if (personType === 'عميل') return customers.find(c => c.id === personId);
    return suppliers.find(s => s.id === personId);
  }, [personId, personType, customers, suppliers]);

  // تجميع كافة العمليات وتنسيقها
  const statementData = useMemo(() => {
    if (!person) return [];

    let transactions: any[] = [];

    if (personType === 'عميل') {
      // مبيعات العميل
      const customerSales = sales.filter(s => s.customer_id === personId && s.currency === selectedCurrency && !s.is_returned);
      customerSales.forEach(s => {
        transactions.push({
          date: s.date,
          type: 'فاتورة بيع',
          details: `بيع ${s.qat_type} (${s.quantity} كيس)`,
          debit: s.status === 'آجل' ? s.total : 0, // مدين (عليه) في حال الآجل
          credit: s.status === 'نقدي' ? s.total : 0, // دائن (دفع) في حال النقدي
          reference: s
        });
        // إذا كانت الفاتورة نقداً، نعتبرها قبضت فوراً
        if (s.status === 'نقدي') {
            // هي مسجلة كدائن بالفعل فوق لتبسيط الحساب
        }
      });

      // سندات القبض من العميل
      const customerVouchers = vouchers.filter(v => v.person_id === personId && v.person_type === 'عميل' && v.type === 'قبض' && v.currency === selectedCurrency);
      customerVouchers.forEach(v => {
        transactions.push({
          date: v.date,
          type: 'سند قبض',
          details: v.notes || 'استلام نقدي',
          debit: 0,
          credit: v.amount, // دائن (لنا عنده أقل)
          reference: v
        });
      });
    } else {
      // مشتريات من مورد
      const supplierPurchases = purchases.filter(p => p.supplier_id === personId && p.currency === selectedCurrency && !p.is_returned);
      supplierPurchases.forEach(p => {
        transactions.push({
          date: p.date,
          type: 'توريد قات',
          details: `شراء ${p.qat_type} (${p.quantity} كيس)`,
          debit: p.status === 'نقدي' ? p.total : 0, // مدين (دفعنا له)
          credit: p.status === 'آجل' ? p.total : 0, // دائن (له عندنا)
          reference: p
        });
      });

      // سندات الدفع للمورد
      const supplierVouchers = vouchers.filter(v => v.person_id === personId && v.person_type === 'مورد' && v.type === 'دفع' && v.currency === selectedCurrency);
      supplierVouchers.forEach(v => {
        transactions.push({
          date: v.date,
          type: 'سند دفع',
          details: v.notes || 'تسديد نقدي',
          debit: v.amount, // مدين (أعطيناه)
          credit: 0,
          reference: v
        });
      });
    }

    // ترتيب حسب التاريخ تصاعدياً لحساب الرصيد
    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // حساب الرصيد التراكمي
    let runningBalance = 0;
    const finalData = transactions.map(t => {
      // في المحاسبة: الرصيد = الدائن - المدين (أو العكس حسب طبيعة الحساب)
      // للعميل: الرصيد = المدين (المبيعات) - الدائن (القبض)
      // للمورد: الرصيد = الدائن (المشتريات) - المدين (الدفع)
      if (personType === 'عميل') {
        runningBalance += (t.debit - t.credit);
      } else {
        runningBalance += (t.credit - t.debit);
      }
      return { ...t, balance: runningBalance };
    });

    return finalData.reverse(); // عرض الأحدث فوق
  }, [person, personId, personType, sales, purchases, vouchers, selectedCurrency]);

  const handleShare = () => {
    if (!person) return;
    
    let text = `*📊 كشف حساب ${personType}: ${person.name}*\n`;
    text += `*🏢 ${user?.agency_name || 'وكالة الشويع'}*\n`;
    text += `*💰 العملة: ${selectedCurrency}*\n`;
    text += `--------------------------------\n`;
    text += `التاريخ | البيان | الرصيد\n`;
    text += `--------------------------------\n`;
    
    statementData.slice(0, 15).forEach(row => {
      text += `📅 ${new Date(row.date).toLocaleDateString('ar-YE')} | ${row.details} | *${row.balance.toLocaleString()}*\n`;
    });
    
    const finalBalance = statementData[0]?.balance || 0;
    text += `--------------------------------\n`;
    text += `*⚠️ الرصيد النهائي المستحق: ${finalBalance.toLocaleString()} ${selectedCurrency}*\n`;
    text += `--------------------------------\n`;
    text += `✅ تم التوليد آلياً من نظام الشويع الذكي`;

    shareToWhatsApp(text, person.phone);
  };

  if (!person) return <PageLayout title="خطأ" onBack={() => navigate('dashboard')}><p>العميل/المورد غير موجود</p></PageLayout>;

  return (
    <PageLayout 
      title={`كشف حساب: ${person.name}`} 
      onBack={() => navigate(personType === 'عميل' ? 'customers' : 'suppliers')}
      headerExtra={
        <button onClick={handleShare} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-xl font-black text-xs shadow-lg active:scale-95 transition-all">
          مشاركة واتساب 💬
        </button>
      }
    >
      <div className="space-y-6 pt-2 page-enter pb-44">
        
        {/* Currency Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-1">
          {['YER', 'SAR', 'OMR'].map((cur) => (
            <button
              key={cur}
              onClick={() => setSelectedCurrency(cur as any)}
              className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${
                selectedCurrency === cur 
                  ? 'bg-sky-600 text-white shadow-md' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {cur}
            </button>
          ))}
        </div>

        {/* Financial Summary Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
           <div className="relative z-10 flex justify-between items-center">
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">إجمالي الرصيد الحالي ({selectedCurrency})</p>
                 <h2 className={`text-5xl font-black tabular-nums tracking-tighter ${
                   (statementData[0]?.balance || 0) > 0 ? 'text-rose-500' : 'text-emerald-500'
                 }`}>
                   {(statementData[0]?.balance || 0).toLocaleString()}
                 </h2>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-white/10">
                 📊
              </div>
           </div>
        </div>

        {/* Excel-Style Table */}
        <div className="bg-white dark:bg-slate-950 rounded-[2rem] shadow-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800">
           <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-right border-collapse">
                 <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b-2 border-slate-200 dark:border-slate-800">
                       <th className="p-5 font-black text-[10px] uppercase border-l border-slate-200 dark:border-slate-800 w-24">التاريخ</th>
                       <th className="p-5 font-black text-[10px] uppercase border-l border-slate-200 dark:border-slate-800">النوع / البيان</th>
                       <th className="p-5 font-black text-[10px] uppercase border-l border-slate-200 dark:border-slate-800 text-center">مدين</th>
                       <th className="p-5 font-black text-[10px] uppercase border-l border-slate-200 dark:border-slate-800 text-center">دائن</th>
                       <th className="p-5 font-black text-[10px] uppercase text-center bg-slate-200/50 dark:bg-slate-800/50">الرصيد</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {statementData.map((row, idx) => (
                       <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/30 dark:bg-slate-900/10'} hover:bg-sky-50/50 dark:hover:bg-sky-900/10 transition-colors`}>
                          <td className="p-5 border-l border-slate-100 dark:border-slate-800">
                             <p className="text-[10px] font-black tabular-nums">{new Date(row.date).toLocaleDateString('ar-YE')}</p>
                          </td>
                          <td className="p-5 border-l border-slate-100 dark:border-slate-800">
                             <p className="font-bold text-xs text-slate-800 dark:text-white">{row.type}</p>
                             <p className="text-[10px] text-slate-400 mt-1">{row.details}</p>
                          </td>
                          <td className={`p-5 border-l border-slate-100 dark:border-slate-800 text-center font-black tabular-nums ${row.debit > 0 ? 'text-rose-500 bg-rose-50/30 dark:bg-rose-900/5' : 'text-slate-300 dark:text-slate-700'}`}>
                             {row.debit > 0 ? row.debit.toLocaleString() : '-'}
                          </td>
                          <td className={`p-5 border-l border-slate-100 dark:border-slate-800 text-center font-black tabular-nums ${row.credit > 0 ? 'text-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/5' : 'text-slate-300 dark:text-slate-700'}`}>
                             {row.credit > 0 ? row.credit.toLocaleString() : '-'}
                          </td>
                          <td className={`p-5 text-center font-black tabular-nums bg-slate-100/30 dark:bg-slate-800/20 ${row.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                             {row.balance.toLocaleString()}
                          </td>
                       </tr>
                    ))}
                    {statementData.length === 0 && (
                       <tr>
                          <td colSpan={5} className="p-20 text-center opacity-30 font-black italic">لا توجد تحركات مالية مسجلة لهذه العملة</td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Excel Instructions Overlay */}
        <div className="bg-blue-50 dark:bg-sky-900/10 p-5 rounded-[2rem] border-2 border-dashed border-blue-100 dark:border-sky-800/30 flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl shadow-lg">ℹ️</div>
           <p className="text-[10px] font-bold text-blue-800 dark:text-sky-300 leading-relaxed">
             هذا الكشف محسوب برمجياً بناءً على كافة الفواتير والسندات المسجلة. اللون الأحمر يشير للمبالغ المستحقة (مدين)، والأخضر للمبالغ المسددة (دائن).
           </p>
        </div>

      </div>
    </PageLayout>
  );
};

export default AccountStatement;

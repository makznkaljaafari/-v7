
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { dataService } from '../services/dataService';
import { ActivityLog } from '../types';

const ActivityLogPage: React.FC = () => {
  const { navigate } = useApp();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const data = await dataService.getActivityLogs();
      setLogs(data);
      setIsLoading(false);
    };
    fetchLogs();
  }, []);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'sale': return '💰';
      case 'purchase': return '📦';
      case 'voucher': return '📥';
      case 'waste': return '🥀';
      default: return '🛡️';
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'sale': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case 'purchase': return 'text-orange-500 bg-orange-50 border-orange-100';
      case 'voucher': return 'text-indigo-500 bg-indigo-50 border-indigo-100';
      case 'waste': return 'text-rose-500 bg-rose-50 border-rose-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  return (
    <PageLayout title="سجل الرقابة والعمليات السحابية" onBack={() => navigate('dashboard')} headerGradient="from-slate-800 to-slate-950">
      <div className="space-y-6 pt-4 page-enter pb-32">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-[2rem] border-2 border-dashed border-emerald-200 dark:border-emerald-800/30">
           <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 leading-relaxed">🛡️ يتم أرشفة كافة التحركات المالية وحذف السجلات وتوثيق المرتجعات آلياً بنظام البصمة الزمنية لضمان أعلى مستويات الرقابة المالية.</p>
        </div>

        {/* جدول النشاطات الرقابي الشبكي (Desktop) */}
        <div className="overflow-hidden rounded-[2.5rem] shadow-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gradient-to-l from-slate-700 to-slate-900 text-white">
                  <th className="p-5 border-r border-white/20 font-black text-xs text-center w-16">#</th>
                  <th className="p-5 border-r border-white/20 font-black text-xs text-center w-24">النوع</th>
                  <th className="p-5 border-r border-white/20 font-black text-xs">الوقت والتاريخ</th>
                  <th className="p-5 border-r border-white/20 font-black text-xs">النشاط المنفذ</th>
                  <th className="p-5 font-black text-xs">التفاصيل التقنية للعملية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-24 text-center"><div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                ) : logs.map((log, idx) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-5 border-r border-slate-100 dark:border-slate-800 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-5 border-r border-slate-100 dark:border-slate-800 text-center">
                      <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-inner border ${getTypeColor(log.type)}`}>
                        {getTypeIcon(log.type)}
                      </span>
                    </td>
                    <td className="p-5 border-r border-slate-100 dark:border-slate-800">
                      <p className="font-black text-sm text-slate-900 dark:text-white tabular-nums">{new Date(log.timestamp).toLocaleTimeString('ar-YE')}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase italic">{new Date(log.timestamp).toLocaleDateString('ar-YE')}</p>
                    </td>
                    <td className="p-5 border-r border-slate-100 dark:border-slate-800 font-black text-slate-900 dark:text-white text-base">{log.action}</td>
                    <td className="p-5 font-bold text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg italic">{log.details}</td>
                  </tr>
                ))}
                {!isLoading && logs.length === 0 && <tr><td colSpan={5} className="p-24 text-center opacity-30 font-black text-xl italic">لا توجد تحركات مسجلة في السجل السحابي</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ActivityLogPage;

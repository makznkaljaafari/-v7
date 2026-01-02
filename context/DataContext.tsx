
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Customer, Supplier, Sale, Purchase, Voucher, QatCategory, Expense, Waste, ActivityLog, ExpenseTemplate, ExchangeRates } from '../types';
import { dataService } from '../services/dataService';
import { supabase } from '../services/supabaseClient';
import { useUI } from './UIContext';
import { useAuth } from './AuthContext';
import { logger } from '../services/loggerService';
import { z } from 'zod';

const DataContext = createContext<any>(undefined);

const STORAGE_KEYS = {
  CUSTOMERS: 'offline_customers',
  SUPPLIERS: 'offline_suppliers',
  SALES: 'offline_sales',
  PURCHASES: 'offline_purchases',
  VOUCHERS: 'offline_vouchers',
  CATEGORIES: 'offline_categories',
  EXPENSES: 'offline_expenses',
  WASTE: 'offline_waste',
  EXCHANGE_RATES: 'offline_rates',
  TEMPLATES: 'offline_templates'
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification, setNotifications, triggerFeedback } = useUI();
  const { user, setUser } = useAuth();
  
  const getInitialData = (key: string, fallback: any) => {
    const saved = localStorage.getItem(key);
    try { return saved ? JSON.parse(saved) : fallback; } catch (e) { return fallback; }
  };

  const [customers, setCustomers] = useState<Customer[]>(() => getInitialData(STORAGE_KEYS.CUSTOMERS, []));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getInitialData(STORAGE_KEYS.SUPPLIERS, []));
  const [sales, setSales] = useState<Sale[]>(() => getInitialData(STORAGE_KEYS.SALES, []));
  const [purchases, setPurchases] = useState<Purchase[]>(() => getInitialData(STORAGE_KEYS.PURCHASES, []));
  const [vouchers, setVouchers] = useState<Voucher[]>(() => getInitialData(STORAGE_KEYS.VOUCHERS, []));
  const [categories, setCategories] = useState<QatCategory[]>(() => getInitialData(STORAGE_KEYS.CATEGORIES, []));
  const [expenses, setExpenses] = useState<Expense[]>(() => getInitialData(STORAGE_KEYS.EXPENSES, []));
  const [expenseCategories, setExpenseCategories] = useState<string[]>(['نثرية', 'كهرباء', 'إيجار', 'غداء', 'حوافز']);
  const [expenseTemplates, setExpenseTemplates] = useState<ExpenseTemplate[]>(() => getInitialData(STORAGE_KEYS.TEMPLATES, []));
  const [wasteRecords, setWasteRecords] = useState<Waste[]>(() => getInitialData(STORAGE_KEYS.WASTE, []));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(() => getInitialData(STORAGE_KEYS.EXCHANGE_RATES, { SAR_TO_YER: 430, OMR_TO_YER: 425 }));

  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // حفظ البيانات للأوفلاين بشكل تلقائي عند التغيير
  useEffect(() => {
    const data = {
      [STORAGE_KEYS.CUSTOMERS]: customers, [STORAGE_KEYS.SUPPLIERS]: suppliers,
      [STORAGE_KEYS.SALES]: sales, [STORAGE_KEYS.PURCHASES]: purchases,
      [STORAGE_KEYS.VOUCHERS]: vouchers, [STORAGE_KEYS.CATEGORIES]: categories,
      [STORAGE_KEYS.EXPENSES]: expenses, [STORAGE_KEYS.WASTE]: wasteRecords,
      [STORAGE_KEYS.TEMPLATES]: expenseTemplates, [STORAGE_KEYS.EXCHANGE_RATES]: exchangeRates
    };
    Object.entries(data).forEach(([key, val]) => {
      localStorage.setItem(key, JSON.stringify(val));
    });
  }, [customers, suppliers, sales, purchases, vouchers, categories, expenses, wasteRecords, expenseTemplates, exchangeRates]);

  // دالة موحدة لمعالجة أخطاء التحقق Zod
  const handleValidationError = useCallback((error: any) => {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]?.message || "خطأ في صحة البيانات";
      addNotification("خطأ في البيانات ⚠️", firstError, "warning");
    } else {
      logger.error("خطأ غير متوقع:", error);
    }
  }, [addNotification]);

  const loadAllData = useCallback(async (userId: string) => {
    if (!userId || isLoading) return;
    setIsLoading(true);
    try {
      await dataService.ensureUserExists(userId);
      const results = await Promise.allSettled([
        dataService.getFullProfile(userId), dataService.getCustomers(), dataService.getSuppliers(),
        dataService.getSales(), dataService.getPurchases(), dataService.getVouchers(),
        dataService.getCategories(), dataService.getExpenses(), dataService.getActivityLogs(),
        dataService.getWaste(), dataService.getNotifications(), dataService.getExpenseTemplates()
      ]);

      const [p, c, s, sl, pr, v, cat, ex, logs, wst, ntf, tmp] = results;

      if (p.status === 'fulfilled' && p.value) {
        setUser(p.value);
        if (p.value.exchange_rates) setExchangeRates(p.value.exchange_rates);
      }
      
      if (c.status === 'fulfilled') setCustomers(c.value);
      if (s.status === 'fulfilled') setSuppliers(s.value);
      if (sl.status === 'fulfilled') setSales(sl.value);
      if (pr.status === 'fulfilled') setPurchases(pr.value);
      if (v.status === 'fulfilled') setVouchers(v.value);
      if (cat.status === 'fulfilled') setCategories(cat.value);
      if (ex.status === 'fulfilled') setExpenses(ex.value);
      if (logs.status === 'fulfilled') setActivityLogs(logs.value);
      if (wst.status === 'fulfilled') setWasteRecords(wst.value);
      if (ntf.status === 'fulfilled') setNotifications(ntf.value);
      if (tmp.status === 'fulfilled') setExpenseTemplates(tmp.value);
      
      setConnectionError(null);
    } catch (e: any) {
      logger.error("Error loading data:", e);
      setConnectionError("وضع الأوفلاين نشط 📡 - جاري عرض البيانات المخزنة محلياً");
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setNotifications, isLoading]);

  const deleteRecord = useCallback(async (table: string, id: string) => {
    try {
      setIsLoading(true);
      await dataService.deleteRecord(table, id);
      const setters: any = {
        sales: setSales, vouchers: setVouchers, expenses: setExpenses, 
        customers: setCustomers, suppliers: setSuppliers, categories: setCategories,
        purchases: setPurchases, waste: setWasteRecords
      };
      if (setters[table]) setters[table]((prev: any[]) => prev.filter(i => i.id !== id));
      addNotification("تم الحذف بنجاح ✅", "تم تحديث السجلات بنجاح.", "success");
    } catch (e: any) { 
      addNotification("فشل الحذف ⚠️", "عذراً، تعذر حذف السجل حالياً.", "warning"); 
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const updateRecord = useCallback(async (table: string, id: string, updates: any) => {
    try {
      setIsLoading(true);
      await dataService.updateRecord(table, id, updates);
      const setters: any = {
        sales: setSales, vouchers: setVouchers, expenses: setExpenses, 
        customers: setCustomers, suppliers: setSuppliers, categories: setCategories,
        purchases: setPurchases, waste: setWasteRecords
      };
      if (setters[table]) setters[table]((prev: any[]) => prev.map(i => i.id === id ? { ...i, ...updates } : i));
      addNotification("تم التحديث ✅", "تم حفظ التعديلات بنجاح.", "success");
    } catch (e: any) {
      addNotification("فشل التحديث ⚠️", "تعذر حفظ التعديلات.", "warning");
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  // الإجراءات المالية
  const addSale = useCallback(async (s: any) => {
    try { 
      setIsLoading(true);
      const saved = await dataService.saveSale(s); 
      setSales(prev => [saved, ...prev]); 
      setCategories(prev => prev.map(cat => cat.name === s.qat_type ? { ...cat, stock: Math.max(0, Number(cat.stock) - Number(s.quantity)) } : cat));
      addNotification("تم البيع ✅", "تم الحفظ وخصم الكمية من المخزون.", "success"); 
      s.status === 'نقدي' ? triggerFeedback('celebration') : triggerFeedback('debt');
    } catch (e) { handleValidationError(e); } finally { setIsLoading(false); }
  }, [addNotification, triggerFeedback, handleValidationError]);

  const addPurchase = useCallback(async (p: any) => {
    try {
      setIsLoading(true);
      const saved = await dataService.savePurchase(p);
      setPurchases(prev => [saved, ...prev]);
      setCategories(prev => prev.map(cat => cat.name === p.qat_type ? { ...cat, stock: Number(cat.stock) + Number(p.quantity) } : cat));
      addNotification("تم التوريد ✅", "تمت إضافة الكمية للمخزون.", "success");
    } catch (e) { handleValidationError(e); } finally { setIsLoading(false); }
  }, [addNotification, handleValidationError]);

  const addVoucher = useCallback(async (v: any) => {
    try { 
      setIsLoading(true);
      const saved = await dataService.saveVoucher(v); 
      setVouchers(prev => [saved, ...prev]);
      addNotification("سند جديد ✅", "تم توثيق السند بنجاح.", "success"); 
      if (v.type === 'قبض') triggerFeedback('celebration');
    } catch (e) { handleValidationError(e); } finally { setIsLoading(false); }
  }, [addNotification, triggerFeedback, handleValidationError]);

  const addCustomer = useCallback(async (c: any) => {
    try {
      const saved = await dataService.saveCustomer(c);
      setCustomers(prev => [saved, ...prev]);
      return saved;
    } catch (e) { handleValidationError(e); throw e; }
  }, [handleValidationError]);

  const addSupplier = useCallback(async (s: any) => {
    try {
      const saved = await dataService.saveSupplier(s);
      setSuppliers(prev => [saved, ...prev]);
      return saved;
    } catch (e) { handleValidationError(e); throw e; }
  }, [handleValidationError]);

  const addCategory = useCallback(async (cat: any) => {
    try {
      const saved = await dataService.saveCategory(cat);
      setCategories(prev => {
        const idx = prev.findIndex(p => p.id === saved.id);
        return idx > -1 ? prev.map(p => p.id === saved.id ? saved : p) : [saved, ...prev];
      });
      return saved;
    } catch (e) { handleValidationError(e); throw e; }
  }, [handleValidationError]);

  const addExpense = useCallback(async (e: any) => {
    try { 
      setIsLoading(true);
      const saved = await dataService.saveExpense(e); 
      setExpenses(prev => [saved, ...prev]);
      addNotification("مصروف جديد ✅", "تم تسجيل المصروف.", "success"); 
    } catch (err) { handleValidationError(err); } finally { setIsLoading(false); }
  }, [addNotification, handleValidationError]);

  const addWaste = useCallback(async (w: any) => {
    try {
      setIsLoading(true);
      const saved = await dataService.saveWaste(w);
      setWasteRecords(prev => [saved, ...prev]);
      setCategories(prev => prev.map(cat => cat.name === w.qat_type ? { ...cat, stock: Math.max(0, Number(cat.stock) - Number(w.quantity)) } : cat));
      addNotification("تسجيل تالف 🥀", "تم خصم الكمية من المخزون.", "warning");
    } catch (e) { handleValidationError(e); } finally { setIsLoading(false); }
  }, [addNotification, handleValidationError]);

  const updateExchangeRates = useCallback(async (rates: any) => {
    setExchangeRates(rates);
    try {
      const userId = await dataService.getUserId();
      if (userId) await dataService.updateSettings(userId, { exchange_rates: rates });
      addNotification("تم التحديث 💱", "تم تحديث أسعار الصرف.", "success");
    } catch (e) { logger.error("Update rates error:", e); }
  }, [addNotification]);

  const createCloudBackup = useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = await dataService.getUserId();
      if (!userId) throw new Error("User session not found");
      await supabase.rpc('create_auto_backup', { user_uuid: userId });
      addNotification("تم النسخ الاحتياطي ✅", "تم إنشاء نسخة سحابية آمنة لبياناتك.", "success");
    } catch (e) {
      addNotification("فشل النسخ الاحتياطي ⚠️", "حدث خطأ أثناء الاتصال بالسيرفر.", "warning");
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const actions = useMemo(() => ({
    loadAllData, deleteRecord, updateRecord,
    addSale, addPurchase, addVoucher, addCustomer, addSupplier, addCategory, addExpense, addWaste,
    updateExchangeRates, createCloudBackup,
    returnSale: async (id: string) => { try { setIsLoading(true); await dataService.returnSale(id); await loadAllData(user?.id); addNotification("تم الإرجاع ✅", "تم تحديث الأرصدة.", "success"); } catch(e) { logger.error(e); } finally { setIsLoading(false); } },
    returnPurchase: async (id: string) => { try { setIsLoading(true); await dataService.returnPurchase(id); await loadAllData(user?.id); addNotification("تم الإرجاع ✅", "تم تحديث الأرصدة.", "success"); } catch(e) { logger.error(e); } finally { setIsLoading(false); } },
    deleteSale: (id: string) => deleteRecord('sales', id),
    deletePurchase: (id: string) => deleteRecord('purchases', id),
    deleteCustomer: (id: string) => deleteRecord('customers', id),
    deleteSupplier: (id: string) => deleteRecord('suppliers', id),
    deleteCategory: (id: string) => deleteRecord('categories', id),
    deleteVoucher: (id: string) => deleteRecord('vouchers', id),
    deleteExpense: (id: string) => deleteRecord('expenses', id),
    deleteWaste: (id: string) => deleteRecord('waste', id),
    addOpeningBalance: async (b: any) => { try { const res = await dataService.saveOpeningBalance(b); addNotification("تم القيد ✅", "تم حفظ الرصيد السابق.", "success"); return res; } catch(e) { handleValidationError(e); } },
    addExpenseTemplate: async (t: any) => { try { const res = await dataService.saveExpenseTemplate(t); setExpenseTemplates(prev => [res, ...prev]); } catch(e) { handleValidationError(e); } },
    addExpenseCategory: (n: string) => setExpenseCategories(prev => [...prev, n])
  }), [loadAllData, deleteRecord, updateRecord, addSale, addPurchase, addVoucher, addCustomer, addSupplier, addCategory, addExpense, addWaste, updateExchangeRates, createCloudBackup, handleValidationError, addNotification, user?.id]);

  const value = useMemo(() => ({
    customers, suppliers, sales, purchases, vouchers, categories, expenses, expenseCategories,
    expenseTemplates, wasteRecords, activityLogs, exchangeRates, isLoading, connectionError, ...actions
  }), [customers, suppliers, sales, purchases, vouchers, categories, expenses, expenseCategories, expenseTemplates, wasteRecords, activityLogs, exchangeRates, isLoading, connectionError, actions]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

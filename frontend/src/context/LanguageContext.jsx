import { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    dashboard: 'Dashboard', events: 'Events', venues: 'Venue Search',
    bookings: 'Booking Requests', tasks: 'Tasks & Workflow', staff: 'Staff Management',
    budget: 'Budget Management', layout: 'Venue Layout', vendors: 'Vendor Directory',
    sourcing: 'Sourcing Requests', invoices: 'Invoice Review', guests: 'Guest Management',
    invitations: 'Invitations', dayOf: 'Day-Of Dashboard', communications: 'Communications',
    feedback: 'Feedback Review', reports: 'Reports & Analytics', profile: 'My Profile',
    notifications: 'Notifications', history: 'Transaction History',
    welcome: 'Welcome back', createEvent: '+ Create Event', search: 'Search',
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
    noData: 'No data found', loading: 'Loading...', submit: 'Submit',
    attending: 'Attending', notAttending: 'Not Attending', maybe: 'Maybe',
    approved: 'Approved', declined: 'Declined', pending: 'Pending',
    logout: 'Logout', language: 'Language',
  },
  ar: {
    dashboard: 'لوحة التحكم', events: 'الفعاليات', venues: 'البحث عن أماكن',
    bookings: 'طلبات الحجز', tasks: 'المهام والعمليات', staff: 'إدارة الفريق',
    budget: 'إدارة الميزانية', layout: 'تصميم المكان', vendors: 'دليل الموردين',
    sourcing: 'طلبات التوريد', invoices: 'مراجعة الفواتير', guests: 'إدارة الضيوف',
    invitations: 'الدعوات', dayOf: 'لوحة يوم الفعالية', communications: 'التواصل',
    feedback: 'مراجعة التقييمات', reports: 'التقارير والتحليلات', profile: 'ملفي الشخصي',
    notifications: 'الإشعارات', history: 'سجل المعاملات',
    welcome: 'مرحباً بعودتك', createEvent: '+ إنشاء فعالية', search: 'بحث',
    save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', edit: 'تعديل',
    noData: 'لا توجد بيانات', loading: 'جار التحميل...', submit: 'إرسال',
    attending: 'سأحضر', notAttending: 'لن أحضر', maybe: 'ربما',
    approved: 'موافق', declined: 'مرفوض', pending: 'قيد الانتظار',
    logout: 'تسجيل الخروج', language: 'اللغة',
  },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('popeyez_lang') || 'en');

  const toggleLang = () => {
    const next = lang === 'en' ? 'ar' : 'en';
    setLang(next);
    localStorage.setItem('popeyez_lang', next);
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
  };

  const t = (key) => translations[lang][key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, isRTL: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
};

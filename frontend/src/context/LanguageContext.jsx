import { createContext, useContext, useState, useEffect } from 'react';

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
    overview: 'Overview', venue: 'Venue', operations: 'Operations',
    vendorsGuests: 'Vendors & Guests', dayOfSection: 'Day-Of', insights: 'Insights', account: 'Account',
    myEvents: 'My Events', myTasks: 'My Tasks', floorPlan: 'View Floor Plan',
    checkIn: 'Guest Check-In', vendorArrivals: 'Vendor Arrivals',
    catalogue: 'Product Catalogue', orders: 'Orders', delivery: 'Delivery Status',
    finance: 'Finance', submitInvoice: 'Submit Invoice', invoiceStatus: 'Invoice Status',
    myVenues: 'My Venues', confirmedBookings: 'Confirmed Bookings',
    dayOfMessages: 'Day-Of Messages', qrPass: 'QR Check-In Pass', submitFeedback: 'Submit Feedback',
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
    overview: 'نظرة عامة', venue: 'المكان', operations: 'العمليات',
    vendorsGuests: 'الموردون والضيوف', dayOfSection: 'يوم الفعالية', insights: 'التحليلات', account: 'الحساب',
    myEvents: 'فعالياتي', myTasks: 'مهامي', floorPlan: 'عرض المخطط',
    checkIn: 'تسجيل دخول الضيوف', vendorArrivals: 'وصول الموردين',
    catalogue: 'كتالوج المنتجات', orders: 'الطلبات', delivery: 'حالة التوصيل',
    finance: 'المالية', submitInvoice: 'إرسال فاتورة', invoiceStatus: 'حالة الفواتير',
    myVenues: 'أماكني', confirmedBookings: 'الحجوزات المؤكدة',
    dayOfMessages: 'رسائل يوم الفعالية', qrPass: 'بطاقة QR للدخول', submitFeedback: 'إرسال تقييم',
  },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('popeyez_lang') || 'en');

  // Apply dir and lang on mount and whenever lang changes
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => {
    const next = lang === 'en' ? 'ar' : 'en';
    setLang(next);
    localStorage.setItem('popeyez_lang', next);
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

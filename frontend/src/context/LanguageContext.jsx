import { createContext, useContext, useState, useEffect } from 'react';

const en = {
  // Sidebar navigation
  dashboard: 'Dashboard', events: 'Events', venues: 'Venue Search',
  bookings: 'Booking Requests', tasks: 'Tasks & Workflow', staff: 'Staff Management',
  budget: 'Budget Management', layout: 'Venue Layout', vendors: 'Vendor Directory',
  sourcing: 'Sourcing Requests', invoices: 'Invoice Review', guests: 'Guest Management',
  invitations: 'Invitations', dayOf: 'Day-Of Dashboard', communications: 'Communications',
  feedback: 'Feedback Review', reports: 'Reports & Analytics', profile: 'My Profile',
  notifications: 'Notifications', history: 'Transaction History',
  overview: 'Overview', venue: 'Venue', operations: 'Operations',
  vendorsGuests: 'Vendors & Guests', dayOfSection: 'Day-Of', insights: 'Insights', account: 'Account',
  myEvents: 'My Events', myTasks: 'My Tasks', floorPlan: 'View Floor Plan',
  checkIn: 'Guest Check-In', vendorArrivals: 'Vendor Arrivals',
  catalogue: 'Product Catalogue', orders: 'Orders', delivery: 'Delivery Status',
  finance: 'Finance', submitInvoice: 'Submit Invoice', invoiceStatus: 'Invoice Status',
  myVenues: 'My Venues', confirmedBookings: 'Confirmed Bookings',
  dayOfMessages: 'Day-Of Messages', qrPass: 'QR Check-In Pass', submitFeedback: 'Submit Feedback',

  // Common actions
  save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', add: 'Add',
  search: 'Search', filter: 'Filter', export: 'Export', submit: 'Submit',
  confirm: 'Confirm', close: 'Close', back: 'Back', next: 'Next',
  yes: 'Yes', no: 'No', loading: 'Loading...', noData: 'No data found',
  logout: 'Logout', language: 'Language', welcome: 'Welcome back',
  createEvent: '+ Create Event', addItem: '+ Add Item', new: 'New',

  // Status labels
  attending: 'Attending', notAttending: 'Not Attending', maybe: 'Maybe',
  approved: 'Approved', declined: 'Declined', pending: 'Pending',
  inProgress: 'In Progress', done: 'Done', notAssigned: 'Not Assigned',
  active: 'Active', inactive: 'Inactive', paid: 'Paid', rejected: 'Rejected',

  // Budget page
  budgetItems: 'Budget Items', totalBudget: 'Total Budget', totalPlanned: 'Total Planned',
  totalActual: 'Total Actual', variance: 'Variance', category: 'Category',
  description: 'Description', plannedEGP: 'Planned (EGP)', actualEGP: 'Actual (EGP)',
  notes: 'Notes', actions: 'Actions', setBudget: 'Set Budget', addBudgetItem: 'Add Budget Item',
  editBudgetItem: 'Edit Budget Item', budgetAlert: 'Budget Alert', overBudget: 'Over Budget!',
  budgetWarning: 'Budget Warning', budgetUtilization: 'Budget Utilization',

  // Events page
  eventName: 'Event Name', eventDate: 'Event Date', eventType: 'Event Type',
  status: 'Status', venue2: 'Venue', expectedGuests: 'Expected Guests',
  dressCode: 'Dress Code', agenda: 'Agenda', startTime: 'Start Time', endTime: 'End Time',
  allStatuses: 'All Statuses', searchEvents: 'Search events...',
  noEventsFound: 'No events found', createFirst: 'Create your first pop-up café event',

  // Guest management
  guestName: 'Guest Name', email: 'Email', phone: 'Phone', group: 'Group',
  rsvpStatus: 'RSVP Status', dietaryPreferences: 'Dietary Preferences',
  checkedIn: 'Checked In', notCheckedIn: 'Not Checked In', allEvents: 'All Events',
  addGuest: '+ Add Guest', searchGuests: 'Search guests...',
  totalGuests: 'Total Guests', attending2: 'Attending', specialRequirements: 'Special Requirements',

  // Tasks page
  title: 'Title', assignedTo: 'Assigned To', priority: 'Priority', dueDate: 'Due Date',
  speciality: 'Speciality', unassigned: 'Unassigned', high: 'High', medium: 'Medium', low: 'Low',
  newTask: '+ New Task', searchTasks: 'Search tasks...',
  allPriorities: 'All Priorities', taskBoard: 'Task Board',

  // Staff management
  staffManagement: 'Team & Account Management', addStaff: '+ Add Staff Member',
  addVendor: '+ Add Vendor', addGuestAcc: '+ Add Guest',
  name: 'Name', role: 'Role', deactivate: 'Deactivate', activate: 'Activate',

  // Vendor directory
  vendorName: 'Vendor Name', suppliesOffered: 'Supplies Offered', location: 'Location',
  rating: 'Rating', reviews: 'Reviews', minOrder: 'Min Order', leadTime: 'Lead Time',
  viewDetails: 'View Details', rateVendor: '⭐ Rate', searchVendors: 'Search vendors...',
  allCategories: 'All Categories',

  // Invoice review
  invoiceNum: 'Invoice #', vendor2: 'Vendor', event2: 'Event', total: 'Total (EGP)',
  dueDate2: 'Due Date', searchInvoice: 'Search by vendor or invoice number...',
  allStatuses2: 'All Statuses',

  // Communications
  sendMessage: '📢 Send Message', messageHistory: 'Message History',
  noMessages: 'No messages sent', sentTo: 'Sent to', seen: 'seen',
  notSeen: 'not seen', sendFollowUp: 'Send Follow-Up', allGuests: '📢 All Guests',
  specificGuests: '👤 Specific Guest(s)', message2: 'Message',
  selectRecipients: 'SELECT RECIPIENTS',

  // Reports
  fullReport: '📊 Overview', attendanceTab: '👥 Attendance', financialTab: '💰 Financial',
  tasksTab: '✅ Tasks', feedbackTab: '⭐ Feedback', compareTab: '🔀 Compare Events',
  eventHealthScore: 'Overall Event Health Score', totalInvited: 'Total Invited',
  rsvpRate: 'RSVP Rate', checkInRate: 'Check-In Rate', taskCompletion: 'Task Completion',
  budgetUsed: 'Budget Used', avgRating: 'Avg Rating', totalResponses: 'Total Responses',

  // Notifications & History
  markAllRead: 'Mark All Read', noNotifications: 'No notifications',
  transactionHistory: 'Transaction History', type: 'Type', action: 'Action',
  dateTime: 'Date & Time', statusChange: 'Status Change', allTypes: 'All Types',
};

const ar = {
  // Sidebar navigation
  dashboard: 'لوحة التحكم', events: 'الفعاليات', venues: 'البحث عن أماكن',
  bookings: 'طلبات الحجز', tasks: 'المهام والعمليات', staff: 'إدارة الفريق',
  budget: 'إدارة الميزانية', layout: 'تصميم المكان', vendors: 'دليل الموردين',
  sourcing: 'طلبات التوريد', invoices: 'مراجعة الفواتير', guests: 'إدارة الضيوف',
  invitations: 'الدعوات', dayOf: 'لوحة يوم الفعالية', communications: 'التواصل',
  feedback: 'مراجعة التقييمات', reports: 'التقارير والتحليلات', profile: 'ملفي الشخصي',
  notifications: 'الإشعارات', history: 'سجل المعاملات',
  overview: 'نظرة عامة', venue: 'المكان', operations: 'العمليات',
  vendorsGuests: 'الموردون والضيوف', dayOfSection: 'يوم الفعالية', insights: 'التحليلات', account: 'الحساب',
  myEvents: 'فعالياتي', myTasks: 'مهامي', floorPlan: 'عرض المخطط',
  checkIn: 'تسجيل دخول الضيوف', vendorArrivals: 'وصول الموردين',
  catalogue: 'كتالوج المنتجات', orders: 'الطلبات', delivery: 'حالة التوصيل',
  finance: 'المالية', submitInvoice: 'إرسال فاتورة', invoiceStatus: 'حالة الفواتير',
  myVenues: 'أماكني', confirmedBookings: 'الحجوزات المؤكدة',
  dayOfMessages: 'رسائل يوم الفعالية', qrPass: 'بطاقة QR للدخول', submitFeedback: 'إرسال تقييم',

  // Common actions
  save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', edit: 'تعديل', add: 'إضافة',
  search: 'بحث', filter: 'تصفية', export: 'تصدير', submit: 'إرسال',
  confirm: 'تأكيد', close: 'إغلاق', back: 'رجوع', next: 'التالي',
  yes: 'نعم', no: 'لا', loading: 'جار التحميل...', noData: 'لا توجد بيانات',
  logout: 'تسجيل الخروج', language: 'اللغة', welcome: 'مرحباً بعودتك',
  createEvent: '+ إنشاء فعالية', addItem: '+ إضافة بند', new: 'جديد',

  // Status labels
  attending: 'سأحضر', notAttending: 'لن أحضر', maybe: 'ربما',
  approved: 'موافق عليه', declined: 'مرفوض', pending: 'قيد الانتظار',
  inProgress: 'جار التنفيذ', done: 'مكتمل', notAssigned: 'غير مُعيَّن',
  active: 'نشط', inactive: 'غير نشط', paid: 'مدفوع', rejected: 'مرفوض',

  // Budget page
  budgetItems: 'بنود الميزانية', totalBudget: 'إجمالي الميزانية', totalPlanned: 'إجمالي المخطط',
  totalActual: 'إجمالي الفعلي', variance: 'الفرق', category: 'الفئة',
  description: 'الوصف', plannedEGP: 'المخطط (ج.م)', actualEGP: 'الفعلي (ج.م)',
  notes: 'ملاحظات', actions: 'الإجراءات', setBudget: 'تحديد الميزانية', addBudgetItem: 'إضافة بند ميزانية',
  editBudgetItem: 'تعديل بند الميزانية', budgetAlert: 'تنبيه الميزانية', overBudget: 'تجاوزت الميزانية!',
  budgetWarning: 'تحذير الميزانية', budgetUtilization: 'استخدام الميزانية',

  // Events page
  eventName: 'اسم الفعالية', eventDate: 'تاريخ الفعالية', eventType: 'نوع الفعالية',
  status: 'الحالة', venue2: 'المكان', expectedGuests: 'الضيوف المتوقعون',
  dressCode: 'كود اللباس', agenda: 'جدول الأعمال', startTime: 'وقت البدء', endTime: 'وقت الانتهاء',
  allStatuses: 'جميع الحالات', searchEvents: 'بحث في الفعاليات...',
  noEventsFound: 'لا توجد فعاليات', createFirst: 'أنشئ أول فعاليتك',

  // Guest management
  guestName: 'اسم الضيف', email: 'البريد الإلكتروني', phone: 'الهاتف', group: 'المجموعة',
  rsvpStatus: 'حالة التأكيد', dietaryPreferences: 'التفضيلات الغذائية',
  checkedIn: 'تم التسجيل', notCheckedIn: 'لم يُسجَّل', allEvents: 'جميع الفعاليات',
  addGuest: '+ إضافة ضيف', searchGuests: 'بحث في الضيوف...',
  totalGuests: 'إجمالي الضيوف', attending2: 'الحضور', specialRequirements: 'متطلبات خاصة',

  // Tasks page
  title: 'العنوان', assignedTo: 'مُعيَّن لـ', priority: 'الأولوية', dueDate: 'تاريخ الاستحقاق',
  speciality: 'التخصص', unassigned: 'غير مُعيَّن', high: 'عالية', medium: 'متوسطة', low: 'منخفضة',
  newTask: '+ مهمة جديدة', searchTasks: 'بحث في المهام...',
  allPriorities: 'جميع الأولويات', taskBoard: 'لوحة المهام',

  // Staff management
  staffManagement: 'إدارة الفريق والحسابات', addStaff: '+ إضافة عضو فريق',
  addVendor: '+ إضافة مورد', addGuestAcc: '+ إضافة ضيف',
  name: 'الاسم', role: 'الدور', deactivate: 'تعطيل', activate: 'تفعيل',

  // Vendor directory
  vendorName: 'اسم المورد', suppliesOffered: 'المنتجات المقدمة', location: 'الموقع',
  rating: 'التقييم', reviews: 'التقييمات', minOrder: 'الحد الأدنى للطلب', leadTime: 'وقت التسليم',
  viewDetails: 'عرض التفاصيل', rateVendor: '⭐ تقييم', searchVendors: 'بحث في الموردين...',
  allCategories: 'جميع الفئات',

  // Invoice review
  invoiceNum: 'رقم الفاتورة', vendor2: 'المورد', event2: 'الفعالية', total: 'الإجمالي (ج.م)',
  dueDate2: 'تاريخ الاستحقاق', searchInvoice: 'بحث برقم الفاتورة أو المورد...',
  allStatuses2: 'جميع الحالات',

  // Communications
  sendMessage: '📢 إرسال رسالة', messageHistory: 'سجل الرسائل',
  noMessages: 'لا توجد رسائل', sentTo: 'أُرسلت إلى', seen: 'شوهدت',
  notSeen: 'لم تُشاهَد', sendFollowUp: 'إرسال متابعة', allGuests: '📢 جميع الضيوف',
  specificGuests: '👤 ضيف محدد', message2: 'الرسالة',
  selectRecipients: 'اختر المستلمين',

  // Reports
  fullReport: '📊 نظرة عامة', attendanceTab: '👥 الحضور', financialTab: '💰 المالية',
  tasksTab: '✅ المهام', feedbackTab: '⭐ التقييمات', compareTab: '🔀 مقارنة الفعاليات',
  eventHealthScore: 'نتيجة صحة الفعالية', totalInvited: 'إجمالي المدعوين',
  rsvpRate: 'نسبة التأكيد', checkInRate: 'نسبة تسجيل الدخول', taskCompletion: 'إنجاز المهام',
  budgetUsed: 'الميزانية المُستخدمة', avgRating: 'متوسط التقييم', totalResponses: 'إجمالي الردود',

  // Notifications & History
  markAllRead: 'تحديد الكل كمقروء', noNotifications: 'لا توجد إشعارات',
  transactionHistory: 'سجل المعاملات', type: 'النوع', action: 'الإجراء',
  dateTime: 'التاريخ والوقت', statusChange: 'تغيير الحالة', allTypes: 'جميع الأنواع',
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('popeyez_lang') || 'en');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => {
    const next = lang === 'en' ? 'ar' : 'en';
    setLang(next);
    localStorage.setItem('popeyez_lang', next);
  };

  const translations = lang === 'ar' ? ar : en;
  const t = (key) => translations[key] || en[key] || key;

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

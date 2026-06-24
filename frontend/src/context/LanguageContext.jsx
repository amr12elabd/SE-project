import { createContext, useContext, useState, useEffect } from 'react';

const en = {
  // ── Sidebar ──
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

  // ── Common actions ──
  save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', add: 'Add',
  search: 'Search', filter: 'Filter', export: 'Export', submit: 'Submit',
  confirm: 'Confirm', close: 'Close', back: 'Back', next: 'Next',
  yes: 'Yes', no: 'No', loading: 'Loading...', noData: 'No data found',
  logout: 'Logout', language: 'Language', welcome: 'Welcome back',
  createEvent: '+ Create Event', addItem: '+ Add Item', new: 'New',
  view: 'View', send: 'Send', update: 'Update', create: 'Create',
  selectAll: 'Select All', clear: 'Clear', clearFilters: 'Clear Filters',
  addToCalendar: '📅 Add to Calendar',

  // ── Status labels ──
  attending: 'Attending', notAttending: 'Not Attending', maybe: 'Maybe',
  approved: 'Approved', declined: 'Declined', pending: 'Pending',
  inProgress: 'In Progress', done: 'Done', notAssigned: 'Not Assigned',
  active: 'Active', inactive: 'Inactive', paid: 'Paid', rejected: 'Rejected',
  planning: 'Planning', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled',
  accepted: 'Accepted', delivered: 'Delivered', preparing: 'Preparing',
  outForDelivery: 'Out for Delivery', pendingReview: 'Pending Review',

  // ── Budget ──
  budgetItems: 'Budget Items', totalBudget: 'Total Budget', totalPlanned: 'Total Planned',
  totalActual: 'Total Actual', variance: 'Variance', category: 'Category',
  description: 'Description', plannedEGP: 'Planned (EGP)', actualEGP: 'Actual (EGP)',
  notes: 'Notes', actions: 'Actions', setBudget: 'Set', addBudgetItem: 'Add Budget Item',
  editBudgetItem: 'Edit Budget Item', budgetAlert: 'Budget Alert', overBudget: 'Over Budget!',
  budgetWarning: 'Budget Warning', budgetUtilization: 'Budget Utilization',

  // ── Events ──
  eventName: 'Event Name', eventDate: 'Event Date', eventType: 'Event Type',
  status: 'Status', expectedGuests: 'Expected Guests',
  dressCode: 'Dress Code', agenda: 'Agenda', startTime: 'Start Time', endTime: 'End Time',
  allStatuses: 'All Statuses', searchEvents: 'Search events...',
  noEventsFound: 'No events found', createFirst: 'Create your first event',
  basicInfo: 'Basic Information', staffAssignment: 'Staff Assignment',
  eventDetails: 'Event Details', saveEvent: 'Save Event', editEvent: '✏️ Edit Event',
  eventReadiness: 'Event Readiness', taskCompletion: 'Task Completion',
  rsvpRate: 'RSVP Rate', checkInRate: 'Check-In Rate', budgetUsed: 'Budget Used',
  daysUntil: 'days away', today: 'TODAY!', tomorrow: 'TOMORROW',
  duplicateEvent: 'Duplicate', listView: '☰ List', calendarView: '📅 Calendar',

  // ── Guest management ──
  guestName: 'Guest Name', email: 'Email', phone: 'Phone', group: 'Group',
  rsvpStatus: 'RSVP Status', dietaryPreferences: 'Dietary Preferences',
  checkedIn: 'Checked In', notCheckedIn: 'Not Checked In', allEvents: 'All Events',
  addGuest: '+ Add Guest', searchGuests: 'Search guests...',
  totalGuests: 'Total Guests', attending2: 'Attending', specialRequirements: 'Special Requirements',
  allergies: 'Allergies', allRSVPs: 'All RSVPs', removeGuest: 'Remove Guest',
  copyRSVPLink: 'Copy RSVP Link',

  // ── Tasks ──
  title: 'Title', assignedTo: 'Assigned To', priority: 'Priority', dueDate: 'Due Date',
  speciality: 'Speciality', unassigned: 'Unassigned', high: 'High', medium: 'Medium', low: 'Low',
  newTask: '+ New Task', searchTasks: 'Search tasks...',
  allPriorities: 'All Priorities', taskBoard: 'Kanban',
  overdueTasks: 'overdue tasks', urgentTasks: 'urgent tasks',

  // ── Staff ──
  staffManagement: 'Team & Account Management', addStaff: '+ Add Staff Member',
  addVendor: '+ Add Vendor', addGuestAcc: '+ Add Guest',
  name: 'Name', role: 'Role', deactivate: 'Deactivate', activate: 'Activate',
  viewTasks: 'View Tasks', createAccount: 'Create Account',
  password: 'Password', bio: 'Bio',

  // ── Vendor directory ──
  vendorName: 'Vendor Name', suppliesOffered: 'Supplies Offered', location: 'Location',
  rating: 'Rating', reviews: 'reviews', minOrder: 'Min Order', leadTime: 'Lead Time',
  viewDetails: 'View Details', rateVendor: '⭐ Rate', searchVendors: 'Search vendors...',
  allCategories: 'All Categories', samplePrices: 'Sample Prices',
  submitRating: 'Submit Rating', overallRating: 'Overall Rating',
  categoryRatings: 'Category Ratings', writtenReview: 'Written Review',
  relatedEvent: 'Related Event', previousReviews: 'Previous Reviews',

  // ── Invoice ──
  invoiceNum: 'Invoice #', vendor2: 'Vendor', event2: 'Event', total: 'Total (EGP)',
  dueDate2: 'Due Date', searchInvoice: 'Search by vendor or invoice number...',
  allStatuses2: 'All Statuses', lineItems: 'Line Items', qty: 'Qty',
  unitPrice: 'Unit Price', itemizedBreakdown: 'Notes / Breakdown',
  downloadPDF: '📄 PDF',

  // ── Venue Search ──
  searchVenues: 'Search Venues', city: 'City', area: 'Area',
  minCapacity: 'Min Capacity', maxPriceDay: 'Max Price/Day (EGP)',
  availableOn: '✓ Available', bookVenue: 'Book This Venue',
  submitBooking: 'Submit Booking Request', selectEvent: 'Select Event',
  eventDateLabel: 'Event Date', attendeesCount: 'Expected Attendees',
  specialReqs: 'Special Requirements', perDay: '/day', perHour: '/hr',
  capacity: 'Capacity', amenities: 'Amenities', deliveryRegions: 'Delivery Regions',
  pricingList: 'Pricing List',

  // ── Booking Requests ──
  submitted: 'Submitted', attendees: 'attendees', requirements: 'Requirements',
  ownerResponse: 'Venue Owner Response', counterProposal: 'Counter Proposal',
  yourCounterOffer: 'Your Counter Offer (awaiting venue owner)',
  accept: 'Accept', decline: 'Decline', counterOffer: 'Counter Offer',
  sendCounterOffer: 'Send Counter Offer', proposedDate: 'Proposed Date',
  proposedPrice: 'Proposed Price (EGP)', counterNotes: 'Notes *',
  noBookings: 'No booking requests yet',
  browseVenues: 'Browse Venues',

  // ── Venue Layout ──
  saveLayout: '💾 Save Layout', exportPNG: '🖼️ Export PNG',
  shareWithStaff: 'Share with Staff', addElement: 'Add Element',
  setupInstructions: 'Setup Instructions', selectedElement: 'Selected Element',
  elementLabel: 'Label', elementColor: 'Color', seats: 'Seats',
  deleteElement: 'Delete Element',

  // ── Sourcing Requests ──
  createRequest: '+ Create Request', item: 'Item', quantity: 'Quantity', unit: 'Unit',
  deliveryDate: 'Delivery Date', eventLocation: 'Event Location',
  estimatedCost: 'Estimated Cost (EGP)', addItemRow: '+ Add Item',
  clarificationNote: 'Clarification Note', delayNote: 'Delay Note',
  markDelay: '⚠️ Report Delay', noSourcingRequests: 'No sourcing requests yet',

  // ── Communications ──
  sendMessage: '📢 Send Message', messageHistory: 'Message History',
  noMessages: 'No messages sent', sentTo: 'Sent to', seen: 'seen',
  notSeen: 'not seen', sendFollowUp: 'Send Follow-Up', allGuests: '📢 All Guests',
  specificGuests: '👤 Specific Guest(s)', message2: 'Message',
  selectRecipients: 'SELECT RECIPIENTS', followUpMessage: 'Follow-Up Message',
  whatsapp: '📲 WhatsApp',

  // ── Feedback ──
  totalResponses: 'Total Responses', avgRating: 'Avg Rating',
  positive: 'Positive', negative: 'Negative', comments: 'Comments',
  overallExperience: 'Overall Experience', foodBeverages: 'Food & Beverages',
  venueAmbience: 'Venue & Ambience', organization: 'Organization & Logistics',
  noFeedback: 'No feedback yet', thankYouFeedback: 'Thank You!',
  feedbackSubmitted: 'Your feedback has been submitted',
  leaveAnotherReview: 'Leave Another Review', backToDashboard: 'Back to Dashboard',
  rateExperience: 'Rate Your Experience',

  // ── Reports ──
  fullReport: '📊 Overview', attendanceTab: '👥 Attendance', financialTab: '💰 Financial',
  tasksTab: '✅ Tasks', feedbackTab: '⭐ Feedback', compareTab: '🔀 Compare Events',
  eventHealthScore: 'Overall Event Health Score', totalInvited: 'Total Invited',
  selectEvents: 'Select Events to Compare', compareDesc: 'Pick 2–5 events to compare',
  ratingDistribution: 'Rating Distribution', exportCSV: '📤 Export CSV',
  exportPDFReport: '📄 Export PDF', generating: 'Exporting...',
  noReportData: 'No data available',

  // ── History ──
  transactionHistory: 'Transaction History', type: 'Type', action: 'Action',
  dateTime: 'Date & Time', statusChange: 'Status Change', allTypes: 'All Types',
  noHistory: 'No transaction history yet',
  historyDesc: 'Your actions on bookings, invoices, tasks, and guests will appear here.',

  // ── Day-Of Dashboard ──
  dayOfDashboard: 'Day-Of Operations', liveStats: 'Live Statistics',
  totalArrived: 'Arrived', totalExpected: 'Expected', vendorsSummary: 'Vendors',
  tasksSummary: 'Tasks Done', noTodayEvents: 'No events today',

  // ── Invitations ──
  sendInvitations: 'Send Invitations', selectGuests: 'Select Guests',
  yourMessage: 'Your Message', invitationSent: 'Invitation sent!',
  invitationStatus: 'Invitation Status', responded: 'Responded', sent: 'Sent',
  noInvitationsYet: 'No invitations sent yet',

  // ── Venue Owner ──
  addNewVenue: '+ Add New Venue', venueName: 'Venue Name',
  venueDescription: 'Description', capacityLabel: 'Capacity (persons)',
  dimensions: 'Dimensions', address: 'Street Address', pricePerDay: 'Price per Day (EGP)',
  pricePerHour: 'Price per Hour (EGP)', availabilityCalendar: 'Availability Calendar',
  markUnavailable: 'Mark as Unavailable', markAvailable: 'Mark as Available',
  unavailable: 'Unavailable', available: 'Available',
  totalBookings: 'Total Requests', confirmedCount: 'Confirmed Bookings',
  avgRatingVenue: 'Avg Rating', reviewCount: 'Reviews',
  bookingStatus: 'Booking Request Status', feedbackSummary: 'Feedback Summary',
  exportCSVReport: '📥 Export CSV',
  approveBooking: 'Approve', declineBooking: 'Decline', counterPropose: 'Counter-Propose',
  ownerMessage: 'Message to Organizer', counterDate: 'Suggested Date',
  counterPrice: 'Suggested Price (EGP)', counterNotesLabel: 'Counter Notes',
  submitResponse: 'Submit Response', bookingHistory: 'Booking History',

  // ── Staff pages ──
  staffDashboard: 'Staff Dashboard', assignedEvents: 'Assigned Events',
  assignedTasks: 'Assigned Tasks', upcomingEvents: 'Upcoming Events',
  completedTasks: 'Completed', remainingTasks: 'Remaining',
  overdueAlert: 'You have overdue tasks. Please complete or flag them.',
  filterByDate: 'Filter by Date', updateStatus: 'Update Status',
  markArrived: '✓ Mark Arrived', undoArrived: '↩ Undo',
  arrived: '✓ Arrived', enRoute: 'En Route', expectedVendors: 'Expected Vendors',
  guestCheckIn: 'Guest Check-In', searchGuest: 'Search by name or QR...',
  checkInConfirm: 'Checked In Successfully', filterByStatus: 'Filter by Status',

  // ── Vendor pages ──
  vendorDashboard: 'Vendor Dashboard', incomingSourcing: 'Incoming Sourcing Requests',
  deliveryTracking: 'Delivery Tracking', myInvoices: 'My Invoices',
  acceptRequest: 'Accept', declineRequest: 'Decline', sendMessage3: 'Send Message',
  updateDelivery: 'Update Delivery Status', reportDelay: '⚠️ Report Delay',
  delayMessage: 'Delay Message', confirmDelivery: 'Confirm Delivery',
  createInvoice: 'Create Invoice', invoiceItems: 'Invoice Items',
  addLineItem: '+ Add Line Item', totalAmount: 'Total Amount (EGP)',
  breakdown: 'Itemized Breakdown / Notes', submitInvoiceBtn: 'Submit Invoice',
  invoicePending: 'Pending Review', invoiceApproved: 'Approved', invoicePaid: 'Paid',

  // ── Guest pages ──
  myInvitations: 'My Invitations', willYouAttend: 'Will you attend this event?',
  yesAttending: '✅ Yes, I\'ll be there!', noAttending: '❌ Sorry, I can\'t make it',
  changeResponse: 'Change to', viewAgenda: '📋 View Event Agenda',
  yourResponse: 'Your response', dayOfUpdates: 'Day-Of Messages',
  noInvitations: 'No invitations yet', invitationsDesc: 'When organizers invite you, they will appear here.',
  myQRCode: 'My QR Code', showAtEntrance: 'Show this at the event entrance',
  yourCheckInCode: 'Your Check-In QR Code',
  noEventsToRate: 'No events to review',
  feedbackAvailableFor: 'Feedback is available for events you attended.',
  selectEvent2: 'Select Event',

  // ── Profile ──
  profileInfo: '👤 Profile Info', changePassword: '🔒 Change Password',
  notificationPrefs: '🔔 Notifications', fullName: 'Full Name',
  currentPassword: 'Current Password', newPassword: 'New Password',
  confirmPassword: 'Confirm Password', updateProfile: 'Update Profile',
  changePasswordBtn: 'Change Password', emailNotifs: 'Email Notifications',
  pushNotifs: 'Push Notifications', inAppNotifs: 'In-App Notifications',
  restartTour: '🔄 Restart Tour', newToPopeyez: 'New to PopEyez?',
  restartTourDesc: 'Restart the guided tour for your role anytime.',

  // ── Notifications ──
  markAllRead: 'Mark All Read', noNotifications: 'No notifications',
  noNotifDesc: 'You\'re all caught up!', unread: 'Unread', all: 'All',

  // ── Auth ──
  signIn: 'Sign In', signInDesc: 'Sign in to your account',
  emailAddress: 'Email Address', passwordLabel: 'Password',
  forgotPassword: 'Forgot password?', noAccount: "Don't have an account?",
  createOne: 'Create one', quickDemo: 'QUICK DEMO LOGIN',
  demoPassword: 'All demo accounts use password:',
  createAccount: 'Create Account', createAccountDesc: 'Create your account',
  fullNameLabel: 'Full Name *', phoneLabel: 'Phone',
  roleLabel: 'Role *', confirmPasswordLabel: 'Confirm Password *',
  alreadyHaveAccount: 'Already have an account?',
  eventOrganizer: 'Event Organizer', vendorSupplier: 'Vendor / Supplier',
  venueOwnerRole: 'Venue Owner', guestRole: 'Guest',
};

const ar = {
  // ── Sidebar ──
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

  // ── Common actions ──
  save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', edit: 'تعديل', add: 'إضافة',
  search: 'بحث', filter: 'تصفية', export: 'تصدير', submit: 'إرسال',
  confirm: 'تأكيد', close: 'إغلاق', back: 'رجوع', next: 'التالي',
  yes: 'نعم', no: 'لا', loading: 'جار التحميل...', noData: 'لا توجد بيانات',
  logout: 'تسجيل الخروج', language: 'اللغة', welcome: 'مرحباً بعودتك',
  createEvent: '+ إنشاء فعالية', addItem: '+ إضافة بند', new: 'جديد',
  view: 'عرض', send: 'إرسال', update: 'تحديث', create: 'إنشاء',
  selectAll: 'تحديد الكل', clear: 'مسح', clearFilters: 'مسح الفلاتر',
  addToCalendar: '📅 أضف إلى التقويم',

  // ── Status labels ──
  attending: 'سأحضر', notAttending: 'لن أحضر', maybe: 'ربما',
  approved: 'موافق عليه', declined: 'مرفوض', pending: 'قيد الانتظار',
  inProgress: 'جار التنفيذ', done: 'مكتمل', notAssigned: 'غير مُعيَّن',
  active: 'نشط', inactive: 'غير نشط', paid: 'مدفوع', rejected: 'مرفوض',
  planning: 'تخطيط', confirmed: 'مؤكد', completed: 'مكتمل', cancelled: 'ملغي',
  accepted: 'مقبول', delivered: 'تم التسليم', preparing: 'جار التحضير',
  outForDelivery: 'في الطريق', pendingReview: 'قيد المراجعة',

  // ── Budget ──
  budgetItems: 'بنود الميزانية', totalBudget: 'إجمالي الميزانية', totalPlanned: 'إجمالي المخطط',
  totalActual: 'إجمالي الفعلي', variance: 'الفرق', category: 'الفئة',
  description: 'الوصف', plannedEGP: 'المخطط (ج.م)', actualEGP: 'الفعلي (ج.م)',
  notes: 'ملاحظات', actions: 'الإجراءات', setBudget: 'تحديد', addBudgetItem: 'إضافة بند',
  editBudgetItem: 'تعديل البند', budgetAlert: 'تنبيه الميزانية', overBudget: 'تجاوزت الميزانية!',
  budgetWarning: 'تحذير الميزانية', budgetUtilization: 'استخدام الميزانية',

  // ── Events ──
  eventName: 'اسم الفعالية', eventDate: 'تاريخ الفعالية', eventType: 'نوع الفعالية',
  status: 'الحالة', expectedGuests: 'الضيوف المتوقعون',
  dressCode: 'كود اللباس', agenda: 'جدول الأعمال', startTime: 'وقت البدء', endTime: 'وقت الانتهاء',
  allStatuses: 'جميع الحالات', searchEvents: 'بحث في الفعاليات...',
  noEventsFound: 'لا توجد فعاليات', createFirst: 'أنشئ أول فعالية',
  basicInfo: 'المعلومات الأساسية', staffAssignment: 'تعيين الفريق',
  eventDetails: 'تفاصيل الفعالية', saveEvent: 'حفظ الفعالية', editEvent: '✏️ تعديل الفعالية',
  eventReadiness: 'جاهزية الفعالية', taskCompletion: 'إنجاز المهام',
  rsvpRate: 'نسبة التأكيد', checkInRate: 'نسبة التسجيل', budgetUsed: 'الميزانية المُستخدمة',
  daysUntil: 'أيام متبقية', today: 'اليوم!', tomorrow: 'غداً',
  duplicateEvent: 'نسخ', listView: '☰ قائمة', calendarView: '📅 تقويم',

  // ── Guest management ──
  guestName: 'اسم الضيف', email: 'البريد الإلكتروني', phone: 'الهاتف', group: 'المجموعة',
  rsvpStatus: 'حالة التأكيد', dietaryPreferences: 'التفضيلات الغذائية',
  checkedIn: 'تم التسجيل', notCheckedIn: 'لم يُسجَّل', allEvents: 'جميع الفعاليات',
  addGuest: '+ إضافة ضيف', searchGuests: 'بحث في الضيوف...',
  totalGuests: 'إجمالي الضيوف', attending2: 'الحاضرون', specialRequirements: 'متطلبات خاصة',
  allergies: 'الحساسية', allRSVPs: 'جميع الحالات', removeGuest: 'إزالة الضيف',
  copyRSVPLink: 'نسخ رابط التأكيد',

  // ── Tasks ──
  title: 'العنوان', assignedTo: 'مُعيَّن لـ', priority: 'الأولوية', dueDate: 'تاريخ الاستحقاق',
  speciality: 'التخصص', unassigned: 'غير مُعيَّن', high: 'عالية', medium: 'متوسطة', low: 'منخفضة',
  newTask: '+ مهمة جديدة', searchTasks: 'بحث في المهام...',
  allPriorities: 'جميع الأولويات', taskBoard: 'كانبان',
  overdueTasks: 'مهام متأخرة', urgentTasks: 'مهام عاجلة',

  // ── Staff ──
  staffManagement: 'إدارة الفريق والحسابات', addStaff: '+ إضافة عضو فريق',
  addVendor: '+ إضافة مورد', addGuestAcc: '+ إضافة ضيف',
  name: 'الاسم', role: 'الدور', deactivate: 'تعطيل', activate: 'تفعيل',
  viewTasks: 'عرض المهام', createAccount: 'إنشاء حساب',
  password: 'كلمة المرور', bio: 'نبذة',

  // ── Vendor directory ──
  vendorName: 'اسم المورد', suppliesOffered: 'المنتجات المقدمة', location: 'الموقع',
  rating: 'التقييم', reviews: 'تقييمات', minOrder: 'الحد الأدنى', leadTime: 'وقت التسليم',
  viewDetails: 'عرض التفاصيل', rateVendor: '⭐ تقييم', searchVendors: 'بحث في الموردين...',
  allCategories: 'جميع الفئات', samplePrices: 'أسعار نموذجية',
  submitRating: 'إرسال التقييم', overallRating: 'التقييم العام',
  categoryRatings: 'تقييمات حسب الفئة', writtenReview: 'تقييم مكتوب',
  relatedEvent: 'الفعالية المرتبطة', previousReviews: 'التقييمات السابقة',

  // ── Invoice ──
  invoiceNum: 'رقم الفاتورة', vendor2: 'المورد', event2: 'الفعالية', total: 'الإجمالي (ج.م)',
  dueDate2: 'تاريخ الاستحقاق', searchInvoice: 'بحث برقم الفاتورة أو المورد...',
  allStatuses2: 'جميع الحالات', lineItems: 'بنود الفاتورة', qty: 'الكمية',
  unitPrice: 'سعر الوحدة', itemizedBreakdown: 'ملاحظات / تفاصيل',
  downloadPDF: '📄 PDF',

  // ── Venue Search ──
  searchVenues: 'البحث عن أماكن', city: 'المدينة', area: 'المنطقة',
  minCapacity: 'الحد الأدنى للسعة', maxPriceDay: 'أقصى سعر/يوم (ج.م)',
  availableOn: '✓ متاح', bookVenue: 'احجز هذا المكان',
  submitBooking: 'إرسال طلب الحجز', selectEvent: 'اختر الفعالية',
  eventDateLabel: 'تاريخ الفعالية', attendeesCount: 'عدد الحضور المتوقع',
  specialReqs: 'متطلبات خاصة', perDay: '/يوم', perHour: '/ساعة',
  capacity: 'السعة', amenities: 'المرافق', deliveryRegions: 'مناطق التوصيل',
  pricingList: 'قائمة الأسعار',

  // ── Booking Requests ──
  submitted: 'تم الإرسال', attendees: 'حضور', requirements: 'المتطلبات',
  ownerResponse: 'رد صاحب المكان', counterProposal: 'عرض مضاد',
  yourCounterOffer: 'عرضك المضاد (في انتظار صاحب المكان)',
  accept: 'قبول', decline: 'رفض', counterOffer: 'عرض مضاد',
  sendCounterOffer: 'إرسال العرض المضاد', proposedDate: 'التاريخ المقترح',
  proposedPrice: 'السعر المقترح (ج.م)', counterNotes: 'ملاحظات *',
  noBookings: 'لا توجد طلبات حجز بعد',
  browseVenues: 'تصفح الأماكن',

  // ── Venue Layout ──
  saveLayout: '💾 حفظ المخطط', exportPNG: '🖼️ تصدير PNG',
  shareWithStaff: 'مشاركة مع الفريق', addElement: 'إضافة عنصر',
  setupInstructions: 'تعليمات الإعداد', selectedElement: 'العنصر المحدد',
  elementLabel: 'التسمية', elementColor: 'اللون', seats: 'المقاعد',
  deleteElement: 'حذف العنصر',

  // ── Sourcing Requests ──
  createRequest: '+ إنشاء طلب', item: 'المنتج', quantity: 'الكمية', unit: 'الوحدة',
  deliveryDate: 'تاريخ التسليم', eventLocation: 'موقع الفعالية',
  estimatedCost: 'التكلفة التقديرية (ج.م)', addItemRow: '+ إضافة منتج',
  clarificationNote: 'ملاحظة توضيحية', delayNote: 'ملاحظة تأخير',
  markDelay: '⚠️ الإبلاغ عن تأخير', noSourcingRequests: 'لا توجد طلبات توريد بعد',

  // ── Communications ──
  sendMessage: '📢 إرسال رسالة', messageHistory: 'سجل الرسائل',
  noMessages: 'لا توجد رسائل', sentTo: 'أُرسلت إلى', seen: 'شوهدت',
  notSeen: 'لم تُشاهَد', sendFollowUp: 'إرسال متابعة', allGuests: '📢 جميع الضيوف',
  specificGuests: '👤 ضيف محدد', message2: 'الرسالة',
  selectRecipients: 'اختر المستلمين', followUpMessage: 'رسالة المتابعة',
  whatsapp: '📲 واتساب',

  // ── Feedback ──
  totalResponses: 'إجمالي الردود', avgRating: 'متوسط التقييم',
  positive: 'إيجابي', negative: 'سلبي', comments: 'التعليقات',
  overallExperience: 'التجربة العامة', foodBeverages: 'الطعام والمشروبات',
  venueAmbience: 'المكان والأجواء', organization: 'التنظيم والخدمات اللوجستية',
  noFeedback: 'لا توجد تقييمات بعد', thankYouFeedback: 'شكراً لك!',
  feedbackSubmitted: 'تم إرسال تقييمك',
  leaveAnotherReview: 'إضافة تقييم آخر', backToDashboard: 'العودة للوحة التحكم',
  rateExperience: 'قيّم تجربتك',

  // ── Reports ──
  fullReport: '📊 نظرة عامة', attendanceTab: '👥 الحضور', financialTab: '💰 المالية',
  tasksTab: '✅ المهام', feedbackTab: '⭐ التقييمات', compareTab: '🔀 مقارنة الفعاليات',
  eventHealthScore: 'نتيجة صحة الفعالية', totalInvited: 'إجمالي المدعوين',
  selectEvents: 'اختر الفعاليات للمقارنة', compareDesc: 'اختر من 2 إلى 5 فعاليات',
  ratingDistribution: 'توزيع التقييمات', exportCSV: '📤 تصدير CSV',
  exportPDFReport: '📄 تصدير PDF', generating: 'جار التصدير...',
  noReportData: 'لا توجد بيانات',

  // ── History ──
  transactionHistory: 'سجل المعاملات', type: 'النوع', action: 'الإجراء',
  dateTime: 'التاريخ والوقت', statusChange: 'تغيير الحالة', allTypes: 'جميع الأنواع',
  noHistory: 'لا يوجد سجل بعد',
  historyDesc: 'إجراءاتك على الحجوزات والفواتير والمهام والضيوف ستظهر هنا.',

  // ── Day-Of Dashboard ──
  dayOfDashboard: 'عمليات يوم الفعالية', liveStats: 'إحصائيات مباشرة',
  totalArrived: 'وصلوا', totalExpected: 'متوقعون', vendorsSummary: 'الموردون',
  tasksSummary: 'المهام المكتملة', noTodayEvents: 'لا توجد فعاليات اليوم',

  // ── Invitations ──
  sendInvitations: 'إرسال الدعوات', selectGuests: 'اختر الضيوف',
  yourMessage: 'رسالتك', invitationSent: 'تم إرسال الدعوة!',
  invitationStatus: 'حالة الدعوة', responded: 'استجاب', sent: 'أُرسلت',
  noInvitationsYet: 'لم ترسل أي دعوات بعد',

  // ── Venue Owner ──
  addNewVenue: '+ إضافة مكان جديد', venueName: 'اسم المكان',
  venueDescription: 'الوصف', capacityLabel: 'السعة (أشخاص)',
  dimensions: 'الأبعاد', address: 'العنوان', pricePerDay: 'السعر باليوم (ج.م)',
  pricePerHour: 'السعر بالساعة (ج.م)', availabilityCalendar: 'تقويم التوفر',
  markUnavailable: 'غير متاح', markAvailable: 'متاح',
  unavailable: 'غير متاح', available: 'متاح',
  totalBookings: 'إجمالي الطلبات', confirmedCount: 'الحجوزات المؤكدة',
  avgRatingVenue: 'متوسط التقييم', reviewCount: 'التقييمات',
  bookingStatus: 'حالة طلبات الحجز', feedbackSummary: 'ملخص التقييمات',
  exportCSVReport: '📥 تصدير CSV',
  approveBooking: 'موافقة', declineBooking: 'رفض', counterPropose: 'عرض مضاد',
  ownerMessage: 'رسالة للمنظم', counterDate: 'التاريخ المقترح',
  counterPrice: 'السعر المقترح (ج.م)', counterNotesLabel: 'ملاحظات العرض المضاد',
  submitResponse: 'إرسال الرد', bookingHistory: 'سجل الحجوزات',

  // ── Staff pages ──
  staffDashboard: 'لوحة تحكم الفريق', assignedEvents: 'الفعاليات المعينة',
  assignedTasks: 'المهام المعينة', upcomingEvents: 'الفعاليات القادمة',
  completedTasks: 'مكتملة', remainingTasks: 'متبقية',
  overdueAlert: 'لديك مهام متأخرة. يرجى إتمامها أو إبلاغ المنظم.',
  filterByDate: 'تصفية حسب التاريخ', updateStatus: 'تحديث الحالة',
  markArrived: '✓ وصل', undoArrived: '↩ تراجع',
  arrived: '✓ وصل', enRoute: 'في الطريق', expectedVendors: 'الموردون المتوقعون',
  guestCheckIn: 'تسجيل دخول الضيوف', searchGuest: 'بحث بالاسم أو QR...',
  checkInConfirm: 'تم التسجيل بنجاح', filterByStatus: 'تصفية حسب الحالة',

  // ── Vendor pages ──
  vendorDashboard: 'لوحة تحكم المورد', incomingSourcing: 'طلبات التوريد الواردة',
  deliveryTracking: 'تتبع التسليم', myInvoices: 'فواتيري',
  acceptRequest: 'قبول', declineRequest: 'رفض', sendMessage3: 'إرسال رسالة',
  updateDelivery: 'تحديث حالة التسليم', reportDelay: '⚠️ الإبلاغ عن تأخير',
  delayMessage: 'رسالة التأخير', confirmDelivery: 'تأكيد التسليم',
  createInvoice: 'إنشاء فاتورة', invoiceItems: 'بنود الفاتورة',
  addLineItem: '+ إضافة بند', totalAmount: 'إجمالي المبلغ (ج.م)',
  breakdown: 'تفاصيل / ملاحظات', submitInvoiceBtn: 'إرسال الفاتورة',
  invoicePending: 'قيد المراجعة', invoiceApproved: 'موافق عليه', invoicePaid: 'مدفوع',

  // ── Guest pages ──
  myInvitations: 'دعواتي', willYouAttend: 'هل ستحضر هذه الفعالية؟',
  yesAttending: '✅ نعم، سأكون هناك!', noAttending: '❌ آسف، لن أتمكن من الحضور',
  changeResponse: 'تغيير إلى', viewAgenda: '📋 عرض جدول الأعمال',
  yourResponse: 'ردك', dayOfUpdates: 'رسائل يوم الفعالية',
  noInvitations: 'لا توجد دعوات بعد', invitationsDesc: 'عندما يدعوك المنظمون، ستظهر الدعوات هنا.',
  myQRCode: 'رمز QR الخاص بي', showAtEntrance: 'أظهر هذا عند مدخل الفعالية',
  yourCheckInCode: 'رمز تسجيل الدخول الخاص بك',
  noEventsToRate: 'لا توجد فعاليات للتقييم',
  feedbackAvailableFor: 'التقييم متاح للفعاليات التي حضرتها.',
  selectEvent2: 'اختر الفعالية',

  // ── Profile ──
  profileInfo: '👤 معلومات الملف', changePassword: '🔒 تغيير كلمة المرور',
  notificationPrefs: '🔔 الإشعارات', fullName: 'الاسم الكامل',
  currentPassword: 'كلمة المرور الحالية', newPassword: 'كلمة المرور الجديدة',
  confirmPassword: 'تأكيد كلمة المرور', updateProfile: 'تحديث الملف',
  changePasswordBtn: 'تغيير كلمة المرور', emailNotifs: 'إشعارات البريد',
  pushNotifs: 'الإشعارات الفورية', inAppNotifs: 'إشعارات داخل التطبيق',
  restartTour: '🔄 إعادة الجولة التعريفية', newToPopeyez: 'جديد على PopEyez؟',
  restartTourDesc: 'يمكنك إعادة الجولة التعريفية لدورك في أي وقت.',

  // ── Notifications ──
  markAllRead: 'تحديد الكل كمقروء', noNotifications: 'لا توجد إشعارات',
  noNotifDesc: 'أنت محدّث!', unread: 'غير مقروء', all: 'الكل',

  // ── Auth ──
  signIn: 'تسجيل الدخول', signInDesc: 'تسجيل الدخول إلى حسابك',
  emailAddress: 'البريد الإلكتروني', passwordLabel: 'كلمة المرور',
  forgotPassword: 'نسيت كلمة المرور؟', noAccount: 'ليس لديك حساب؟',
  createOne: 'أنشئ حساباً', quickDemo: 'تسجيل دخول تجريبي',
  demoPassword: 'جميع الحسابات التجريبية تستخدم كلمة المرور:',
  createAccount: 'إنشاء حساب', createAccountDesc: 'إنشاء حسابك',
  fullNameLabel: 'الاسم الكامل *', phoneLabel: 'الهاتف',
  roleLabel: 'الدور *', confirmPasswordLabel: 'تأكيد كلمة المرور *',
  alreadyHaveAccount: 'لديك حساب بالفعل؟',
  eventOrganizer: 'منظم فعاليات', vendorSupplier: 'مورد', venueOwnerRole: 'مالك المكان', guestRole: 'ضيف',
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

  const dict = lang === 'ar' ? ar : en;
  const t = (key) => dict[key] || en[key] || key;

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

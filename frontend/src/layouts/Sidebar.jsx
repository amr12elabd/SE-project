import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

const getRoleMenus = (t) => ({
  organizer: [
    { section: t('overview') || 'Overview', items: [
      { to: '/dashboard', icon: '🏠', label: t('dashboard') },
      { to: '/events', icon: '📅', label: t('events') },
    ]},
    { section: t('venue') || 'Venue', items: [
      { to: '/venues', icon: '🏛️', label: t('venues') },
      { to: '/bookings', icon: '📋', label: t('bookings') },
    ]},
    { section: t('operations') || 'Operations', items: [
      { to: '/tasks', icon: '✅', label: t('tasks') },
      { to: '/staff', icon: '👥', label: t('staff') },
      { to: '/budget', icon: '💰', label: t('budget') },
      { to: '/layout', icon: '🗺️', label: t('layout') },
    ]},
    { section: t('vendorsGuests') || 'Vendors & Guests', items: [
      { to: '/vendors', icon: '🚚', label: t('vendors') },
      { to: '/sourcing', icon: '📦', label: t('sourcing') },
      { to: '/invoices', icon: '🧾', label: t('invoices') },
      { to: '/guests', icon: '🎟️', label: t('guests') },
      { to: '/invitations', icon: '✉️', label: t('invitations') },
    ]},
    { section: t('dayOfSection') || 'Day-Of', items: [
      { to: '/day-of', icon: '⚡', label: t('dayOf') },
      { to: '/communications', icon: '💬', label: t('communications') },
    ]},
    { section: t('insights') || 'Insights', items: [
      { to: '/feedback', icon: '⭐', label: t('feedback') },
      { to: '/reports', icon: '📊', label: t('reports') },
    ]},
    { section: t('account') || 'Account', items: [
      { to: '/profile', icon: '👤', label: t('profile') },
      { to: '/notifications', icon: '🔔', label: t('notifications') },
      { to: '/history', icon: '🕑', label: t('history') },
    ]},
  ],
  staff: [
    { section: t('overview') || 'Overview', items: [
      { to: '/dashboard', icon: '🏠', label: t('dashboard') },
      { to: '/my-events', icon: '📅', label: t('myEvents') || 'My Events' },
      { to: '/my-tasks', icon: '✅', label: t('myTasks') || 'My Tasks' },
    ]},
    { section: t('dayOfSection') || 'Day-Of', items: [
      { to: '/layout-view', icon: '🗺️', label: t('floorPlan') || 'View Floor Plan' },
      { to: '/checkin', icon: '🎟️', label: t('checkIn') || 'Guest Check-In' },
      { to: '/vendor-arrivals', icon: '🚚', label: t('vendorArrivals') || 'Vendor Arrivals' },
    ]},
    { section: t('account') || 'Account', items: [
      { to: '/profile', icon: '👤', label: t('profile') },
      { to: '/notifications', icon: '🔔', label: t('notifications') },
      { to: '/history', icon: '🕑', label: t('history') },
    ]},
  ],
  vendor: [
    { section: t('overview') || 'Overview', items: [
      { to: '/dashboard', icon: '🏠', label: t('dashboard') },
      { to: '/vendor/profile', icon: '🏢', label: t('profile') },
      { to: '/vendor/catalogue', icon: '📋', label: t('catalogue') || 'Product Catalogue' },
    ]},
    { section: t('orders') || 'Orders', items: [
      { to: '/vendor/sourcing', icon: '📥', label: t('sourcing') },
      { to: '/vendor/delivery', icon: '🚚', label: t('delivery') || 'Delivery Status' },
    ]},
    { section: t('finance') || 'Finance', items: [
      { to: '/vendor/submit-invoice', icon: '🧾', label: t('submitInvoice') || 'Submit Invoice' },
      { to: '/vendor/invoices', icon: '💳', label: t('invoiceStatus') || 'Invoice Status' },
    ]},
    { section: t('account') || 'Account', items: [
      { to: '/notifications', icon: '🔔', label: t('notifications') },
      { to: '/history', icon: '🕑', label: t('history') },
    ]},
  ],
  guest: [
    { section: t('myEvents') || 'My Events', items: [
      { to: '/dashboard', icon: '🏠', label: t('dashboard') },
      { to: '/guest/invitation', icon: '✉️', label: t('invitations') },
      { to: '/guest/messages', icon: '💬', label: t('dayOfMessages') || 'Day-Of Messages' },
      { to: '/guest/qr', icon: '📱', label: t('qrPass') || 'QR Check-In Pass' },
      { to: '/guest/feedback', icon: '⭐', label: t('submitFeedback') || 'Submit Feedback' },
    ]},
    { section: t('account') || 'Account', items: [
      { to: '/profile', icon: '👤', label: t('profile') },
      { to: '/history', icon: '🕑', label: t('history') },
    ]},
  ],
  venueOwner: [
    { section: t('overview') || 'Overview', items: [
      { to: '/dashboard', icon: '🏠', label: t('dashboard') },
      { to: '/venue/listings', icon: '🏛️', label: t('myVenues') || 'My Venues' },
      { to: '/venue/bookings', icon: '📋', label: t('bookings') },
      { to: '/venue/confirmed', icon: '✅', label: t('confirmedBookings') || 'Confirmed Bookings' },
    ]},
    { section: t('insights') || 'Insights', items: [
      { to: '/venue/reports', icon: '📊', label: t('reports') },
    ]},
    { section: t('account') || 'Account', items: [
      { to: '/profile', icon: '👤', label: t('profile') },
      { to: '/notifications', icon: '🔔', label: t('notifications') },
      { to: '/history', icon: '🕑', label: t('history') },
    ]},
  ],
});

const roleColors = {
  organizer: '#1a6b5c', staff: '#2563eb', vendor: '#7c3aed', guest: '#d4875a', venueOwner: '#0891b2'
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang } = useLang();

  if (!user) return null;

  const menu = getRoleMenus(t)[user.role] || [];
  const initials = user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const color = roleColors[user.role] || 'var(--primary)';
  const roleLabel = {
    organizer: lang === 'ar' ? 'منظم فعاليات' : 'Event Organizer',
    staff: lang === 'ar' ? 'فريق العمل' : 'Staff Member',
    vendor: lang === 'ar' ? 'مورد' : 'Vendor',
    guest: lang === 'ar' ? 'ضيف' : 'Guest',
    venueOwner: lang === 'ar' ? 'مالك المكان' : 'Venue Owner',
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>☕</div>
        <div>
          <div className="sidebar-logo-text">PopEyez</div>
          <div className="sidebar-logo-sub">Café Event Platform</div>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', paddingBottom: 12 }}>
        {menu.map((section, si) => (
          <div key={si} className="sidebar-section">
            <div className="sidebar-section-title">{section.section}</div>
            {section.items.map((item, ii) => (
              <NavLink
                key={ii}
                to={item.to}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar" style={{ background: color }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name truncate">{user.name}</div>
            <div className="sidebar-user-role">{roleLabel[user.role]}</div>
          </div>
          <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 18 }}>⏻</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleMenus = {
  organizer: [
    { section: 'Overview', items: [
      { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
      { to: '/events', icon: '📅', label: 'Events' },
    ]},
    { section: 'Venue', items: [
      { to: '/venues', icon: '🏛️', label: 'Venue Search' },
      { to: '/bookings', icon: '📋', label: 'Booking Requests' },
    ]},
    { section: 'Operations', items: [
      { to: '/tasks', icon: '✅', label: 'Tasks & Workflow' },
      { to: '/staff', icon: '👥', label: 'Staff Management' },
      { to: '/budget', icon: '💰', label: 'Budget Management' },
      { to: '/layout', icon: '🗺️', label: 'Venue Layout' },
    ]},
    { section: 'Vendors & Guests', items: [
      { to: '/vendors', icon: '🚚', label: 'Vendor Directory' },
      { to: '/sourcing', icon: '📦', label: 'Sourcing Requests' },
      { to: '/invoices', icon: '🧾', label: 'Invoice Review' },
      { to: '/guests', icon: '🎟️', label: 'Guest Management' },
      { to: '/invitations', icon: '✉️', label: 'Invitations' },
    ]},
    { section: 'Day-Of', items: [
      { to: '/day-of', icon: '⚡', label: 'Day-Of Dashboard' },
      { to: '/communications', icon: '💬', label: 'Communications' },
    ]},
    { section: 'Insights', items: [
      { to: '/feedback', icon: '⭐', label: 'Feedback Review' },
      { to: '/reports', icon: '📊', label: 'Reports & Analytics' },
    ]},
    { section: 'Account', items: [
      { to: '/profile', icon: '👤', label: 'My Profile' },
      { to: '/notifications', icon: '🔔', label: 'Notifications' },
    ]},
  ],
  staff: [
    { section: 'Overview', items: [
      { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
      { to: '/my-events', icon: '📅', label: 'My Events' },
      { to: '/my-tasks', icon: '✅', label: 'My Tasks' },
    ]},
    { section: 'Day-Of', items: [
      { to: '/layout-view', icon: '🗺️', label: 'View Floor Plan' },
      { to: '/checkin', icon: '🎟️', label: 'Guest Check-In' },
      { to: '/vendor-arrivals', icon: '🚚', label: 'Vendor Arrivals' },
    ]},
    { section: 'Account', items: [
      { to: '/profile', icon: '👤', label: 'My Profile' },
      { to: '/notifications', icon: '🔔', label: 'Notifications' },
    ]},
  ],
  vendor: [
    { section: 'Overview', items: [
      { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
      { to: '/vendor/profile', icon: '🏢', label: 'My Profile' },
      { to: '/vendor/catalogue', icon: '📋', label: 'Product Catalogue' },
    ]},
    { section: 'Orders', items: [
      { to: '/vendor/sourcing', icon: '📥', label: 'Sourcing Requests' },
      { to: '/vendor/delivery', icon: '🚚', label: 'Delivery Status' },
    ]},
    { section: 'Finance', items: [
      { to: '/vendor/submit-invoice', icon: '🧾', label: 'Submit Invoice' },
      { to: '/vendor/invoices', icon: '💳', label: 'Invoice Status' },
    ]},
    { section: 'Account', items: [
      { to: '/notifications', icon: '🔔', label: 'Notifications' },
    ]},
  ],
  guest: [
    { section: 'My Events', items: [
      { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
      { to: '/guest/invitation', icon: '✉️', label: 'My Invitations' },
      { to: '/guest/messages', icon: '💬', label: 'Day-Of Messages' },
      { to: '/guest/qr', icon: '📱', label: 'QR Check-In Pass' },
      { to: '/guest/feedback', icon: '⭐', label: 'Submit Feedback' },
    ]},
    { section: 'Account', items: [
      { to: '/profile', icon: '👤', label: 'My Profile' },
    ]},
  ],
  venueOwner: [
    { section: 'Overview', items: [
      { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
      { to: '/venue/listings', icon: '🏛️', label: 'My Venues' },
      { to: '/venue/bookings', icon: '📋', label: 'Booking Requests' },
      { to: '/venue/confirmed', icon: '✅', label: 'Confirmed Bookings' },
    ]},
    { section: 'Insights', items: [
      { to: '/venue/reports', icon: '📊', label: 'Performance Reports' },
    ]},
    { section: 'Account', items: [
      { to: '/profile', icon: '👤', label: 'My Profile' },
      { to: '/notifications', icon: '🔔', label: 'Notifications' },
    ]},
  ],
};

const roleColors = {
  organizer: '#1a6b5c', staff: '#2563eb', vendor: '#7c3aed', guest: '#d4875a', venueOwner: '#0891b2'
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const menu = roleMenus[user.role] || [];
  const initials = user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const color = roleColors[user.role] || 'var(--primary)';
  const roleLabel = { organizer: 'Event Organizer', staff: 'Staff Member', vendor: 'Vendor', guest: 'Guest', venueOwner: 'Venue Owner' };

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

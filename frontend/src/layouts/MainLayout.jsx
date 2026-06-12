import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../api';
import { ToastProvider } from '../components/Toast';

const MainLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await notificationsAPI.getAll({ isRead: false });
        setUnreadCount(res.data.unreadCount || 0);
      } catch { /* silent */ }
    };
    if (user) fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <ToastProvider>
      <div className="layout">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49 }} />
        )}

        <div className={sidebarOpen ? 'sidebar open' : 'sidebar'} style={sidebarOpen ? { transform: 'translateX(0)' } : {}}>
          <Sidebar />
        </div>

        <div className="main-content">
          {/* Navbar */}
          <header className="navbar">
            <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(s => !s)}
              style={{ display: 'none' }} id="mobile-menu-btn">☰</button>
            <span className="navbar-title">PopEyez Platform</span>
            <div className="navbar-actions">
              <div className="notif-badge" onClick={() => navigate('/notifications')}>
                🔔
                {unreadCount > 0 && <span className="notif-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </div>
              <div className="flex items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
                <div className="avatar avatar-sm" style={{ background: 'var(--primary)' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium" style={{ display: 'none' }}>{user?.name}</span>
              </div>
            </div>
          </header>

          <main className="page">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};

export default MainLayout;

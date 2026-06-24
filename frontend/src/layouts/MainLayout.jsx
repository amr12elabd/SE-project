import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLang } from '../context/LanguageContext';
import { notificationsAPI, eventsAPI, guestsAPI } from '../api';
import { ToastProvider, useToast } from '../components/Toast';

const todayKey = () => new Date().toISOString().slice(0, 10);

const SocketNotificationListener = () => {
  const socketRef = useSocket();
  const toast = useToast();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;
    const handler = (notif) => {
      const icons = { booking: '🏛️', task: '✅', invoice: '🧾', general: '🔔' };
      toast(`${icons[notif.type] || '🔔'} ${notif.title}`, 'info');
      setUnread(n => n + 1);
    };
    socket.on('notification', handler);
    return () => socket.off('notification', handler);
  }, [socketRef?.current]);

  return null;
};

const MainLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { lang, toggleLang } = useLang();
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reminder, setReminder] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []); // { eventName, guests[] }

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

  // Daily guest reminder — show once per day on first open
  useEffect(() => {
    if (!user || !['organizer', 'staff'].includes(user.role)) return;
    const key = `guestReminder_${todayKey()}`;
    if (localStorage.getItem(key)) return;

    const checkToday = async () => {
      try {
        const evRes = await eventsAPI.getAll();
        const today = todayKey();
        const todayEvents = evRes.data.filter(e => e.date?.slice(0, 10) === today);
        if (todayEvents.length === 0) return;

        const allGuests = [];
        for (const ev of todayEvents) {
          const gRes = await guestsAPI.getAll({ event: ev._id });
          allGuests.push({ eventName: ev.name, guests: gRes.data });
        }

        const relevant = allGuests.filter(e => e.guests.length > 0);
        if (relevant.length > 0) {
          setReminder(relevant);
          localStorage.setItem(key, '1');
        }
      } catch { /* silent */ }
    };
    checkToday();
  }, [user]);

  return (
    <ToastProvider>
      <SocketNotificationListener />
      {/* Daily guest reminder modal */}
      {reminder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 22 }}>☕ Today's Guest List</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
              </div>
              <button onClick={() => setReminder(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}>✕</button>
            </div>

            {reminder.map((ev, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary)', marginBottom: 10, padding: '6px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  📅 {ev.eventName} — {ev.guests.length} guests
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ev.guests.map(g => (
                    <div key={g._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: g.checkInStatus ? '#f0fff4' : 'white', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{g.guestName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{g.group} · {g.rsvpStatus}</div>
                        {g.dietaryPreferences?.length > 0 && <div style={{ fontSize: 11, color: 'var(--info)' }}>🥗 {g.dietaryPreferences.join(', ')}</div>}
                        {g.allergies?.length > 0 && <div style={{ fontSize: 11, color: 'var(--danger)' }}>⚠️ {g.allergies.join(', ')}</div>}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: g.checkInStatus ? 'var(--success)' : g.rsvpStatus === 'Not Attending' ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {g.checkInStatus ? '✓ In' : g.rsvpStatus === 'Not Attending' ? '✗' : '⏳'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setReminder(null); navigate('/check-in'); }}>
                Go to Check-In
              </button>
              <button className="btn btn-outline" onClick={() => setReminder(null)}>Dismiss</button>
            </div>
          </div>
        </div>
      )}

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
              {installPrompt && (
                <button onClick={() => { installPrompt.prompt(); installPrompt.userChoice.then(() => setInstallPrompt(null)); }} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                  📲 Install App
                </button>
              )}
              <button onClick={toggleLang} title="Toggle Arabic/English" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {lang === 'en' ? '🇪🇬 عربي' : '🇬🇧 EN'}
              </button>
              <div className="notif-badge" onClick={() => navigate('/notifications')} title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'} style={{ position: 'relative' }}>
                🔔
                {unreadCount > 0 && (
                  <span className="notif-count" style={{ animation: 'pulse 2s infinite' }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </div>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => navigate('/profile')}>
                <div className="avatar avatar-sm" style={{ background: 'var(--primary)', border: '2px solid var(--primary-light)' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user?.name?.split(' ')[0]}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role === 'venueOwner' ? 'Venue Owner' : user?.role}</div>
                </div>
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

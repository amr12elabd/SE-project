import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';

const features = [
  { icon: '📅', title: 'Event Planning', desc: 'Create and manage pop-up café events from conception to completion.' },
  { icon: '🏛️', title: 'Venue Booking', desc: 'Search and book venues in Cairo with smart filtering and real-time availability.' },
  { icon: '💰', title: 'Budget Tracking', desc: 'Plan budgets, track actual expenses, and get alerts when costs exceed limits.' },
  { icon: '🚚', title: 'Vendor Management', desc: 'Coordinate suppliers, track deliveries, and manage invoices seamlessly.' },
  { icon: '🎟️', title: 'Guest Management', desc: 'Send invitations, track RSVPs, manage check-ins with QR codes.' },
  { icon: '📊', title: 'Analytics & Reports', desc: 'Generate attendance, financial, and feedback reports with visual charts.' },
];

const roles = [
  { icon: '👑', role: 'Event Organizer', desc: 'Manage events end-to-end', color: '#1a6b5c' },
  { icon: '👷', role: 'Staff Member', desc: 'Execute tasks and manage check-ins', color: '#2563eb' },
  { icon: '🚚', role: 'Vendor', desc: 'Handle orders and invoices', color: '#7c3aed' },
  { icon: '🎟️', role: 'Guest', desc: 'RSVP and enjoy the event', color: '#d4875a' },
  { icon: '🏛️', role: 'Venue Owner', desc: 'List and manage venues', color: '#0891b2' },
];

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      {/* Header */}
      <header style={{ background: 'var(--primary-dark)', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>☕</span>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '1.3rem' }}>PopEyez</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Café Event Platform</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }} onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-secondary" onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 60%, var(--secondary) 100%)', padding: '80px 40px', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>☕</div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 20 }}>PopEyez</h1>
        <p style={{ fontSize: '1.3rem', opacity: 0.9, maxWidth: 600, margin: '0 auto 32px' }}>
          The all-in-one platform for managing pop-up café events. From venue booking to guest check-ins — everything in one place.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-lg" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700 }} onClick={() => navigate('/register')}>Start Planning Your Event</button>
          <button className="btn btn-lg btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }} onClick={() => navigate('/login')}>View Demo</button>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 40px', background: '#f8fafc' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 48, fontSize: '1.8rem' }}>Everything You Need</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
          {features.map((f, i) => (
            <div key={i} className="card card-body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section style={{ padding: '80px 40px', background: 'white' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 12, fontSize: '1.8rem' }}>Built for Every Role</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 48 }}>Each stakeholder gets their own tailored experience</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 900, margin: '0 auto' }}>
          {roles.map((r, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '24px 20px', border: '2px solid var(--border)', borderRadius: 12, minWidth: 140, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = r.color; e.currentTarget.style.background = r.color + '10'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'white'; }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{r.icon}</div>
              <div style={{ fontWeight: 600, marginBottom: 4, color: r.color }}>{r.role}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Credentials */}
      <section style={{ padding: '60px 40px', background: 'var(--primary-dark)', color: 'white' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 8 }}>Demo Credentials</h2>
        <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: 32 }}>Try the platform with any of these accounts</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, maxWidth: 900, margin: '0 auto' }}>
          {[
            { role: 'Organizer', email: 'organizer@popeyez.com' },
            { role: 'Staff', email: 'staff@popeyez.com' },
            { role: 'Vendor', email: 'vendor@popeyez.com' },
            { role: 'Guest', email: 'guest@popeyez.com' },
            { role: 'Venue Owner', email: 'venueowner@popeyez.com' },
          ].map((c, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: 8, cursor: 'pointer' }}
              onClick={() => navigate('/login', { state: { email: c.email } })}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{c.role}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.8 }}>{c.email}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.6 }}>password123</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px 40px', background: '#0f3d33', color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontSize: 13 }}>
        © 2026 PopEyez — Pop-Up Café Event Management Platform. Built for Software Engineering Course.
      </footer>
    </div>
  );
};

export default Landing;

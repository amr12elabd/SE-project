import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const demoCredentials = [
  { name: 'Sara Hassan',          role: 'Organizer',    email: 'organizer@popeyez.com' },
  { name: 'Rami Adel',            role: 'Organizer',    email: 'organizer2@popeyez.com' },
  { name: 'Ahmed Karim',          role: 'Staff',        email: 'staff@popeyez.com' },
  { name: 'Nour El-Din',          role: 'Staff',        email: 'staff2@popeyez.com' },
  { name: 'Lina Saad',            role: 'Staff',        email: 'staff3@popeyez.com' },
  { name: 'Khaled Mansour',       role: 'Staff',        email: 'staff4@popeyez.com' },
  { name: "Atwa's Bakery",         role: 'Vendor',       email: 'vendor@popeyez.com' },
  { name: 'Cairo Coffee Supplies',role: 'Vendor',       email: 'vendor2@popeyez.com' },
  { name: 'Nile Equipment',       role: 'Vendor',       email: 'vendor3@popeyez.com' },
  { name: 'Nour Floral Design',   role: 'Vendor',       email: 'vendor4@popeyez.com' },
  { name: 'SoundWave Productions',role: 'Vendor',       email: 'vendor5@popeyez.com' },
  { name: 'Seifedin Khaled',      role: 'Venue Owner',  email: 'venueowner@popeyez.com' },
  { name: 'Layla Nasser',         role: 'Venue Owner',  email: 'venueowner2@popeyez.com' },
  { name: 'Tarek Bishara',        role: 'Venue Owner',  email: 'venueowner3@popeyez.com' },
  { name: 'Yasmin Ibrahim',       role: 'Guest',        email: 'guest@popeyez.com' },
  { name: 'Shady Peter',          role: 'Guest',        email: 'shady@popeyez.com' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) navigate('/dashboard');
    if (location.state?.email) setEmail(location.state.email);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter email and password'); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (cred) => {
    setEmail(cred.email);
    setPassword('password123');
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize: 48 }}>☕</div>
          <h1>PopEyez</h1>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="alert alert-danger mb-4">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="Enter your password"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>

        <hr className="divider" style={{ margin: '24px 0' }} />
        <div style={{ marginBottom: 10, color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Demo Login</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {demoCredentials.map((c, i) => (
            <button key={i} onClick={() => quickLogin(c)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '7px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light, #ede9fe)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--border)', borderRadius: 4, padding: '2px 7px', marginLeft: 8, whiteSpace: 'nowrap' }}>[{c.role}]</span>
            </button>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>All accounts use password: <strong>password123</strong></p>
      </div>
    </div>
  );
};

export default Login;

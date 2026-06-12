import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const demoCredentials = [
  { role: 'Organizer', email: 'organizer@popeyez.com' },
  { role: 'Staff', email: 'staff@popeyez.com' },
  { role: 'Vendor', email: 'vendor@popeyez.com' },
  { role: 'Guest', email: 'guest@popeyez.com' },
  { role: 'Venue Owner', email: 'venueowner@popeyez.com' },
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
        <div style={{ marginBottom: 12, color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Demo Login</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {demoCredentials.map((c, i) => (
            <button key={i} className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)', justifyContent: 'flex-start', fontSize: 12 }}
              onClick={() => quickLogin(c)}>
              {c.role}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>All demo accounts use password: <strong>password123</strong></p>
      </div>
    </div>
  );
};

export default Login;

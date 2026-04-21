import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import { BookOpen, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { loginUser, isLibrarian, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form.userName, form.password);
      loginUser(res.data);
      // Normalize role for comparison — DB may store 'Admin', 'admin', 'ROLE_ADMIN', etc.
      const rawRole = res.data.role || '';
      const role = rawRole.toUpperCase().replace(/^ROLE_/, '');
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'LIBRARIAN') navigate('/librarian');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d3a7a 50%, #0a1628 100%)' }}>

      {/* Decorative circles */}
      <div style={{ position: 'fixed', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(13,110,253,0.1)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -150, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(13,110,253,0.07)', pointerEvents: 'none' }} />

      <div className="container" style={{ maxWidth: 440 }}>
        <div className="card border-0 shadow-lg" style={{ borderRadius: 20, overflow: 'hidden' }}>
          {/* Header */}
          <div className="text-center py-5 px-4" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d6efd 100%)' }}>
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning mb-3" style={{ width: 64, height: 64 }}>
              <BookOpen size={30} className="text-dark" />
            </div>
            <h2 className="text-white fw-bold mb-1">Welcome Back</h2>
            <p className="text-white-50 mb-0">Sign in to your library account</p>
          </div>

          {/* Body */}
          <div className="card-body p-4 p-md-5">
            {error && (
              <div className="alert alert-danger border-0 rounded-3 d-flex align-items-center gap-2 mb-4" style={{ fontSize: '0.875rem' }}>
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Username</label>
                <input
                  id="login-username"
                  type="text"
                  className="form-control form-control-lg border-0 bg-light"
                  placeholder="Enter your username"
                  value={form.userName}
                  onChange={e => setForm({ ...form, userName: e.target.value })}
                  required
                  style={{ borderRadius: 12, fontSize: '0.95rem' }}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Password</label>
                <div className="position-relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control form-control-lg border-0 bg-light pe-5"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    style={{ borderRadius: 12, fontSize: '0.95rem' }}
                  />
                  <button type="button" className="btn btn-link position-absolute top-50 end-0 translate-middle-y pe-3"
                    onClick={() => setShowPassword(!showPassword)} style={{ color: '#6c757d' }}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button id="login-submit" type="submit" className="btn btn-primary btn-lg w-100 fw-semibold"
                disabled={loading} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #0d6efd, #0a58ca)', border: 'none' }}>
                {loading ? (
                  <span><span className="spinner-border spinner-border-sm me-2" />Signing in…</span>
                ) : (
                  <span><LogIn size={18} className="me-2" />Sign In</span>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-muted" style={{ fontSize: '0.875rem' }}>Don't have an account? </span>
              <Link to="/register" className="text-primary fw-semibold text-decoration-none" style={{ fontSize: '0.875rem' }}>
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, LayoutDashboard, Shield, BookMarked } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { auth, userProfile, logout, isAdmin, isLibrarian } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (isAdmin()) return '/admin';
    if (isLibrarian()) return '/librarian';
    return '/dashboard';
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top shadow-sm" style={{ background: '#ffffff', zIndex: 1040 }}>
      <div className="container-fluid px-4 py-1">
        {/* Sidebar toggle for all */}
        {auth && (
          <button className="btn btn-link me-3 p-0" style={{ color: '#57534e' }} onClick={onToggleSidebar}>
            <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        )}

        {/* Brand */}
        <a className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4 me-4" href={auth ? "/home" : "/"}>
          <BookOpen size={28} style={{ color: 'var(--primary)' }} />
          <span>Scanexus</span>
        </a>

        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {auth && (
              <li className="nav-item">
                <a className="nav-link" href="/home"><BookOpen size={16} className="me-1" />Home</a>
              </li>
            )}
            {auth && !isLibrarian() && !isAdmin() && (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="/dashboard"><LayoutDashboard size={16} className="me-1" />Dashboard</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/issued"><BookMarked size={16} className="me-1" />My Books</a>
                </li>
              </>
            )}
            {auth && !isLibrarian() && isAdmin() && (
              <li className="nav-item">
                <a className="nav-link" href="/dashboard"><LayoutDashboard size={16} className="me-1" />User View</a>
              </li>
            )}
            {isLibrarian() && (
              <li className="nav-item">
                <a className="nav-link" href="/librarian"><LayoutDashboard size={16} className="me-1" />Librarian Panel</a>
              </li>
            )}
            {isAdmin() && (
              <li className="nav-item">
                <a className="nav-link" href="/admin"><Shield size={16} className="me-1" />Admin Panel</a>
              </li>
            )}
          </ul>

          {auth ? (
            <div className="d-flex align-items-center gap-4 ms-auto">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <User size={20} />
                </div>
                <div className="d-none d-md-block text-dark">
                  <div className="fw-semibold lh-1 text-dark" style={{ fontSize: '0.95rem' }}>{userProfile?.userName || 'User'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#78716c' }}>{auth.role}</div>
                </div>
              </div>
              <div className="d-flex gap-2">
                <Link to="/profile" className="btn btn-sm text-dark px-3 fw-semibold" style={{ background: '#f5f5f4', borderRadius: '12px' }}>
                  <User size={16} className="me-1" /> Profile
                </Link>
                <button className="btn btn-sm px-3 fw-semibold" style={{ background: 'var(--primary)', color: '#fff', borderRadius: '12px' }} onClick={handleLogout}>
                  <LogOut size={16} className="me-1" /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="d-flex gap-3 ms-auto">
              <a href="/login" className="btn btn-outline-secondary rounded-pill px-4" style={{ fontWeight: 600 }}>Login</a>
              <a href="/register" className="btn rounded-pill px-4 text-white fw-bold" style={{ background: 'var(--primary)' }}>Sign Up</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

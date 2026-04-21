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
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top shadow-sm" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d6efd 100%)' }}>
      <div className="container-fluid px-3">
        {/* Sidebar toggle for librarian/admin */}
        {(isLibrarian() || isAdmin()) && (
          <button className="btn btn-link text-white me-2 p-0" onClick={onToggleSidebar}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        )}

        {/* Brand */}
        <a className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-5" href={getDashboardPath()}>
          <BookOpen size={24} className="text-warning" />
          <span>LibraryMS</span>
        </a>

        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {auth && !isLibrarian() && (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="/dashboard"><LayoutDashboard size={16} className="me-1" />Dashboard</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/issued"><BookMarked size={16} className="me-1" />My Books</a>
                </li>
              </>
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
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                  <User size={16} className="text-dark" />
                </div>
                <div className="d-none d-md-block text-white">
                  <div className="fw-semibold lh-1" style={{ fontSize: '0.85rem' }}>{userProfile?.userName || 'User'}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{auth.role}</div>
                </div>
              </div>
              <div className="d-flex gap-2">
                <Link to="/profile" className="btn btn-sm btn-light rounded-pill px-3 fw-semibold">
                  <User size={14} className="me-1" /> Profile
                </Link>
                <button className="btn btn-sm btn-outline-light rounded-pill px-3 fw-semibold" onClick={handleLogout}>
                  <LogOut size={14} className="me-1" /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="d-flex gap-2">
              <a href="/login" className="btn btn-sm btn-outline-light rounded-pill px-3">Login</a>
              <a href="/register" className="btn btn-sm btn-warning rounded-pill px-3 text-dark fw-semibold">Sign Up</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

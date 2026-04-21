import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Heart, Clock, Star,
  Users, PlusCircle, ArrowLeftRight, Shield, BookMarked, Settings
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin, isLibrarian } = useAuth();
  const navigate = useNavigate();

  const go = (path) => { navigate(path); if (window.innerWidth < 992) onClose(); };

  const userLinks = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <BookOpen size={18} />, label: 'Browse Books', path: '/dashboard' },
    { icon: <BookMarked size={18} />, label: 'Issued Books', path: '/issued' },
    { icon: <Heart size={18} />, label: 'Favourites', path: '/favourites' },
    { icon: <Clock size={18} />, label: 'Waiting List', path: '/waiting-list' },
  ];

  const librarianLinks = [
    { icon: <LayoutDashboard size={18} />, label: 'Overview', path: '/librarian' },
    { icon: <PlusCircle size={18} />, label: 'Add Book', path: '/librarian' },
    { icon: <ArrowLeftRight size={18} />, label: 'Issue / Return', path: '/librarian' },
    { icon: <Users size={18} />, label: 'Users', path: '/librarian' },
    { icon: <BookOpen size={18} />, label: 'Books List', path: '/librarian' },
  ];

  const adminLinks = [
    { icon: <Shield size={18} />, label: 'Admin Panel', path: '/admin' },
    { icon: <Users size={18} />, label: 'Manage Users', path: '/admin' },
    { icon: <BookOpen size={18} />, label: 'Manage Books', path: '/admin' },
    { icon: <Settings size={18} />, label: 'Fine Rules', path: '/admin' },
    { icon: <Star size={18} />, label: 'QR Management', path: '/admin' },
  ];

  const links = isAdmin() ? adminLinks : isLibrarian() ? librarianLinks : userLinks;

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div className="d-lg-none position-fixed top-0 start-0 w-100 h-100" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1040 }} onClick={onClose} />
      )}

      <aside className="position-fixed h-100 d-flex flex-column" style={{
        top: 0, left: 0, width: 240, paddingTop: 64, zIndex: 1045,
        background: 'linear-gradient(180deg, #0a1628 0%, #112240 100%)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
      }}>
        <div className="flex-grow-1 overflow-auto py-3">
          <div className="px-3 mb-2">
            <small className="text-uppercase text-secondary fw-semibold" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
              {isAdmin() ? 'Admin Menu' : isLibrarian() ? 'Librarian Menu' : 'My Library'}
            </small>
          </div>
          {links.map((link) => (
            <button key={link.label} onClick={() => go(link.path)}
              className="d-flex align-items-center gap-3 w-100 text-start border-0 px-3 py-2 mb-1"
              style={{ background: 'transparent', color: 'rgba(255,255,255,0.8)', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(13,110,253,0.25)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}>
              <span style={{ opacity: 0.7 }}>{link.icon}</span>
              {link.label}
            </button>
          ))}
        </div>
        <div className="p-3 border-top border-secondary">
          <small className="text-secondary" style={{ fontSize: '0.7rem' }}>LibraryMS v1.0</small>
        </div>
      </aside>
    </>
  );
}

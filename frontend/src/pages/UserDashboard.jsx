import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRecommendations } from '../services/api';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import BookCard from '../components/BookCard';
import { BookMarked, Heart, Clock, ChevronRight, Sparkles, BookOpen } from 'lucide-react';

/* ─── Genre helper ─── */
const getGenreString = (genre) => {
  if (!genre) return '';
  if (typeof genre === 'string') return genre;
  if (Array.isArray(genre)) return genre.map(g => (typeof g === 'object' ? g.name : g)).join(', ');
  if (typeof genre === 'object') return genre.name || '';
  return String(genre);
};

export default function UserDashboard() {
  const { userProfile, isAdmin, isLibrarian } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  const isRegularUser = !isAdmin() && !isLibrarian();

  /* ── Fetch recommendations only for regular users ── */
  useEffect(() => {
    if (isRegularUser && userProfile?.userId) {
      fetchRecommendations();
    }
  }, [userProfile?.userId]);

  const fetchRecommendations = async () => {
    setRecLoading(true);
    try {
      const res = await getRecommendations(userProfile.userId);
      setRecommendations(Array.isArray(res.data) ? res.data : []);
    } catch {
      /* recommendations are optional — fail silently */
    } finally {
      setRecLoading(false);
    }
  };



  return (
    <div style={{ paddingTop: 10, minHeight: '100vh', background: 'transparent' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', borderRadius: '24px', margin: '0 1rem', color: '#fff', padding: '3rem 2rem 2.5rem' }}>
        <div className="container">
          <h1 className="fw-bold mb-1" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
            Hello, {userProfile?.userName || 'Reader'} 👋
          </h1>
          <p className="mb-0" style={{ opacity: 0.8 }}>Manage your library activity below.</p>
        </div>
      </div>

      <div className="container py-4">

        {/* ══ Recommended for You — regular users only ══ */}
        {isRegularUser && (
          <div style={{ marginTop: '0.5rem' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <Sparkles size={24} style={{ color: '#f59e0b' }} />
              <h4 className="fw-bold mb-0 text-dark">Recommended for You</h4>
              {recommendations.length > 0 && (
                <span style={{
                  background: '#fef3c7', color: '#92400e',
                  borderRadius: 8, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700,
                }}>{recommendations.length} books</span>
              )}
            </div>

            {recLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div className="spinner-border" style={{ color: 'var(--primary)', width: 32, height: 32 }} role="status" />
                <p style={{ marginTop: 12, color: '#6b7280', fontSize: '0.88rem' }}>Finding books you'll love…</p>
              </div>
            ) : recommendations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#9ca3af' }}>
                <BookOpen size={48} style={{ opacity: 0.25 }} />
                <p style={{ marginTop: 8, fontSize: '0.88rem' }}>No recommendations yet — borrow some books to get personalized suggestions!</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.25rem',
              }}>
                {recommendations.map(book => (
                  <BookCard key={book.bookId} book={book} onToast={setToast} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

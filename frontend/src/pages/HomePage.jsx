import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getPopularBooks, getLatestBooks, getRecommendations, filterBooks as apiFilterBooks,
} from '../services/api';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import {
  Sparkles, TrendingUp, Clock, BookOpen,
  LayoutDashboard, Shield, Search, SlidersHorizontal, X, Star,
} from 'lucide-react';

/* ─── Genre helper ─── */
const getGenreString = (genre) => {
  if (!genre) return '';
  if (typeof genre === 'string') return genre;
  if (Array.isArray(genre)) return genre.map(g => (typeof g === 'object' ? g.name : g)).join(', ');
  if (typeof genre === 'object') return genre.name || '';
  return String(genre);
};

const EMPTY_FILTERS = {
  title: '',
  author: '',
  genre: '',
  minRating: '',
  minPages: '',
  maxPages: '',
  availableCopies: '',
};

const inp = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 10,
  border: '1.5px solid #e2e8f0',
  background: '#f8fafc',
  fontSize: '0.85rem',
  outline: 'none',
  color: '#1e293b',
  transition: 'border-color .15s',
};

export default function HomePage() {
  const { auth, userProfile, isAdmin, isLibrarian } = useAuth();
  const navigate = useNavigate();

  const [popularBooks, setPopularBooks] = useState([]);
  const [latestBooks, setLatestBooks] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  /* ── Filter panel ── */
  const [panelOpen, setPanelOpen] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [draft, setDraft] = useState(EMPTY_FILTERS); // editing state inside panel

  /* ── Filter results ── */
  const [filterResults, setFilterResults] = useState(null); // null = show home sections
  const [filterLoading, setFilterLoading] = useState(false);

  /* ── Quick search bar (maps to title param) ── */
  const [quickSearch, setQuickSearch] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => { fetchHomeData(); }, [auth, userProfile?.userId]);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const [popRes, latestRes] = await Promise.all([getPopularBooks(), getLatestBooks()]);
      setPopularBooks(popRes.data);
      setLatestBooks(latestRes.data);
      if (auth && userProfile?.userId) {
        try {
          const recRes = await getRecommendations(userProfile.userId);
          setRecommendations(recRes.data);
        } catch { /* optional */ }
      }
    } catch {
      setToast({ message: 'Could not load home page data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /* ── Quick search debounce ── */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!quickSearch.trim()) {
      // if panel filters also cleared, reset results
      if (!hasActiveFilters(filters)) setFilterResults(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      runFilter({ ...filters, title: quickSearch.trim() });
    }, 420);
    return () => clearTimeout(debounceRef.current);
  }, [quickSearch]);

  const hasActiveFilters = (f) =>
    Object.values(f).some(v => v !== '' && v !== null && v !== undefined);

  const isFiltering = filterResults !== null;

  /* ── Build clean params (omit empty strings) ── */
  const buildParams = (f) => {
    const p = {};
    if (f.title)          p.title          = f.title;
    if (f.author)         p.author         = f.author;
    if (f.genre)          p.genre          = f.genre;
    if (f.minRating)      p.minRating      = parseFloat(f.minRating);
    if (f.minPages)       p.minPages       = parseInt(f.minPages);
    if (f.maxPages)       p.maxPages       = parseInt(f.maxPages);
    if (f.availableCopies !== '') p.availableCopies = parseInt(f.availableCopies);
    return p;
  };

  const runFilter = async (f) => {
    const params = buildParams(f);
    if (!Object.keys(params).length) { setFilterResults(null); return; }
    setFilterLoading(true);
    try {
      const res = await apiFilterBooks(params);
      setFilterResults(Array.isArray(res.data) ? res.data : []);
    } catch {
      setToast({ message: 'Filter request failed.', type: 'error' });
    } finally {
      setFilterLoading(false);
    }
  };

  const applyPanel = async () => {
    setFilters(draft);
    setPanelOpen(false);
    await runFilter({ ...draft, title: quickSearch.trim() || draft.title });
  };

  const clearAll = () => {
    setFilters(EMPTY_FILTERS);
    setDraft(EMPTY_FILTERS);
    setQuickSearch('');
    setFilterResults(null);
    setPanelOpen(false);
  };

  const activeFilterCount = [
    filters.author, filters.genre, filters.minRating,
    filters.minPages, filters.maxPages, filters.availableCopies,
  ].filter(v => v !== '').length + (quickSearch.trim() ? 1 : 0);

  /* ── Sections ── */
  const renderSection = (books, title, icon) => (
    <div className="mb-5">
      <h4 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">{icon} {title}</h4>
      <div className="d-flex gap-4 pb-3"
        style={{ overflowX: 'auto', scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}>
        {books.map(book => (
          <div key={book.bookId} style={{ minWidth: 280, maxWidth: 280 }}>
            <BookCard book={book} onToast={(msg, type) => setToast({ message: msg, type })} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop: 10, minHeight: '100vh', background: 'transparent' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Filter Side Panel ── */}
      {panelOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'flex-end',
        }} onClick={() => setPanelOpen(false)}>
          <div
            style={{
              width: 'min(95vw, 380px)', height: '100%',
              background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              animation: 'slideInRight .22s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <SlidersHorizontal size={18} /> Filter Books
              </span>
              <button onClick={() => setPanelOpen(false)} style={{
                background: 'rgba(255,255,255,0.2)', border: 'none',
                borderRadius: 8, color: '#fff', cursor: 'pointer', padding: '4px 9px',
              }}><X size={16} /></button>
            </div>

            {/* Panel Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
              <style>{`
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .filter-inp:focus { border-color: var(--primary) !important; background: #fff !important; }
              `}</style>

              {/* Title */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                  Title
                </label>
                <input className="filter-inp" style={inp} placeholder="e.g. Harry Potter"
                  value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />
              </div>

              {/* Author */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                  Author
                </label>
                <input className="filter-inp" style={inp} placeholder="e.g. J.K. Rowling"
                  value={draft.author} onChange={e => setDraft({ ...draft, author: e.target.value })} />
              </div>

              {/* Genre */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                  Genre
                </label>
                <input className="filter-inp" style={inp} placeholder="e.g. Fiction, Sci-Fi"
                  value={draft.genre} onChange={e => setDraft({ ...draft, genre: e.target.value })} />
              </div>

              {/* Min Rating */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                  Min Rating
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 4.5].map(r => (
                    <button key={r} onClick={() => setDraft({ ...draft, minRating: draft.minRating == r ? '' : r })}
                      style={{
                        padding: '5px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                        cursor: 'pointer', border: '1.5px solid',
                        background: draft.minRating == r ? 'var(--primary)' : '#f8fafc',
                        color: draft.minRating == r ? '#fff' : '#374151',
                        borderColor: draft.minRating == r ? 'var(--primary)' : '#e2e8f0',
                        display: 'flex', alignItems: 'center', gap: 4,
                        transition: 'all .12s',
                      }}>
                      <Star size={11} fill={draft.minRating == r ? '#fff' : '#fbbf24'} color={draft.minRating == r ? '#fff' : '#fbbf24'} />
                      {r}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Pages range */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                  Pages Range
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input className="filter-inp" style={{ ...inp, flex: 1 }} type="number" min={0} placeholder="Min"
                    value={draft.minPages} onChange={e => setDraft({ ...draft, minPages: e.target.value })} />
                  <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>–</span>
                  <input className="filter-inp" style={{ ...inp, flex: 1 }} type="number" min={0} placeholder="Max"
                    value={draft.maxPages} onChange={e => setDraft({ ...draft, maxPages: e.target.value })} />
                </div>
              </div>

              {/* Availability */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                  Availability
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Any', value: '' },
                    { label: 'Available Now', value: '1' },
                  ].map(opt => (
                    <button key={opt.label} onClick={() => setDraft({ ...draft, availableCopies: opt.value })}
                      style={{
                        padding: '6px 14px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
                        cursor: 'pointer', border: '1.5px solid',
                        background: draft.availableCopies === opt.value ? 'var(--primary)' : '#f8fafc',
                        color: draft.availableCopies === opt.value ? '#fff' : '#374151',
                        borderColor: draft.availableCopies === opt.value ? 'var(--primary)' : '#e2e8f0',
                        transition: 'all .12s',
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
              <button onClick={clearAll} style={{
                flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #e2e8f0',
                background: '#fff', color: '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem',
              }}>Reset</button>
              <button onClick={applyPanel} style={{
                flex: 2, padding: '10px', borderRadius: 10, border: 'none',
                background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
              }}>Apply Filters</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
        borderRadius: '24px', margin: '0 1rem 2rem', color: '#fff', padding: '3rem 2rem 2.25rem',
      }}>
        <div className="container text-center">
          <h1 className="fw-bold mb-2" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Welcome to Scanexus, {userProfile?.userName || 'Reader'}
          </h1>
          <p className="fs-5 mb-4" style={{ opacity: 0.9 }}>
            Discover top picks, latest arrivals, and tailored recommendations.
          </p>

          {/* Dashboard buttons */}
          <div className="d-flex justify-content-center gap-3 mb-4">
            {isAdmin() && (
              <button onClick={() => navigate('/admin')} className="btn btn-light fw-bold text-dark px-4 py-2 d-flex align-items-center gap-2" style={{ borderRadius: 12 }}>
                <Shield size={20} /> Admin Dashboard
              </button>
            )}
            {isLibrarian() && (
              <button onClick={() => navigate('/librarian')} className="btn btn-light fw-bold text-dark px-4 py-2 d-flex align-items-center gap-2" style={{ borderRadius: 12 }}>
                <LayoutDashboard size={20} /> Librarian Dashboard
              </button>
            )}
            {!isAdmin() && !isLibrarian() && (
              <button onClick={() => navigate('/dashboard')} className="btn btn-light fw-bold text-dark px-4 py-2 d-flex align-items-center gap-2" style={{ borderRadius: 12 }}>
                <LayoutDashboard size={20} /> Go to Dashboard
              </button>
            )}
          </div>

          {/* ── Search + Filter bar ── */}
          <div className="d-flex justify-content-center gap-2 align-items-stretch flex-wrap">
            {/* Quick search */}
            <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 420 }}>
              <Search size={16} style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.6)', pointerEvents: 'none',
              }} />
              <input
                type="text"
                placeholder="Search by title…"
                value={quickSearch}
                onChange={e => setQuickSearch(e.target.value)}
                style={{
                  width: '100%', paddingLeft: 40, paddingRight: quickSearch ? 36 : 16,
                  paddingTop: 11, paddingBottom: 11,
                  borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.15)', color: '#fff',
                  fontSize: '0.9rem', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.8)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
              />
              {quickSearch && (
                <button onClick={() => { setQuickSearch(''); if (!hasActiveFilters(filters)) setFilterResults(null); }}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 2,
                  }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter button */}
            <button
              onClick={() => { setDraft(filters); setPanelOpen(true); }}
              style={{
                padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: '0.88rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                background: activeFilterCount > 0 ? '#fff' : 'rgba(255,255,255,0.18)',
                color: activeFilterCount > 0 ? 'var(--primary)' : '#fff',
                border: `1.5px solid ${activeFilterCount > 0 ? '#fff' : 'rgba(255,255,255,0.35)'}`,
                transition: 'all .15s', position: 'relative',
              }}>
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span style={{
                  background: 'var(--primary)', color: '#fff', borderRadius: '50%',
                  width: 18, height: 18, fontSize: '0.68rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'absolute', top: -7, right: -7,
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Clear all */}
            {(isFiltering || activeFilterCount > 0) && (
              <button onClick={clearAll} style={{
                padding: '10px 14px', borderRadius: 12, fontWeight: 600, fontSize: '0.85rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.12)', color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.25)',
                transition: 'all .15s',
              }}>
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="container py-4">
        {loading ? (
          <LoadingSpinner text="Curating your home page…" />
        ) : filterLoading ? (
          <LoadingSpinner text="Searching books…" />
        ) : isFiltering ? (
          /* ── Filter Results ── */
          <div className="mb-5">
            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
              <Search size={22} style={{ color: 'var(--primary)' }} />
              Filter Results
              <span style={{
                background: '#ede9fe', color: 'var(--primary)',
                borderRadius: 8, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700,
              }}>
                {filterResults.length} {filterResults.length === 1 ? 'book' : 'books'}
              </span>
            </h4>

            {filterResults.length === 0 ? (
              <div className="text-center py-5">
                <BookOpen size={52} className="text-muted mb-3" style={{ opacity: 0.25 }} />
                <h5 className="text-muted">No books match your filters</h5>
                <p className="text-muted" style={{ fontSize: '0.88rem' }}>Try adjusting your criteria.</p>
                <button className="btn btn-outline-secondary btn-sm mt-2" onClick={clearAll}>
                  <X size={13} className="me-1" /> Clear Filters
                </button>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {filterResults.map(book => (
                  <div key={book.bookId} className="col">
                    <BookCard book={book} onToast={(msg, type) => setToast({ message: msg, type })} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── Default home sections ── */
          <>
            {/* Recommendations */}
            {Array.isArray(recommendations) && recommendations.length > 0 && 
              renderSection(recommendations, 'Recommended for You', <Sparkles size={24} className="text-warning" />)
            }

            {popularBooks.length > 0 && renderSection(popularBooks, 'Popular Books', <TrendingUp size={24} className="text-primary" />)}
            {latestBooks.length > 0 && renderSection(latestBooks, 'Latest Arrivals', <Clock size={24} className="text-success" />)}

            {popularBooks.length === 0 && latestBooks.length === 0 && (
              <div className="text-center py-5">
                <BookOpen size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                <h5 className="text-muted">No books available</h5>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

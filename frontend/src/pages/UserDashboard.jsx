import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBooks, filterBooks } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { Search, BookOpen, BookMarked, Heart, Clock, Star, ChevronRight, Filter, X } from 'lucide-react';

const GENRES = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Fantasy', 'Mystery', 'Romance', 'Self-Help'];

export default function UserDashboard() {
  const { auth, userProfile } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [toast, setToast] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    author: '',
    minRating: '',
    minPages: '',
    maxPages: '',
    availableOnly: false
  });

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await getAllBooks();
      setBooks(res.data);
    } catch { setToast({ message: 'Could not load books.', type: 'error' }); }
    finally { setLoading(false); }
  };

  const applyFilters = async (overrideParams = {}) => {
    setLoading(true);
    try {
      const params = {};
      const currentTitle = overrideParams.title !== undefined ? overrideParams.title : search;
      const currentGenre = overrideParams.genre !== undefined ? overrideParams.genre : selectedGenre;

      if (currentTitle) params.title = currentTitle;
      if (currentGenre) params.genre = currentGenre;
      if (filters.author) params.author = filters.author;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.minPages) params.minPages = filters.minPages;
      if (filters.maxPages) params.maxPages = filters.maxPages;
      if (filters.availableOnly) params.availableCopies = 0;

      if (Object.keys(params).length === 0) {
        const res = await getAllBooks();
        setBooks(res.data);
      } else {
        const res = await filterBooks(params);
        setBooks(res.data);
      }
    } catch { setToast({ message: 'Filter failed.', type: 'error' }); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters({ title: search });
  };

  const handleGenre = (genre) => {
    const newGenre = selectedGenre === genre ? '' : genre;
    setSelectedGenre(newGenre);
    applyFilters({ genre: newGenre });
  };
  
  const clearFilters = () => {
    setSearch('');
    setSelectedGenre('');
    setFilters({ author: '', minRating: '', minPages: '', maxPages: '', availableOnly: false });
    applyFilters({ title: '', genre: '', author: '', minRating: '', minPages: '', maxPages: '', availableOnly: false });
  };

  const quickLinks = [
    { icon: <BookMarked size={22} />, label: 'Issued Books', path: '/issued', color: 'var(--primary-dark)', bg: 'var(--primary-light)' },
    { icon: <Heart size={22} />, label: 'My Favourites', path: '/favourites', color: '#dc3545', bg: '#fce8ea' },
    { icon: <Clock size={22} />, label: 'Waiting List', path: '/waiting-list', color: '#fd7e14', bg: '#fff3e0' },
  ];

  return (
    <div style={{ paddingTop: 10, minHeight: '100vh', background: 'transparent' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', borderRadius: '24px', margin: '0 1rem', color: '#fff', padding: '3rem 2rem 2.5rem' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-7">
              <h1 className="fw-bold mb-1" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                Hello, {userProfile?.userName || 'Reader'} 👋
              </h1>
              <p className="mb-3" style={{ opacity: 0.8 }}>Discover your next great read in our collection.</p>

              {/* Search bar */}
              <form onSubmit={handleSearch} className="d-flex gap-2">
                <div className="input-group" style={{ maxWidth: 420 }}>
                  <span className="input-group-text bg-white border-0"><Search size={18} className="text-muted" /></span>
                  <input id="book-search" type="text" className="form-control border-0 border-start"
                    placeholder="Search books by title…" value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ borderRadius: 0, boxShadow: 'none' }} />
                  <button id="book-search-btn" type="submit" className="btn fw-bold text-dark px-5" style={{ background: 'var(--primary-light)', borderRadius: '0 12px 12px 0' }}>Search</button>
                </div>
                <button type="button" className="btn btn-outline-light d-flex align-items-center gap-2" onClick={() => setShowFilters(!showFilters)}>
                  <Filter size={18} /> Filters
                </button>
                {(search || selectedGenre || filters.author || filters.minRating || filters.minPages || filters.maxPages || filters.availableOnly) && (
                  <button type="button" className="btn btn-outline-light btn-sm" onClick={clearFilters}>
                    Clear
                  </button>
                )}
              </form>
            </div>
            <div className="col-md-5 d-none d-md-flex justify-content-end">
              <div className="d-flex gap-3">
                {[{ val: (Array.isArray(books) ? books : []).length, label: 'Books' }, { val: (Array.isArray(books) ? books : []).filter(b => b.availableCopies > 0).length, label: 'Available' }].map(s => (
                  <div key={s.label} className="text-center px-4 py-3 rounded-3" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
                    <div className="fw-bold" style={{ fontSize: '1.8rem' }}>{s.val}</div>
                    <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {/* Quick Links */}
        <div className="row g-3 mb-4">
          {quickLinks.map(q => (
            <div key={q.label} className="col-md-4">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 14, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onClick={() => navigate(q.path)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div className="card-body d-flex align-items-center gap-3 p-3">
                  <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 48, height: 48, background: q.bg, color: q.color }}>
                    {q.icon}
                  </div>
                  <span className="fw-semibold">{q.label}</span>
                  <ChevronRight size={18} className="ms-auto text-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14, background: '#f8f9fa' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Advanced Filters</h6>
                <button className="btn btn-sm btn-light" onClick={() => setShowFilters(false)}><X size={18} /></button>
              </div>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-muted">Author</label>
                  <input type="text" className="form-control form-control-sm" placeholder="Author name" value={filters.author} onChange={e => setFilters({...filters, author: e.target.value})} />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-bold text-muted">Min Rating</label>
                  <input type="number" step="0.5" min="0" max="5" className="form-control form-control-sm" placeholder="e.g. 4.0" value={filters.minRating} onChange={e => setFilters({...filters, minRating: e.target.value})} />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-bold text-muted">Min Pages</label>
                  <input type="number" min="0" className="form-control form-control-sm" placeholder="Min" value={filters.minPages} onChange={e => setFilters({...filters, minPages: e.target.value})} />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-bold text-muted">Max Pages</label>
                  <input type="number" min="0" className="form-control form-control-sm" placeholder="Max" value={filters.maxPages} onChange={e => setFilters({...filters, maxPages: e.target.value})} />
                </div>
                <div className="col-md-3 d-flex align-items-end gap-2">
                  <div className="form-check mb-1">
                    <input className="form-check-input" type="checkbox" id="availCheck" checked={filters.availableOnly} onChange={e => setFilters({...filters, availableOnly: e.target.checked})} />
                    <label className="form-check-label small fw-bold text-muted" htmlFor="availCheck">Available Only</label>
                  </div>
                  <button className="btn btn-sm btn-primary ms-auto px-4" onClick={() => applyFilters()}>Apply</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Genre Filter */}
        <div className="mb-4">
          <h6 className="fw-bold text-muted mb-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Browse by Genre</h6>
          <div className="d-flex flex-wrap gap-2">
            {GENRES.map(g => (
              <button key={g} onClick={() => handleGenre(g)}
                className={`btn btn-sm rounded-pill px-3 ${selectedGenre === g ? 'btn-primary' : 'btn-outline-secondary'}`}
                style={{ fontSize: '0.8rem' }}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold mb-0">
            <BookOpen size={20} className="me-2 text-primary" />
            {selectedGenre ? `${selectedGenre} Books` : search ? `Results for "${search}"` : 'All Books'}
            <span className="badge bg-primary ms-2" style={{ fontSize: '0.7rem' }}>{books.length}</span>
          </h5>
        </div>

        {loading ? <LoadingSpinner text="Loading books…" /> : (
          books.length === 0 ? (
            <div className="text-center py-5">
              <BookOpen size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
              <h5 className="text-muted">No books found</h5>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
              {books.map(book => (
                <div className="col" key={book.bookId}>
                  <BookCard book={book} onToast={(msg, type) => setToast({ message: msg, type })} />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBooks, searchBooks, getBooksByGenre } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { Search, BookOpen, BookMarked, Heart, Clock, Star, ChevronRight } from 'lucide-react';

const GENRES = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Fantasy', 'Mystery', 'Romance', 'Self-Help'];

export default function UserDashboard() {
  const { auth, userProfile } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await getAllBooks();
      setBooks(res.data);
    } catch { setToast({ message: 'Could not load books.', type: 'error' }); }
    finally { setLoading(false); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) { fetchBooks(); return; }
    setLoading(true);
    try {
      const res = await searchBooks(search.trim());
      setBooks(res.data);
      setSelectedGenre('');
    } catch { setToast({ message: 'Search failed.', type: 'error' }); }
    finally { setLoading(false); }
  };

  const handleGenre = async (genre) => {
    if (selectedGenre === genre) { setSelectedGenre(''); fetchBooks(); return; }
    setSelectedGenre(genre);
    setLoading(true);
    try {
      const res = await getBooksByGenre(genre);
      setBooks(res.data);
      setSearch('');
    } catch { setToast({ message: 'Could not filter by genre.', type: 'error' }); }
    finally { setLoading(false); }
  };

  const quickLinks = [
    { icon: <BookMarked size={22} />, label: 'Issued Books', path: '/issued', color: '#0d6efd', bg: '#e8f0fe' },
    { icon: <Heart size={22} />, label: 'My Favourites', path: '/favourites', color: '#dc3545', bg: '#fce8ea' },
    { icon: <Clock size={22} />, label: 'Waiting List', path: '/waiting-list', color: '#fd7e14', bg: '#fff3e0' },
  ];

  return (
    <div style={{ paddingTop: 72, minHeight: '100vh', background: '#f8fafc' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d6efd 100%)', color: '#fff', padding: '2.5rem 0 2rem' }}>
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
                  <button id="book-search-btn" type="submit" className="btn btn-warning fw-semibold text-dark px-4">Search</button>
                </div>
                {(search || selectedGenre) && (
                  <button type="button" className="btn btn-outline-light btn-sm" onClick={() => { setSearch(''); setSelectedGenre(''); fetchBooks(); }}>
                    Clear
                  </button>
                )}
              </form>
            </div>
            <div className="col-md-5 d-none d-md-flex justify-content-end">
              <div className="d-flex gap-3">
                {[{ val: books.length, label: 'Books' }, { val: books.filter(b => b.availableCopies > 0).length, label: 'Available' }].map(s => (
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

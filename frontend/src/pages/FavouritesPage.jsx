import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFavourites, deleteFavourite, getBookById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { Heart, Trash2, BookOpen, Info } from 'lucide-react';

function FavouriteCard({ fav, onDelete }) {
  const [book, setBook] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getBookById(fav.bookId).then(r => setBook(r.data)).catch(() => {});
  }, [fav.bookId]);

  return (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 14, overflow: 'hidden', transition: 'transform 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform = ''}>
      <div className="d-flex align-items-center justify-content-center"
        style={{ background: 'linear-gradient(135deg, #1a1035, #2d1b69)', height: 120 }}>
        {book?.qrCode ? (
          <img src={`data:image/png;base64,${book.qrCode}`} alt="QR"
            style={{ height: 90, width: 90, objectFit: 'contain', background: '#fff', borderRadius: 8, padding: 4 }} />
        ) : <BookOpen size={40} color="rgba(255,255,255,0.3)" />}
      </div>
      <div className="card-body p-3">
        {book?.genre && <span className="badge mb-1" style={{ background: '#fce8ea', color: '#dc3545', fontSize: '0.68rem' }}>{book.genre}</span>}
        <h6 className="fw-bold text-truncate mb-1">{book?.title || `Book #${fav.bookId}`}</h6>
        <p className="text-muted mb-3" style={{ fontSize: '0.78rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {book?.description || ''}
        </p>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-primary flex-fill" style={{ borderRadius: 8, fontSize: '0.78rem' }}
            onClick={() => navigate(`/books/${fav.bookId}`)}>
            <Info size={13} className="me-1" />Details
          </button>
          <button className="btn btn-sm" style={{ borderRadius: 8, fontSize: '0.78rem', background: '#fce8ea', color: '#dc3545', border: '1px solid #f5c2c7' }}
            onClick={() => onDelete(fav.favouriteId)}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FavouritesPage() {
  const { auth } = useAuth();
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => { if (auth?.userId) fetchFavs(); }, [auth]);

  const fetchFavs = async () => {
    setLoading(true);
    try { const res = await getFavourites(auth.userId); setFavs(res.data); }
    catch { setToast({ message: 'Could not load favourites.', type: 'error' }); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFavourite(id);
      setToast({ message: 'Removed from favourites.', type: 'info' });
      setFavs(prev => prev.filter(f => f.favouriteId !== id));
    } catch { setToast({ message: 'Could not remove.', type: 'error' }); }
  };

  return (
    <div style={{ paddingTop: 72, minHeight: '100vh', background: '#f8fafc' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ background: 'linear-gradient(135deg, #1a1035 0%, #6f42c1 100%)', padding: '2rem 0 1.5rem' }}>
        <div className="container">
          <h2 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
            <Heart size={28} fill="white" /> My Favourites
          </h2>
          <p className="text-white-50 mb-0 mt-1">{favs.length} saved book{favs.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="container py-4">
        {loading ? <LoadingSpinner text="Loading favourites…" /> : (
          favs.length === 0 ? (
            <div className="text-center py-5">
              <Heart size={60} style={{ opacity: 0.15 }} />
              <h5 className="text-muted mt-3">No favourites yet</h5>
              <p className="text-muted">Browse books and tap ❤ to save them here.</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
              {favs.map(fav => (
                <div className="col" key={fav.favouriteId}>
                  <FavouriteCard fav={fav} onDelete={handleDelete} />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Clock, Star, QrCode, Info } from 'lucide-react';
import { addFavourite, addToWaitingList } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BookCard({ book, onToast }) {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [favLoading, setFavLoading] = useState(false);
  const [wlLoading, setWlLoading] = useState(false);

  const handleFavourite = async () => {
    if (!auth) return navigate('/login');
    setFavLoading(true);
    try {
      await addFavourite(auth.userId, book.bookId);
      onToast?.('Added to favourites!', 'success');
    } catch {
      onToast?.('Could not add to favourites.', 'error');
    } finally { setFavLoading(false); }
  };

  const handleWaitingList = async () => {
    if (!auth) return navigate('/login');
    setWlLoading(true);
    try {
      const res = await addToWaitingList(auth.userId, book.bookId);
      onToast?.(res.data, 'info');
    } catch {
      onToast?.('Could not add to waiting list.', 'error');
    } finally { setWlLoading(false); }
  };

  const avgRating = book.reviews?.length
    ? (book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length).toFixed(1)
    : null;

  return (
    <div className="card h-100 border-0 shadow-sm book-card" style={{ borderRadius: 16, overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(13,110,253,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>

      {/* QR / Cover Area */}
      <div className="d-flex align-items-center justify-content-center"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1a3a6b 100%)', height: 160, position: 'relative' }}>
        {book.qrCode ? (
          <img src={`data:image/png;base64,${book.qrCode}`} alt="Book QR" style={{ height: 120, width: 120, objectFit: 'contain', borderRadius: 8, background: '#fff', padding: 4 }} />
        ) : (
          <div className="d-flex flex-column align-items-center opacity-50">
            <QrCode size={48} color="#fff" />
            <small className="text-white mt-1" style={{ fontSize: '0.7rem' }}>No QR</small>
          </div>
        )}
        <span className="badge position-absolute top-0 end-0 m-2"
          style={{ background: book.availableCopies > 0 ? '#198754' : '#dc3545', borderRadius: 6, fontSize: '0.7rem' }}>
          {book.availableCopies > 0 ? `${book.availableCopies} Available` : 'Unavailable'}
        </span>
      </div>

      <div className="card-body d-flex flex-column p-3">
        {/* Genre badge */}
        {book.genre && (
          <span className="badge mb-2 align-self-start" style={{ background: '#e8f0fe', color: '#0d6efd', fontSize: '0.7rem', borderRadius: 4 }}>
            {book.genre}
          </span>
        )}

        <h6 className="card-title fw-bold mb-1 text-truncate" title={book.title}>{book.title}</h6>
        <p className="text-muted mb-2" style={{ fontSize: '0.78rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {book.description || 'No description available.'}
        </p>

        {avgRating && (
          <div className="d-flex align-items-center gap-1 mb-2">
            <Star size={13} fill="#ffc107" color="#ffc107" />
            <small className="fw-semibold">{avgRating}</small>
            <small className="text-muted">({book.reviews.length})</small>
          </div>
        )}

        <div className="mt-auto pt-2 d-flex gap-2 flex-wrap">
          <button className="btn btn-sm btn-outline-primary flex-fill" style={{ borderRadius: 8, fontSize: '0.78rem' }}
            onClick={() => navigate(`/books/${book.bookId}`)}>
            <Info size={13} className="me-1" />Details
          </button>
          <button className="btn btn-sm flex-fill" disabled={favLoading}
            style={{ borderRadius: 8, fontSize: '0.78rem', background: '#fff0f3', color: '#dc3545', border: '1px solid #f5c2c7' }}
            onClick={handleFavourite}>
            <Heart size={13} className="me-1" />{favLoading ? '...' : 'Fav'}
          </button>
          <button className="btn btn-sm flex-fill" disabled={wlLoading}
            style={{ borderRadius: 8, fontSize: '0.78rem', background: '#fff8e1', color: '#fd7e14', border: '1px solid #fde68a' }}
            onClick={handleWaitingList}>
            <Clock size={13} className="me-1" />{wlLoading ? '...' : 'Wait'}
          </button>
        </div>
      </div>
    </div>
  );
}

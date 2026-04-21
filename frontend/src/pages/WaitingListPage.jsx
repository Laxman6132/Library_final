import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWaitingList, removeFromWaitingList, getBookById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { Clock, Trash2, Info, BookOpen } from 'lucide-react';

function WaitingCard({ item, onRemove }) {
  const [book, setBook] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getBookById(item.bookId).then(r => setBook(r.data)).catch(() => {});
  }, [item.bookId]);

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: 'hidden' }}>
      <div className="card-body d-flex align-items-center gap-3 p-3">
        <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #0a1628, #0d3a7a)' }}>
          {book?.qrCode ? (
            <img src={`data:image/png;base64,${book.qrCode}`} alt="QR"
              style={{ width: 44, height: 44, objectFit: 'contain', background: '#fff', borderRadius: 6, padding: 2 }} />
          ) : <BookOpen size={24} color="rgba(255,255,255,0.4)" />}
        </div>
        <div className="flex-grow-1 min-width-0">
          <h6 className="fw-bold mb-0 text-truncate">{book?.title || `Book #${item.bookId}`}</h6>
          <small className="text-muted">{book?.genre} · {book?.availableCopies || 0} available</small>
        </div>
        <div className="d-flex gap-2 flex-shrink-0">
          <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: 8 }}
            onClick={() => navigate(`/books/${item.bookId}`)}>
            <Info size={14} />
          </button>
          <button className="btn btn-sm" style={{ borderRadius: 8, background: '#fce8ea', color: '#dc3545', border: '1px solid #f5c2c7' }}
            onClick={() => onRemove(item.waitingId)}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WaitingListPage() {
  const { auth } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => { if (auth?.userId) fetchList(); }, [auth]);

  const fetchList = async () => {
    setLoading(true);
    try { const res = await getWaitingList(auth.userId); setItems(res.data); }
    catch { setToast({ message: 'Could not load waiting list.', type: 'error' }); }
    finally { setLoading(false); }
  };

  const handleRemove = async (id) => {
    try {
      await removeFromWaitingList(id);
      setToast({ message: 'Removed from waiting list.', type: 'info' });
      setItems(prev => prev.filter(i => i.waitingId !== id));
    } catch { setToast({ message: 'Could not remove.', type: 'error' }); }
  };

  return (
    <div style={{ paddingTop: 72, minHeight: '100vh', background: '#f8fafc' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ background: 'linear-gradient(135deg, #0a1628 0%, #fd7e14 100%)', padding: '2rem 0 1.5rem' }}>
        <div className="container">
          <h2 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
            <Clock size={28} /> My Waiting List
          </h2>
          <p className="text-white-50 mb-0 mt-1">{items.length} book{items.length !== 1 ? 's' : ''} in queue</p>
        </div>
      </div>

      <div className="container py-4">
        {loading ? <LoadingSpinner text="Loading waiting list…" /> : (
          items.length === 0 ? (
            <div className="text-center py-5">
              <Clock size={60} style={{ opacity: 0.15 }} />
              <h5 className="text-muted mt-3">Your waiting list is empty</h5>
              <p className="text-muted">When a book is unavailable, join the waiting list to be notified.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3" style={{ maxWidth: 680 }}>
              <div className="alert alert-info border-0 rounded-3" style={{ fontSize: '0.875rem' }}>
                <Clock size={15} className="me-2" />
                You'll be notified when these books become available.
              </div>
              {items.map((item, idx) => (
                <div key={item.waitingId} className="d-flex align-items-stretch gap-2">
                  <div className="d-flex align-items-center justify-content-center fw-bold text-muted flex-shrink-0"
                    style={{ width: 28, fontSize: '0.85rem' }}>#{idx + 1}</div>
                  <div className="flex-grow-1">
                    <WaitingCard item={item} onRemove={handleRemove} />
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

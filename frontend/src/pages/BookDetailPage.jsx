import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookById, addReview, deleteReview, addFavourite, addToWaitingList } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { ArrowLeft, Star, Heart, Clock, QrCode, Send, Trash2, BookOpen } from 'lucide-react';

function StarRating({ value, onChange }) {
  return (
    <div className="d-flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" className="btn btn-link p-0" onClick={() => onChange(n)}>
          <Star size={22} fill={n <= value ? '#ffc107' : 'none'} color={n <= value ? '#ffc107' : '#adb5bd'} />
        </button>
      ))}
    </div>
  );
}

export default function BookDetailPage() {
  const { id } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => { fetchBook(); }, [id]);

  const fetchBook = async () => {
    setLoading(true);
    try {
      const res = await getBookById(id);
      setBook(res.data);
    } catch { showToast('Could not load book.', 'error'); }
    finally { setLoading(false); }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!auth) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      await addReview(reviewForm.rating, reviewForm.comment, auth.userId, parseInt(id));
      showToast('Review submitted!', 'success');
      setReviewForm({ rating: 5, comment: '' });
      fetchBook();
    } catch { showToast('Failed to submit review.', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(reviewId);
      showToast('Review deleted.', 'info');
      fetchBook();
    } catch { showToast('Could not delete review.', 'error'); }
  };

  const handleFavourite = async () => {
    if (!auth) { navigate('/login'); return; }
    try { await addFavourite(auth.userId, parseInt(id)); showToast('Added to favourites!'); }
    catch { showToast('Could not add to favourites.', 'error'); }
  };

  const handleWaitingList = async () => {
    if (!auth) { navigate('/login'); return; }
    try { const res = await addToWaitingList(auth.userId, parseInt(id)); showToast(res.data, 'info'); }
    catch { showToast('Could not add to waiting list.', 'error'); }
  };

  if (loading) return <div style={{ paddingTop: 72 }}><LoadingSpinner text="Loading book details…" /></div>;
  if (!book) return <div style={{ paddingTop: 72 }} className="container py-5 text-center"><h4 className="text-muted">Book not found</h4></div>;

  const avgRating = book.reviews?.length
    ? (book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length).toFixed(1) : null;

  return (
    <div style={{ paddingTop: 72, minHeight: '100vh', background: '#f8fafc' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Back button */}
      <div style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d3a7a 100%)', padding: '1rem 0' }}>
        <div className="container">
          <button className="btn btn-link text-white p-0 text-decoration-none" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} className="me-1" /> Back to books
          </button>
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          {/* Left: QR + Actions */}
          <div className="col-md-4 col-lg-3">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16, overflow: 'hidden', position: 'sticky', top: 82 }}>
              <div className="d-flex align-items-center justify-content-center p-4"
                style={{ background: 'linear-gradient(135deg, #0a1628, #1a3a6b)', minHeight: 220 }}>
                {book.qrCode ? (
                  <img src={`data:image/png;base64,${book.qrCode}`} alt="Book QR Code"
                    style={{ width: 160, height: 160, objectFit: 'contain', background: '#fff', borderRadius: 10, padding: 6 }} />
                ) : (
                  <div className="text-center opacity-50">
                    <QrCode size={64} color="#fff" />
                    <div className="text-white-50 mt-2" style={{ fontSize: '0.8rem' }}>No QR Code</div>
                  </div>
                )}
              </div>
              <div className="p-3 d-flex flex-column gap-2">
                <button className="btn btn-primary w-100" style={{ borderRadius: 10 }} onClick={handleFavourite}>
                  <Heart size={16} className="me-2" />Add to Favourites
                </button>
                <button className="btn btn-outline-warning w-100" style={{ borderRadius: 10 }} onClick={handleWaitingList}>
                  <Clock size={16} className="me-2" />Join Waiting List
                </button>
                <div className="mt-1 text-center">
                  <span className={`badge px-3 py-2 ${book.availableCopies > 0 ? 'bg-success' : 'bg-danger'}`} style={{ borderRadius: 8 }}>
                    {book.availableCopies > 0 ? `${book.availableCopies} of ${book.totalCopies} available` : 'Currently unavailable'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="col-md-8 col-lg-9">
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
              <div className="card-body p-4">
                {book.genre && (
                  <span className="badge mb-2" style={{ background: '#e8f0fe', color: '#0d6efd', borderRadius: 6 }}>{book.genre}</span>
                )}
                <h2 className="fw-bold mb-1">{book.title}</h2>
                <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>ISBN: {book.isbn}</p>

                {avgRating && (
                  <div className="d-flex align-items-center gap-2 mb-3">
                    {[1,2,3,4,5].map(n => <Star key={n} size={18} fill={n <= Math.round(avgRating) ? '#ffc107' : 'none'} color={n <= Math.round(avgRating) ? '#ffc107' : '#dee2e6'} />)}
                    <span className="fw-semibold">{avgRating}</span>
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>({book.reviews?.length} reviews)</span>
                  </div>
                )}

                <p className="lh-lg" style={{ color: '#444' }}>{book.description || 'No description available.'}</p>

                <div className="row g-2 mt-2">
                  {[
                    { label: 'Total Copies', value: book.totalCopies },
                    { label: 'Available', value: book.availableCopies },
                    { label: 'Genre', value: book.genre || '—' },
                  ].map(i => (
                    <div key={i.label} className="col-auto">
                      <div className="px-3 py-2 rounded-3" style={{ background: '#f0f4ff', border: '1px solid #d0d9f7' }}>
                        <div style={{ fontSize: '0.7rem', color: '#6c757d', textTransform: 'uppercase' }}>{i.label}</div>
                        <div className="fw-bold text-primary">{i.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                  <Star size={20} className="text-warning" />Reviews
                  <span className="badge bg-secondary ms-1" style={{ fontSize: '0.7rem' }}>{book.reviews?.length || 0}</span>
                </h5>

                {/* Add review */}
                {auth && (
                  <form onSubmit={handleAddReview} className="mb-4 p-3 rounded-3" style={{ background: '#f8faff', border: '1px solid #e0e7ff' }}>
                    <h6 className="fw-semibold mb-3">Write a Review</h6>
                    <div className="mb-3">
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Rating</label>
                      <StarRating value={reviewForm.rating} onChange={v => setReviewForm({ ...reviewForm, rating: v })} />
                    </div>
                    <div className="mb-3">
                      <textarea id="review-comment" className="form-control border-0 bg-white" rows={3}
                        placeholder="Share your thoughts about this book…"
                        value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        required style={{ borderRadius: 10 }} />
                    </div>
                    <button id="review-submit" type="submit" className="btn btn-primary" disabled={submitting} style={{ borderRadius: 10 }}>
                      {submitting ? <span className="spinner-border spinner-border-sm me-2" /> : <Send size={15} className="me-2" />}
                      Submit Review
                    </button>
                  </form>
                )}

                {/* Reviews list */}
                {book.reviews?.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <Star size={32} style={{ opacity: 0.2 }} />
                    <p className="mt-2 mb-0">No reviews yet. Be the first!</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {book.reviews?.map((rev) => (
                      <div key={rev.reviewId} className="p-3 rounded-3" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                              style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                              {rev.userId?.toString().charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>User #{rev.userId}</div>
                              <div className="d-flex gap-1">
                                {[1,2,3,4,5].map(n => <Star key={n} size={11} fill={n <= rev.rating ? '#ffc107' : 'none'} color={n <= rev.rating ? '#ffc107' : '#dee2e6'} />)}
                              </div>
                            </div>
                          </div>
                          {auth?.userId === rev.userId && (
                            <button className="btn btn-link text-danger p-0" onClick={() => handleDeleteReview(rev.reviewId)}>
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                        <p className="mb-0" style={{ fontSize: '0.875rem', color: '#444' }}>{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

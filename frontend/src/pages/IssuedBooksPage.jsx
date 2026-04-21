import { useState, useEffect } from 'react';
import { getIssuedBooks, calculateFine, payFine, getBookById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { BookMarked, AlertCircle, CheckCircle, Clock, CreditCard } from 'lucide-react';

function IssuedBookRow({ issue, onPayFine, onToast }) {
  const [book, setBook] = useState(null);
  const [fine, setFine] = useState(null);

  useEffect(() => {
    getBookById(issue.bookId).then(r => setBook(r.data)).catch(() => {});
    if (!issue.returned) {
      import('../services/api').then(({ calculateFinePerBook }) => {
        calculateFinePerBook(issue.issueId).then(r => setFine(r.data)).catch(() => setFine(0));
      });
    }
  }, [issue]);

  const isOverdue = !issue.returned && new Date(issue.dueDate) < new Date();

  return (
    <tr>
      <td>
        <div className="fw-semibold">{book?.title || `Book #${issue.bookId}`}</div>
        <small className="text-muted">{book?.genre}</small>
      </td>
      <td><small>{new Date(issue.issueDate).toLocaleDateString()}</small></td>
      <td>
        <small className={isOverdue ? 'text-danger fw-semibold' : ''}>
          {new Date(issue.dueDate).toLocaleDateString()}
          {isOverdue && ' ⚠'}
        </small>
      </td>
      <td>
        {issue.returned
          ? <span className="badge bg-success">Returned</span>
          : <span className={`badge ${isOverdue ? 'bg-danger' : 'bg-warning text-dark'}`}>
              {isOverdue ? 'Overdue' : 'Active'}
            </span>}
      </td>
      <td>
        {fine !== null && fine > 0
          ? <span className="text-danger fw-semibold">₹{fine.toFixed(2)}</span>
          : <span className="text-muted">—</span>}
      </td>
    </tr>
  );
}

export default function IssuedBooksPage() {
  const { auth } = useAuth();
  const [issues, setIssues] = useState([]);
  const [totalFine, setTotalFine] = useState(0);
  const [loading, setLoading] = useState(true);
  const [payingFine, setPayingFine] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { if (auth?.userId) fetchData(); }, [auth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [issueRes, fineRes] = await Promise.all([
        getIssuedBooks(auth.userId),
        calculateFine(auth.userId)
      ]);
      setIssues(issueRes.data);
      setTotalFine(fineRes.data);
    } catch { setToast({ message: 'Failed to load issued books.', type: 'error' }); }
    finally { setLoading(false); }
  };

  const handlePayFine = async () => {
    if (!window.confirm(`Pay total fine of ₹${totalFine.toFixed(2)}?`)) return;
    setPayingFine(true);
    try {
      await payFine(auth.userId);
      setToast({ message: 'Fine paid successfully!', type: 'success' });
      fetchData();
    } catch { setToast({ message: 'Payment failed.', type: 'error' }); }
    finally { setPayingFine(false); }
  };

  const active = issues.filter(i => !i.returned);
  const returned = issues.filter(i => i.returned);

  return (
    <div style={{ paddingTop: 72, minHeight: '100vh', background: '#f8fafc' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d6efd 100%)', padding: '2rem 0 1.5rem' }}>
        <div className="container">
          <h2 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
            <BookMarked size={28} /> My Issued Books
          </h2>
          <p className="text-white-50 mb-0 mt-1">{active.length} active · {returned.length} returned</p>
        </div>
      </div>

      <div className="container py-4">
        {/* Fine summary card */}
        {totalFine > 0 && (
          <div className="alert border-0 mb-4 d-flex align-items-center justify-content-between rounded-3"
            style={{ background: '#fff3cd', border: '1px solid #ffe08a' }}>
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={20} className="text-warning" />
              <span className="fw-semibold">Total Outstanding Fine: <span className="text-danger">₹{totalFine.toFixed(2)}</span></span>
            </div>
            <button className="btn btn-sm btn-warning fw-semibold" onClick={handlePayFine} disabled={payingFine} style={{ borderRadius: 8 }}>
              {payingFine ? <span className="spinner-border spinner-border-sm me-1" /> : <CreditCard size={15} className="me-1" />}
              Pay Fine
            </button>
          </div>
        )}

        {loading ? <LoadingSpinner text="Loading issued books…" /> : (
          <>
            {/* Active Issues */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
              <div className="card-header bg-white border-0 px-4 pt-4 pb-0">
                <h6 className="fw-bold d-flex align-items-center gap-2">
                  <Clock size={18} className="text-warning" />Currently Issued
                  <span className="badge bg-warning text-dark ms-1">{active.length}</span>
                </h6>
              </div>
              <div className="card-body p-0">
                {active.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <CheckCircle size={32} style={{ opacity: 0.3 }} />
                    <p className="mt-2 mb-0">No active issues</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ fontSize: '0.8rem' }}>Book</th>
                          <th style={{ fontSize: '0.8rem' }}>Issued On</th>
                          <th style={{ fontSize: '0.8rem' }}>Due Date</th>
                          <th style={{ fontSize: '0.8rem' }}>Status</th>
                          <th style={{ fontSize: '0.8rem' }}>Fine</th>
                        </tr>
                      </thead>
                      <tbody>
                        {active.map(issue => (
                          <IssuedBookRow key={issue.issueId} issue={issue} onToast={setToast} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Return History */}
            {returned.length > 0 && (
              <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
                <div className="card-header bg-white border-0 px-4 pt-4 pb-0">
                  <h6 className="fw-bold d-flex align-items-center gap-2">
                    <CheckCircle size={18} className="text-success" />Return History
                    <span className="badge bg-secondary ms-1">{returned.length}</span>
                  </h6>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ fontSize: '0.8rem' }}>Book</th>
                          <th style={{ fontSize: '0.8rem' }}>Issued On</th>
                          <th style={{ fontSize: '0.8rem' }}>Due Date</th>
                          <th style={{ fontSize: '0.8rem' }}>Status</th>
                          <th style={{ fontSize: '0.8rem' }}>Fine</th>
                        </tr>
                      </thead>
                      <tbody>
                        {returned.map(issue => (
                          <IssuedBookRow key={issue.issueId} issue={issue} onToast={setToast} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

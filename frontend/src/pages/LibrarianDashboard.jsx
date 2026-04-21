import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  getAllBooks, getAllUsers, addBook, updateBook,
  issueBook, returnBook, getIssuedBooks,
} from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import {
  BookOpen, Users, PlusCircle, QrCode,
  CheckCircle, Search, Edit2, ArrowRightLeft,
  RotateCcw, Camera, X, ChevronLeft
} from 'lucide-react';

/* ─── tiny reusable QR Scanner component ─── */
function QrScanner({ onScan, onClose, label }) {
  const divId = useRef(`qr-${Math.random().toString(36).slice(2)}`).current;
  const scannerRef = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const scanner = new Html5Qrcode(divId);
    scannerRef.current = scanner;
    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decoded) => {
        onScan(decoded);
      },
      () => {}
    ).catch(err => console.error('Camera start failed:', err));
    return () => {
      scanner.isRunning() && scanner.stop().catch(() => {});
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      background: 'rgba(0,0,0,0.75)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16
    }}>
      <div style={{
        background: '#1e2130', borderRadius: 20, padding: '1.5rem',
        width: 'min(95vw, 380px)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Camera size={18} style={{ color: '#60a5fa' }} /> {label}
          </span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff', padding: '4px 10px', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
        <div id={divId} style={{ borderRadius: 12, overflow: 'hidden', background: '#000' }} />
        <p style={{ color: '#94a3b8', fontSize: '0.78rem', textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
          Point the camera at the QR code
        </p>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─── */
const TABS = [
  { key: 'add-book',   label: 'Add Book',    icon: <PlusCircle size={16} /> },
  { key: 'books',      label: 'View Books',  icon: <BookOpen size={16} /> },
  { key: 'users',      label: 'View Users',  icon: <Users size={16} /> },
  { key: 'issue',      label: 'Issue Book',  icon: <ArrowRightLeft size={16} /> },
  { key: 'return',     label: 'Return Book', icon: <RotateCcw size={16} /> },
];

export default function LibrarianDashboard() {
  const [tab, setTab] = useState('add-book');
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  /* Add / Edit Book */
  const [bookForm, setBookForm] = useState({ title: '', description: '', isbn: '', totalCopies: 1, availableCopies: 1, genre: '' });
  const [editingBook, setEditingBook] = useState(null);
  const [bookLoading, setBookLoading] = useState(false);

  /* Search */
  const [bookSearch, setBookSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  /* Issue */
  const [issueUserId, setIssueUserId] = useState(null);
  const [issueBookId, setIssueBookId] = useState(null);
  const [issueUserInfo, setIssueUserInfo] = useState(null);
  const [issueBookInfo, setIssueBookInfo] = useState(null);
  const [scannerTarget, setScannerTarget] = useState(null); // 'issue-user'|'issue-book'|'return-user'|'return-book'
  const [issueLoading, setIssueLoading] = useState(false);

  /* Return */
  const [returnUserId, setReturnUserId] = useState(null);
  const [returnBookId, setReturnBookId] = useState(null);
  const [returnUserInfo, setReturnUserInfo] = useState(null);
  const [returnBookInfo, setReturnBookInfo] = useState(null);
  const [returnLoading, setReturnLoading] = useState(false);

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, uRes] = await Promise.all([getAllBooks(), getAllUsers()]);
      setBooks(bRes.data);
      setUsers(uRes.data);
    } catch { showToast('Failed to load data.', 'error'); }
    finally { setLoading(false); }
  };

  /* ── Add / Edit Book ── */
  const resetBookForm = () => {
    setBookForm({ title: '', description: '', isbn: '', totalCopies: 1, availableCopies: 1, genre: '' });
    setEditingBook(null);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setBookLoading(true);
    try {
      if (editingBook) {
        await updateBook(editingBook.bookId, bookForm);
        showToast('Book updated successfully!');
        setEditingBook(null);
      } else {
        await addBook(bookForm);
        showToast('Book added successfully!');
      }
      resetBookForm();
      fetchAll();
      setTab('books');
    } catch (err) {
      showToast(err.response?.data || 'Failed to save book.', 'error');
    } finally { setBookLoading(false); }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setBookForm({ title: book.title, description: book.description || '', isbn: book.isbn, totalCopies: book.totalCopies, availableCopies: book.availableCopies, genre: book.genre || '' });
    setTab('add-book');
  };

  /* ── QR Scan handler ──
     Backend QR formats:
       User:  "USER_ID:3|TOKEN:uuid"
       Book:  "BOOK_ID:12|ISBN:978-x-xx"
  ── */
  const handleQrScan = useCallback((decoded) => {
    setScannerTarget(prev => {
      if (!prev) return null;

      // Parse pipe-delimited format: KEY:value|KEY:value
      const parseQR = (str) => {
        const obj = {};
        str.split('|').forEach(part => {
          const idx = part.indexOf(':');
          if (idx !== -1) obj[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
        });
        return obj;
      };

      const parsed = parseQR(decoded);
      const userId = parsed['USER_ID'] ? parseInt(parsed['USER_ID'], 10) : null;
      const bookId = parsed['BOOK_ID'] ? parseInt(parsed['BOOK_ID'], 10) : null;

      if (prev === 'issue-user') {
        const uid = userId ?? parseInt(decoded, 10);
        const found = users.find(u => u.userId === uid);
        setIssueUserId(uid);
        setIssueUserInfo(found ?? { userId: uid, userName: `User #${uid}` });
        showToast(`User scanned: ${found?.userName ?? `#${uid}`}`);
      } else if (prev === 'issue-book') {
        const bid = bookId ?? parseInt(decoded, 10);
        const found = books.find(b => b.bookId === bid);
        setIssueBookId(bid);
        setIssueBookInfo(found ?? { bookId: bid, title: `Book #${bid}` });
        showToast(`Book scanned: ${found?.title ?? `#${bid}`}`);
      } else if (prev === 'return-user') {
        const uid = userId ?? parseInt(decoded, 10);
        const found = users.find(u => u.userId === uid);
        setReturnUserId(uid);
        setReturnUserInfo(found ?? { userId: uid, userName: `User #${uid}` });
        showToast(`User scanned: ${found?.userName ?? `#${uid}`}`);
      } else if (prev === 'return-book') {
        const bid = bookId ?? parseInt(decoded, 10);
        const found = books.find(b => b.bookId === bid);
        setReturnBookId(bid);
        setReturnBookInfo(found ?? { bookId: bid, title: `Book #${bid}` });
        showToast(`Book scanned: ${found?.title ?? `#${bid}`}`);
      }
      return null; // close scanner
    });
  }, [users, books]);

  /* ── Issue ── */
  const handleIssue = async () => {
    if (!issueUserId || !issueBookId) { showToast('Scan both User and Book QR first.', 'error'); return; }
    setIssueLoading(true);
    try {
      const res = await issueBook(issueUserId, issueBookId);
      showToast(typeof res.data === 'string' ? res.data : 'Book issued successfully!');
      setIssueUserId(null); setIssueBookId(null);
      setIssueUserInfo(null); setIssueBookInfo(null);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data || 'Issue failed.', 'error');
    } finally { setIssueLoading(false); }
  };

  /* ── Return ── */
  const handleReturn = async () => {
    if (!returnUserId || !returnBookId) { showToast('Scan both User and Book QR first.', 'error'); return; }
    setReturnLoading(true);
    try {
      // Fetch user's issued books to find the correct issueId
      const issuedRes = await getIssuedBooks(returnUserId);
      const issuedList = issuedRes.data;
      const record = issuedList.find(
        r => r.book?.bookId === returnBookId && !r.returned
      );
      if (!record) {
        showToast('No active issue record found for this user & book.', 'error');
        setReturnLoading(false);
        return;
      }
      const res = await returnBook(record.issueId);
      showToast(typeof res.data === 'string' ? res.data : 'Book returned successfully!');
      setReturnUserId(null); setReturnBookId(null);
      setReturnUserInfo(null); setReturnBookInfo(null);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data || 'Return failed.', 'error');
    } finally { setReturnLoading(false); }
  };

  const filteredBooks = books.filter(b =>
    b.title?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.isbn?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.genre?.toLowerCase().includes(bookSearch.toLowerCase())
  );
  const filteredUsers = users.filter(u =>
    u.userName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.emailId?.toLowerCase().includes(userSearch.toLowerCase())
  );

  /* ─────────── Styles ─────────── */
  const cardStyle = { borderRadius: 16, border: 'none', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' };
  const inputStyle = { borderRadius: 10, border: 'none', background: '#f1f5f9' };
  const labelStyle = { fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 };

  return (
    <div style={{ paddingTop: 72, minHeight: '100vh', background: '#f0f4f8' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {scannerTarget && (
        <QrScanner
          key={scannerTarget}
          label={
            scannerTarget === 'issue-user' ? 'Scan User QR — Issue' :
            scannerTarget === 'issue-book' ? 'Scan Book QR — Issue' :
            scannerTarget === 'return-user' ? 'Scan User QR — Return' :
            'Scan Book QR — Return'
          }
          onScan={handleQrScan}
          onClose={() => setScannerTarget(null)}
        />
      )}

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg,#0f1c3f 0%,#1a56db 100%)', paddingBottom: 0 }}>
        <div className="container" style={{ paddingTop: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '0.5rem 0.75rem' }}>
              <BookOpen size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 0, fontSize: '1.4rem', letterSpacing: '-0.3px' }}>
                Librarian Dashboard
              </h2>
              <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>
                {books.length} books · {users.length} users
              </small>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => {
                setTab(t.key);
                if (t.key !== 'add-book') resetBookForm();
              }}
                style={{
                  border: 'none', borderRadius: '10px 10px 0 0',
                  padding: '0.55rem 1.1rem',
                  fontWeight: 600, fontSize: '0.82rem',
                  display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                  background: tab === t.key ? '#fff' : 'rgba(255,255,255,0.12)',
                  color: tab === t.key ? '#1a56db' : 'rgba(255,255,255,0.85)',
                  transition: 'all 0.18s',
                }}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-4">
        {loading ? <LoadingSpinner /> : (
          <>
            {/* ══════════════ ADD / EDIT BOOK ══════════════ */}
            {tab === 'add-book' && (
              <div className="row justify-content-center">
                <div className="col-md-9 col-lg-7">
                  <div className="card" style={cardStyle}>
                    <div className="card-body p-4">
                      <h5 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PlusCircle size={20} color="#1a56db" />
                        {editingBook ? 'Edit Book' : 'Add New Book'}
                      </h5>

                      <form onSubmit={handleBookSubmit}>
                        <div className="row g-3">
                          <div className="col-12">
                            <label className="form-label" style={labelStyle}>Title *</label>
                            <input className="form-control" style={inputStyle} placeholder="Book title"
                              value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} required />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label" style={labelStyle}>ISBN *</label>
                            <input className="form-control" style={inputStyle} placeholder="978-x-xxx-xxxxx-x"
                              value={bookForm.isbn} onChange={e => setBookForm({ ...bookForm, isbn: e.target.value })} required />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label" style={labelStyle}>Genre</label>
                            <input className="form-control" style={inputStyle} placeholder="e.g. Fiction"
                              value={bookForm.genre} onChange={e => setBookForm({ ...bookForm, genre: e.target.value })} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label" style={labelStyle}>Total Copies</label>
                            <input type="number" min={1} className="form-control" style={inputStyle}
                              value={bookForm.totalCopies} onChange={e => setBookForm({ ...bookForm, totalCopies: parseInt(e.target.value) })} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label" style={labelStyle}>Available Copies</label>
                            <input type="number" min={0} className="form-control" style={inputStyle}
                              value={bookForm.availableCopies} onChange={e => setBookForm({ ...bookForm, availableCopies: parseInt(e.target.value) })} />
                          </div>
                          <div className="col-12">
                            <label className="form-label" style={labelStyle}>Description</label>
                            <textarea className="form-control" style={inputStyle} rows={3} placeholder="Brief summary…"
                              value={bookForm.description} onChange={e => setBookForm({ ...bookForm, description: e.target.value })} />
                          </div>
                        </div>

                        {editingBook?.qrCode && (
                          <div style={{ marginTop: 14, padding: '0.75rem', background: '#f0f4ff', borderRadius: 10, textAlign: 'center' }}>
                            <small style={{ color: '#6b7280', display: 'block', marginBottom: 6 }}>Current Book QR</small>
                            <img src={`data:image/png;base64,${editingBook.qrCode}`} alt="QR"
                              style={{ width: 90, height: 90, borderRadius: 8, padding: 4, background: '#fff' }} />
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 12, marginTop: '1.25rem' }}>
                          <button type="submit" className="btn btn-primary flex-fill fw-semibold"
                            style={{ borderRadius: 10 }} disabled={bookLoading}>
                            {bookLoading && <span className="spinner-border spinner-border-sm me-2" />}
                            {editingBook ? 'Update Book' : 'Add Book'}
                          </button>
                          {editingBook && (
                            <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: 10 }}
                              onClick={resetBookForm}>
                              <ChevronLeft size={15} className="me-1" />Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ VIEW BOOKS ══════════════ */}
            {tab === 'books' && (
              <div className="card" style={cardStyle}>
                <div className="card-header bg-white border-0 px-4 pt-4 pb-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
                  style={{ borderRadius: '16px 16px 0 0' }}>
                  <h6 style={{ fontWeight: 700, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOpen size={18} color="#1a56db" /> All Books
                    <span className="badge" style={{ background: '#e0e9ff', color: '#1a56db', fontWeight: 600, fontSize: '0.72rem' }}>{books.length}</span>
                  </h6>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div className="input-group input-group-sm" style={{ width: 230 }}>
                      <span className="input-group-text border-0" style={{ background: '#f1f5f9' }}><Search size={14} /></span>
                      <input className="form-control border-0" style={{ background: '#f1f5f9' }} placeholder="Search…"
                        value={bookSearch} onChange={e => setBookSearch(e.target.value)} />
                    </div>
                    <button className="btn btn-sm btn-primary" style={{ borderRadius: 8, whiteSpace: 'nowrap' }}
                      onClick={() => { resetBookForm(); setTab('add-book'); }}>
                      <PlusCircle size={14} className="me-1" />Add Book
                    </button>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead style={{ background: '#f8fafc' }}>
                      <tr>
                        {['ID', 'Title', 'ISBN', 'Genre', 'Copies', 'Available', 'QR', 'Edit'].map(h => (
                          <th key={h} style={{ fontSize: '0.76rem', fontWeight: 700, color: '#6b7280', padding: '10px 14px', border: 'none' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBooks.length === 0 && (
                        <tr><td colSpan={8} className="text-center text-muted py-4" style={{ fontSize: '0.88rem' }}>No books found.</td></tr>
                      )}
                      {filteredBooks.map(b => (
                        <tr key={b.bookId}>
                          <td style={{ fontSize: '0.78rem', color: '#9ca3af' }}>#{b.bookId}</td>
                          <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{b.title}</td>
                          <td style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{b.isbn}</td>
                          <td>
                            {b.genre ? <span style={{ background: '#e0e9ff', color: '#1a56db', borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 600 }}>{b.genre}</span> : '—'}
                          </td>
                          <td style={{ fontSize: '0.875rem' }}>{b.totalCopies}</td>
                          <td>
                            <span style={{ background: b.availableCopies > 0 ? '#dcfce7' : '#fee2e2', color: b.availableCopies > 0 ? '#16a34a' : '#dc2626', borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 }}>
                              {b.availableCopies}
                            </span>
                          </td>
                          <td>
                            {b.qrCode
                              ? <img src={`data:image/png;base64,${b.qrCode}`} alt="QR" style={{ width: 34, height: 34, borderRadius: 4, background: '#f8fafc', padding: 2 }} />
                              : <QrCode size={16} color="#d1d5db" />}
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: 7, padding: '3px 9px' }} onClick={() => handleEditBook(b)}>
                              <Edit2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══════════════ VIEW USERS ══════════════ */}
            {tab === 'users' && (
              <div className="card" style={cardStyle}>
                <div className="card-header bg-white border-0 px-4 pt-4 pb-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
                  style={{ borderRadius: '16px 16px 0 0' }}>
                  <h6 style={{ fontWeight: 700, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={18} color="#1a56db" /> All Users
                    <span className="badge" style={{ background: '#e0e9ff', color: '#1a56db', fontWeight: 600, fontSize: '0.72rem' }}>{users.length}</span>
                  </h6>
                  <div className="input-group input-group-sm" style={{ width: 230 }}>
                    <span className="input-group-text border-0" style={{ background: '#f1f5f9' }}><Search size={14} /></span>
                    <input className="form-control border-0" style={{ background: '#f1f5f9' }} placeholder="Search users…"
                      value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead style={{ background: '#f8fafc' }}>
                      <tr>
                        {['ID', 'Username', 'Email', 'Role', 'Fine', 'QR'].map(h => (
                          <th key={h} style={{ fontSize: '0.76rem', fontWeight: 700, color: '#6b7280', padding: '10px 14px', border: 'none' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 && (
                        <tr><td colSpan={6} className="text-center text-muted py-4" style={{ fontSize: '0.88rem' }}>No users found.</td></tr>
                      )}
                      {filteredUsers.map(u => (
                        <tr key={u.userId}>
                          <td style={{ fontSize: '0.78rem', color: '#9ca3af' }}>#{u.userId}</td>
                          <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.userName}</td>
                          <td style={{ fontSize: '0.8rem', color: '#6b7280' }}>{u.emailId}</td>
                          <td>
                            <span style={{
                              borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700,
                              background: u.role === 'ADMIN' ? '#fee2e2' : u.role === 'LIBRARIAN' ? '#fef9c3' : '#e0e9ff',
                              color: u.role === 'ADMIN' ? '#dc2626' : u.role === 'LIBRARIAN' ? '#92400e' : '#1a56db',
                            }}>{u.role}</span>
                          </td>
                          <td style={{ fontSize: '0.875rem' }}>
                            {u.fine > 0
                              ? <span style={{ color: '#dc2626', fontWeight: 700 }}>₹{u.fine?.toFixed(2)}</span>
                              : <span style={{ color: '#9ca3af' }}>₹0</span>}
                          </td>
                          <td>
                            {u.qrCode
                              ? <img src={`data:image/png;base64,${u.qrCode}`} alt="QR" style={{ width: 34, height: 34, borderRadius: 4, background: '#f8fafc', padding: 2 }} />
                              : <QrCode size={16} color="#d1d5db" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══════════════ ISSUE BOOK (QR) ══════════════ */}
            {tab === 'issue' && (
              <div className="row justify-content-center">
                <div className="col-md-10 col-lg-8">
                  <div className="card" style={cardStyle}>
                    <div className="card-body p-4">
                      <h5 style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ArrowRightLeft size={20} color="#1a56db" /> Issue Book
                      </h5>
                      <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                        Scan the <strong>User QR</strong> and then the <strong>Book QR</strong> to issue a book.
                      </p>

                      <div className="row g-3 mb-4">
                        {/* User scan card */}
                        <div className="col-md-6">
                          <div style={{
                            border: `2px dashed ${issueUserInfo ? '#16a34a' : '#cbd5e1'}`,
                            borderRadius: 14, padding: '1.25rem', textAlign: 'center',
                            background: issueUserInfo ? '#f0fdf4' : '#f8fafc',
                            transition: 'all 0.2s'
                          }}>
                            {issueUserInfo ? (
                              <>
                                <CheckCircle size={28} color="#16a34a" />
                                <div style={{ fontWeight: 700, marginTop: 8 }}>{issueUserInfo.userName}</div>
                                <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>User #{issueUserInfo.userId}</div>
                                <button className="btn btn-sm btn-outline-danger mt-2" style={{ borderRadius: 8 }}
                                  onClick={() => { setIssueUserId(null); setIssueUserInfo(null); }}>
                                  <X size={12} className="me-1" />Clear
                                </button>
                              </>
                            ) : (
                              <>
                                <QrCode size={32} color="#94a3b8" />
                                <div style={{ fontWeight: 600, marginTop: 8, color: '#374151' }}>User QR</div>
                                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 10 }}>Not scanned yet</div>
                                <button className="btn btn-primary btn-sm" style={{ borderRadius: 8 }}
                                  onClick={() => setScannerTarget('issue-user')}>
                                  <Camera size={13} className="me-1" />Scan User
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Book scan card */}
                        <div className="col-md-6">
                          <div style={{
                            border: `2px dashed ${issueBookInfo ? '#16a34a' : '#cbd5e1'}`,
                            borderRadius: 14, padding: '1.25rem', textAlign: 'center',
                            background: issueBookInfo ? '#f0fdf4' : '#f8fafc',
                            transition: 'all 0.2s'
                          }}>
                            {issueBookInfo ? (
                              <>
                                <CheckCircle size={28} color="#16a34a" />
                                <div style={{ fontWeight: 700, marginTop: 8 }}>{issueBookInfo.title}</div>
                                <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>Book #{issueBookInfo.bookId}</div>
                                <button className="btn btn-sm btn-outline-danger mt-2" style={{ borderRadius: 8 }}
                                  onClick={() => { setIssueBookId(null); setIssueBookInfo(null); }}>
                                  <X size={12} className="me-1" />Clear
                                </button>
                              </>
                            ) : (
                              <>
                                <BookOpen size={32} color="#94a3b8" />
                                <div style={{ fontWeight: 600, marginTop: 8, color: '#374151' }}>Book QR</div>
                                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 10 }}>Not scanned yet</div>
                                <button className="btn btn-primary btn-sm" style={{ borderRadius: 8 }}
                                  onClick={() => setScannerTarget('issue-book')}>
                                  <Camera size={13} className="me-1" />Scan Book
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {issueUserInfo && issueBookInfo && (
                        <div style={{ background: '#eff6ff', borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                          <strong>Ready to issue:</strong> <em>{issueBookInfo.title}</em> → <em>{issueUserInfo.userName}</em>
                        </div>
                      )}

                      <button className="btn btn-primary w-100 fw-semibold" style={{ borderRadius: 12, padding: '0.7rem' }}
                        onClick={handleIssue} disabled={issueLoading || !issueUserId || !issueBookId}>
                        {issueLoading
                          ? <><span className="spinner-border spinner-border-sm me-2" />Processing…</>
                          : <><ArrowRightLeft size={16} className="me-2" />Confirm Issue</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ RETURN BOOK (QR) ══════════════ */}
            {tab === 'return' && (
              <div className="row justify-content-center">
                <div className="col-md-10 col-lg-8">
                  <div className="card" style={cardStyle}>
                    <div className="card-body p-4">
                      <h5 style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <RotateCcw size={20} color="#16a34a" /> Return Book
                      </h5>
                      <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                        Scan the <strong>User QR</strong> and then the <strong>Book QR</strong> to process a return.
                      </p>

                      <div className="row g-3 mb-4">
                        {/* User scan card */}
                        <div className="col-md-6">
                          <div style={{
                            border: `2px dashed ${returnUserInfo ? '#16a34a' : '#cbd5e1'}`,
                            borderRadius: 14, padding: '1.25rem', textAlign: 'center',
                            background: returnUserInfo ? '#f0fdf4' : '#f8fafc',
                            transition: 'all 0.2s'
                          }}>
                            {returnUserInfo ? (
                              <>
                                <CheckCircle size={28} color="#16a34a" />
                                <div style={{ fontWeight: 700, marginTop: 8 }}>{returnUserInfo.userName}</div>
                                <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>User #{returnUserInfo.userId}</div>
                                <button className="btn btn-sm btn-outline-danger mt-2" style={{ borderRadius: 8 }}
                                  onClick={() => { setReturnUserId(null); setReturnUserInfo(null); }}>
                                  <X size={12} className="me-1" />Clear
                                </button>
                              </>
                            ) : (
                              <>
                                <QrCode size={32} color="#94a3b8" />
                                <div style={{ fontWeight: 600, marginTop: 8, color: '#374151' }}>User QR</div>
                                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 10 }}>Not scanned yet</div>
                                <button className="btn btn-success btn-sm" style={{ borderRadius: 8 }}
                                  onClick={() => setScannerTarget('return-user')}>
                                  <Camera size={13} className="me-1" />Scan User
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Book scan card */}
                        <div className="col-md-6">
                          <div style={{
                            border: `2px dashed ${returnBookInfo ? '#16a34a' : '#cbd5e1'}`,
                            borderRadius: 14, padding: '1.25rem', textAlign: 'center',
                            background: returnBookInfo ? '#f0fdf4' : '#f8fafc',
                            transition: 'all 0.2s'
                          }}>
                            {returnBookInfo ? (
                              <>
                                <CheckCircle size={28} color="#16a34a" />
                                <div style={{ fontWeight: 700, marginTop: 8 }}>{returnBookInfo.title}</div>
                                <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>Book #{returnBookInfo.bookId}</div>
                                <button className="btn btn-sm btn-outline-danger mt-2" style={{ borderRadius: 8 }}
                                  onClick={() => { setReturnBookId(null); setReturnBookInfo(null); }}>
                                  <X size={12} className="me-1" />Clear
                                </button>
                              </>
                            ) : (
                              <>
                                <BookOpen size={32} color="#94a3b8" />
                                <div style={{ fontWeight: 600, marginTop: 8, color: '#374151' }}>Book QR</div>
                                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 10 }}>Not scanned yet</div>
                                <button className="btn btn-success btn-sm" style={{ borderRadius: 8 }}
                                  onClick={() => setScannerTarget('return-book')}>
                                  <Camera size={13} className="me-1" />Scan Book
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {returnUserInfo && returnBookInfo && (
                        <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                          <strong>Ready to return:</strong> <em>{returnBookInfo.title}</em> from <em>{returnUserInfo.userName}</em>
                        </div>
                      )}

                      <button className="btn btn-success w-100 fw-semibold" style={{ borderRadius: 12, padding: '0.7rem' }}
                        onClick={handleReturn} disabled={returnLoading || !returnUserId || !returnBookId}>
                        {returnLoading
                          ? <><span className="spinner-border spinner-border-sm me-2" />Processing…</>
                          : <><RotateCcw size={16} className="me-2" />Confirm Return</>}
                      </button>
                    </div>
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

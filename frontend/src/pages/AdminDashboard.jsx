import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  getAllBooks, getAllUsers, addBook, updateBook, deleteBook, deleteAllBooks,
  issueBook, returnBook, getIssuedBooks,
  deleteUser, makeLibrarian, makeAdmin,
  updateFineRule, regenerateUserQR, generateQRForAllBooks,
} from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import {
  Shield, BookOpen, Users, Trash2, QrCode, Settings,
  RefreshCw, AlertTriangle, Search, PlusCircle, Edit2,
  ArrowRightLeft, RotateCcw, Camera, X, CheckCircle,
  ChevronLeft, UserX, Crown, UserCog,
} from 'lucide-react';

/* ─── Shared QR Scanner Overlay ─── */
function QrScanner({ label, onScan, onClose }) {
  const divId = useRef(`qr-admin-${Math.random().toString(36).slice(2)}`).current;
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
      (decoded) => { onScan(decoded); },
      () => { }
    ).catch(err => console.error('Camera error:', err));
    return () => { scanner.isRunning() && scanner.stop().catch(() => { }); };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1200,
      background: 'rgba(0,0,0,0.78)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#1a1f35', borderRadius: 20, padding: '1.5rem',
        width: 'min(95vw,380px)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Camera size={17} style={{ color: '#a78bfa' }} />{label}
          </span>
          <button onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff', padding: '4px 10px', cursor: 'pointer' }}>
            <X size={15} />
          </button>
        </div>
        <div id={divId} style={{ borderRadius: 12, overflow: 'hidden', background: '#000' }} />
        <p style={{ color: '#94a3b8', fontSize: '0.76rem', textAlign: 'center', marginTop: 10, marginBottom: 0 }}>
          Point the camera at the QR code
        </p>
      </div>
    </div>
  );
}

/* ─── Confirm Modal ─── */
function ConfirmModal({ message, onConfirm, onCancel, danger = true }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1300,
      background: 'rgba(0,0,0,0.55)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '1.75rem',
        width: 'min(95vw,420px)', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <AlertTriangle size={22} color={danger ? '#dc2626' : '#f59e0b'} />
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>Confirm Action</span>
        </div>
        <p style={{ color: '#374151', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.55 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onConfirm}
            className={`btn flex-fill fw-semibold ${danger ? 'btn-danger' : 'btn-warning'}`}
            style={{ borderRadius: 10 }}>Confirm</button>
          <button onClick={onCancel}
            className="btn btn-outline-secondary flex-fill"
            style={{ borderRadius: 10 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab definitions ─── */
const TABS = [
  { key: 'add-book', label: 'Add Book', icon: <PlusCircle size={15} /> },
  { key: 'books', label: 'Books', icon: <BookOpen size={15} /> },
  { key: 'users', label: 'Users', icon: <Users size={15} /> },
  { key: 'issue', label: 'Issue', icon: <ArrowRightLeft size={15} /> },
  { key: 'return', label: 'Return', icon: <RotateCcw size={15} /> },
  { key: 'roles', label: 'Roles', icon: <UserCog size={15} /> },
  { key: 'fine-rules', label: 'Fine Rules', icon: <Settings size={15} /> },
  { key: 'qr', label: 'QR', icon: <QrCode size={15} /> },
];

/* ─── Shared styles ─── */
const card = { borderRadius: 16, border: 'none', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' };
const inp = { borderRadius: 10, border: 'none', background: '#f1f5f9' };
const lbl = { fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 };
const th = { fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', padding: '10px 14px', border: 'none', background: '#f8fafc' };
const accent = '#7c3aed';

export default function AdminDashboard() {
  const [tab, setTab] = useState('add-book');
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null); // { message, onConfirm, danger }

  /* Book form */
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
  const [issueLoading, setIssueLoading] = useState(false);

  /* Return */
  const [returnUserId, setReturnUserId] = useState(null);
  const [returnBookId, setReturnBookId] = useState(null);
  const [returnUserInfo, setReturnUserInfo] = useState(null);
  const [returnBookInfo, setReturnBookInfo] = useState(null);
  const [returnLoading, setReturnLoading] = useState(false);

  /* QR scanner */
  const [scannerTarget, setScannerTarget] = useState(null);

  /* Fine rule */
  const [fineRuleId, setFineRuleId] = useState('1');
  const [fineRuleData, setFineRuleData] = useState({ ruleId: 1, finePerDay: 2.0, gracePeriod: 3, maxFine: 500 });
  const [fineLoading, setFineLoading] = useState(false);

  /* QR mgmt */
  const [qrUserId, setQrUserId] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [allQrLoading, setAllQrLoading] = useState(false);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const askConfirm = (message, onConfirm, danger = true) => setConfirm({ message, onConfirm, danger });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, uRes] = await Promise.all([getAllBooks(), getAllUsers()]);
      // Guard: backend might return an error object or paginated wrapper instead of array
      const booksData = Array.isArray(bRes.data) ? bRes.data
        : Array.isArray(bRes.data?.content) ? bRes.data.content : [];
      const usersData = Array.isArray(uRes.data) ? uRes.data
        : Array.isArray(uRes.data?.content) ? uRes.data.content : [];
      if (!Array.isArray(bRes.data)) console.warn('getAllBooks returned non-array:', bRes.data);
      if (!Array.isArray(uRes.data)) console.warn('getAllUsers returned non-array:', uRes.data);
      setBooks(booksData);
      setUsers(usersData);
    } catch (err) {
      console.error('fetchAll error:', err);
      showToast('Failed to load data. Check console for details.', 'error');
    }
    finally { setLoading(false); }
  };

  /* ── Book CRUD ── */
  const resetBookForm = () => { setBookForm({ title: '', description: '', isbn: '', totalCopies: 1, availableCopies: 1, genre: '' }); setEditingBook(null); };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setBookLoading(true);
    try {
      if (editingBook) { await updateBook(editingBook.bookId, bookForm); showToast('Book updated!'); setEditingBook(null); }
      else { await addBook(bookForm); showToast('Book added!'); }
      resetBookForm(); fetchAll(); setTab('books');
    } catch (err) { showToast(err.response?.data || 'Failed to save book.', 'error'); }
    finally { setBookLoading(false); }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setBookForm({ title: book.title, description: book.description || '', isbn: book.isbn, totalCopies: book.totalCopies, availableCopies: book.availableCopies, genre: book.genre || '' });
    setTab('add-book');
  };

  const handleDeleteBook = (bookId, title) => askConfirm(
    `Permanently delete "${title}"? This cannot be undone.`,
    async () => {
      try { await deleteBook(bookId); showToast('Book deleted.', 'info'); setBooks(prev => prev.filter(b => b.bookId !== bookId)); }
      catch { showToast('Delete failed.', 'error'); }
      setConfirm(null);
    }
  );

  const handleDeleteAllBooks = () => askConfirm(
    '⚠️ Delete ALL books permanently? This is irreversible!',
    async () => {
      try { await deleteAllBooks(); showToast('All books deleted.', 'info'); setBooks([]); }
      catch { showToast('Delete failed.', 'error'); }
      setConfirm(null);
    }
  );

  /* ── User actions ── */
  const handleDeleteUser = (u) => askConfirm(
    `Delete user "${u.userName}" (#${u.userId})? This cannot be undone.`,
    async () => {
      try { await deleteUser(u.userId); showToast('User deleted.', 'info'); setUsers(prev => prev.filter(x => x.userId !== u.userId)); }
      catch { showToast('Delete failed.', 'error'); }
      setConfirm(null);
    }
  );

  const handleChangeRole = (u, role) => askConfirm(
    `Promote "${u.userName}" to ${role}?`,
    async () => {
      try {
        if (role === 'LIBRARIAN') await makeLibrarian(u.userId);
        else await makeAdmin(u.userId);
        showToast(`${u.userName} is now ${role}!`); fetchAll();
      } catch { showToast('Role change failed.', 'error'); }
      setConfirm(null);
    },
    false
  );

  /* ── QR Scan ── */
  const parseQR = (str) => {
    const obj = {};
    str.split('|').forEach(part => {
      const idx = part.indexOf(':');
      if (idx !== -1) obj[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
    });
    return obj;
  };

  const handleQrScan = useCallback((decoded) => {
    setScannerTarget(prev => {
      if (!prev) return null;
      const parsed = parseQR(decoded);
      const userId = parsed['USER_ID'] ? parseInt(parsed['USER_ID'], 10) : null;
      const bookId = parsed['BOOK_ID'] ? parseInt(parsed['BOOK_ID'], 10) : null;

      if (prev === 'issue-user') {
        const uid = userId ?? parseInt(decoded, 10);
        const found = users.find(u => u.userId === uid);
        setIssueUserId(uid); setIssueUserInfo(found ?? { userId: uid, userName: `User #${uid}` });
        showToast(`User scanned: ${found?.userName ?? `#${uid}`}`);
      } else if (prev === 'issue-book') {
        const bid = bookId ?? parseInt(decoded, 10);
        const found = books.find(b => b.bookId === bid);
        setIssueBookId(bid); setIssueBookInfo(found ?? { bookId: bid, title: `Book #${bid}` });
        showToast(`Book scanned: ${found?.title ?? `#${bid}`}`);
      } else if (prev === 'return-user') {
        const uid = userId ?? parseInt(decoded, 10);
        const found = users.find(u => u.userId === uid);
        setReturnUserId(uid); setReturnUserInfo(found ?? { userId: uid, userName: `User #${uid}` });
        showToast(`User scanned: ${found?.userName ?? `#${uid}`}`);
      } else if (prev === 'return-book') {
        const bid = bookId ?? parseInt(decoded, 10);
        const found = books.find(b => b.bookId === bid);
        setReturnBookId(bid); setReturnBookInfo(found ?? { bookId: bid, title: `Book #${bid}` });
        showToast(`Book scanned: ${found?.title ?? `#${bid}`}`);
      }
      return null;
    });
  }, [users, books]);

  /* ── Issue ── */
  const handleIssue = async () => {
    if (!issueUserId || !issueBookId) { showToast('Scan both QR codes first.', 'error'); return; }
    setIssueLoading(true);
    try {
      const res = await issueBook(issueUserId, issueBookId);
      showToast(typeof res.data === 'string' ? res.data : 'Book issued!');
      setIssueUserId(null); setIssueBookId(null); setIssueUserInfo(null); setIssueBookInfo(null);
      fetchAll();
    } catch (err) { showToast(err.response?.data || 'Issue failed.', 'error'); }
    finally { setIssueLoading(false); }
  };

  /* ── Return ── */
  const handleReturn = async () => {
    if (!returnUserId || !returnBookId) { showToast('Scan both QR codes first.', 'error'); return; }
    setReturnLoading(true);
    try {
      const issuedRes = await getIssuedBooks(returnUserId);
      const record = issuedRes.data.find(r => r.book?.bookId === returnBookId && !r.returned);
      if (!record) { showToast('No active issue record found.', 'error'); setReturnLoading(false); return; }
      const res = await returnBook(record.issueId);
      showToast(typeof res.data === 'string' ? res.data : 'Book returned!');
      setReturnUserId(null); setReturnBookId(null); setReturnUserInfo(null); setReturnBookInfo(null);
      fetchAll();
    } catch (err) { showToast(err.response?.data || 'Return failed.', 'error'); }
    finally { setReturnLoading(false); }
  };

  /* ── Fine Rule ── */
  const handleFineRule = async (e) => {
    e.preventDefault(); setFineLoading(true);
    try { await updateFineRule(parseInt(fineRuleId), fineRuleData); showToast('Fine rule updated!'); }
    catch (err) { showToast(err.response?.data || 'Update failed.', 'error'); }
    finally { setFineLoading(false); }
  };

  /* ── QR Mgmt ── */
  const handleRegenQR = async (e) => {
    e.preventDefault(); if (!qrUserId) return; setQrLoading(true);
    try { await regenerateUserQR(parseInt(qrUserId)); showToast('QR regenerated!'); setQrUserId(''); fetchAll(); }
    catch { showToast('QR regen failed.', 'error'); }
    finally { setQrLoading(false); }
  };

  const handleAllBooksQR = () => askConfirm(
    'Generate / overwrite QR codes for all books?',
    async () => {
      setAllQrLoading(true);
      try { await generateQRForAllBooks(); showToast('QR codes generated for all books!'); fetchAll(); }
      catch { showToast('Failed.', 'error'); }
      finally { setAllQrLoading(false); }
      setConfirm(null);
    },
    false
  );

  /* ── Filtered lists ── */
  const filteredBooks = books.filter(b =>
    b.title?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.isbn?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.genre?.toLowerCase().includes(bookSearch.toLowerCase())
  );
  const filteredUsers = users.filter(u =>
    u.userName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.emailId?.toLowerCase().includes(userSearch.toLowerCase())
  );

  /* ── QR scan card helper ── */
  const ScanCard = ({ info, onScan, onClear, scanKey, labelTitle, iconOverride, color = accent }) => (
    <div style={{
      border: `2px dashed ${info ? '#16a34a' : '#cbd5e1'}`,
      borderRadius: 14, padding: '1.25rem', textAlign: 'center',
      background: info ? '#f0fdf4' : '#f8fafc', transition: 'all .2s',
    }}>
      {info ? (
        <>
          <CheckCircle size={28} color="#16a34a" />
          <div style={{ fontWeight: 700, marginTop: 8, fontSize: '0.9rem' }}>{info.title || info.userName}</div>
          <div style={{ fontSize: '0.76rem', color: '#6b7280' }}>ID #{info.bookId || info.userId}</div>
          <button className="btn btn-sm btn-outline-danger mt-2" style={{ borderRadius: 8 }} onClick={onClear}>
            <X size={12} className="me-1" />Clear
          </button>
        </>
      ) : (
        <>
          {iconOverride ?? <QrCode size={30} color="#94a3b8" />}
          <div style={{ fontWeight: 600, marginTop: 8, color: '#374151', fontSize: '0.88rem' }}>{labelTitle}</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 10 }}>Not scanned yet</div>
          <button className="btn btn-sm" style={{ borderRadius: 8, background: color, color: '#fff' }} onClick={() => setScannerTarget(scanKey)}>
            <Camera size={13} className="me-1" />Scan
          </button>
        </>
      )}
    </div>
  );

  /* ════════ RENDER ════════ */
  return (
    <div style={{ paddingTop: 72, minHeight: '100vh', background: '#f0f0f8' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmModal message={confirm.message} danger={confirm.danger} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
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
      <div style={{ background: 'linear-gradient(135deg,#1e0050 0%,#7c3aed 100%)', paddingBottom: 0 }}>
        <div className="container" style={{ paddingTop: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '0.5rem 0.75rem' }}>
              <Shield size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 0, fontSize: '1.4rem', letterSpacing: '-0.3px' }}>
                Admin Dashboard
              </h2>
              <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>
                {books.length} books · {users.length} users ·{' '}
                {users.filter(u => u.role === 'LIBRARIAN').length} librarians ·{' '}
                {users.filter(u => u.role === 'ADMIN').length} admins
              </small>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); if (t.key !== 'add-book') resetBookForm(); }}
                style={{
                  border: 'none', borderRadius: '10px 10px 0 0',
                  padding: '0.5rem 1rem', fontWeight: 600, fontSize: '0.8rem',
                  display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                  background: tab === t.key ? '#fff' : 'rgba(255,255,255,0.12)',
                  color: tab === t.key ? accent : 'rgba(255,255,255,0.85)',
                  transition: 'all .15s',
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
            {/* ══ ADD / EDIT BOOK ══ */}
            {tab === 'add-book' && (
              <div className="row justify-content-center">
                <div className="col-md-9 col-lg-7">
                  <div className="card" style={card}>
                    <div className="card-body p-4">
                      <h5 style={{ fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PlusCircle size={20} color={accent} />{editingBook ? 'Edit Book' : 'Add New Book'}
                      </h5>
                      <form onSubmit={handleBookSubmit}>
                        <div className="row g-3">
                          <div className="col-12">
                            <label className="form-label" style={lbl}>Title *</label>
                            <input className="form-control" style={inp} placeholder="Book title"
                              value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} required />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label" style={lbl}>ISBN *</label>
                            <input className="form-control" style={inp} placeholder="978-x-xxx-xxxxx-x"
                              value={bookForm.isbn} onChange={e => setBookForm({ ...bookForm, isbn: e.target.value })} required />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label" style={lbl}>Genre</label>
                            <input className="form-control" style={inp} placeholder="e.g. Fiction"
                              value={bookForm.genre} onChange={e => setBookForm({ ...bookForm, genre: e.target.value })} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label" style={lbl}>Total Copies</label>
                            <input type="number" min={1} className="form-control" style={inp}
                              value={bookForm.totalCopies} onChange={e => setBookForm({ ...bookForm, totalCopies: parseInt(e.target.value) })} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label" style={lbl}>Available Copies</label>
                            <input type="number" min={0} className="form-control" style={inp}
                              value={bookForm.availableCopies} onChange={e => setBookForm({ ...bookForm, availableCopies: parseInt(e.target.value) })} />
                          </div>
                          <div className="col-12">
                            <label className="form-label" style={lbl}>Description</label>
                            <textarea className="form-control" style={inp} rows={3} placeholder="Brief summary…"
                              value={bookForm.description} onChange={e => setBookForm({ ...bookForm, description: e.target.value })} />
                          </div>
                        </div>

                        {editingBook?.qrCode && (
                          <div style={{ marginTop: 12, padding: '0.75rem', background: '#f5f3ff', borderRadius: 10, textAlign: 'center' }}>
                            <small style={{ color: '#6b7280', display: 'block', marginBottom: 6 }}>Current Book QR</small>
                            <img src={`data:image/png;base64,${editingBook.qrCode}`} alt="QR"
                              style={{ width: 88, height: 88, borderRadius: 8, padding: 4, background: '#fff' }} />
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 12, marginTop: '1.2rem' }}>
                          <button type="submit" className="btn flex-fill fw-semibold"
                            style={{ borderRadius: 10, background: accent, color: '#fff' }} disabled={bookLoading}>
                            {bookLoading && <span className="spinner-border spinner-border-sm me-2" />}
                            {editingBook ? 'Update Book' : 'Add Book'}
                          </button>
                          {editingBook && (
                            <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: 10 }} onClick={resetBookForm}>
                              <ChevronLeft size={14} className="me-1" />Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ VIEW / MANAGE BOOKS ══ */}
            {tab === 'books' && (
              <div className="card" style={card}>
                <div className="card-header bg-white border-0 px-4 pt-4 pb-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
                  style={{ borderRadius: '16px 16px 0 0' }}>
                  <h6 style={{ fontWeight: 700, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOpen size={17} color={accent} /> Books
                    <span style={{ background: '#ede9fe', color: accent, borderRadius: 6, padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700 }}>{books.length}</span>
                  </h6>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <div className="input-group input-group-sm" style={{ width: 210 }}>
                      <span className="input-group-text border-0" style={{ background: '#f1f5f9' }}><Search size={13} /></span>
                      <input className="form-control border-0" style={{ background: '#f1f5f9' }} placeholder="Search…"
                        value={bookSearch} onChange={e => setBookSearch(e.target.value)} />
                    </div>
                    <button className="btn btn-sm fw-semibold" style={{ borderRadius: 8, background: accent, color: '#fff' }}
                      onClick={() => { resetBookForm(); setTab('add-book'); }}>
                      <PlusCircle size={13} className="me-1" />Add
                    </button>
                    <button className="btn btn-sm btn-danger fw-semibold" style={{ borderRadius: 8 }} onClick={handleDeleteAllBooks}>
                      <Trash2 size={13} className="me-1" />Delete All
                    </button>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>{['ID', 'Title', 'ISBN', 'Genre', 'Copies', 'Avail', 'QR', 'Edit', 'Delete'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {filteredBooks.length === 0 && <tr><td colSpan={9} className="text-center text-muted py-4" style={{ fontSize: '0.88rem' }}>No books found.</td></tr>}
                      {filteredBooks.map(b => (
                        <tr key={b.bookId}>
                          <td style={{ fontSize: '0.77rem', color: '#9ca3af' }}>#{b.bookId}</td>
                          <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{b.title}</td>
                          <td style={{ fontSize: '0.77rem', color: '#9ca3af' }}>{b.isbn}</td>
                          <td>{b.genre ? <span style={{ background: '#ede9fe', color: accent, borderRadius: 6, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700 }}>{b.genre}</span> : '—'}</td>
                          <td style={{ fontSize: '0.875rem' }}>{b.totalCopies}</td>
                          <td><span style={{ background: b.availableCopies > 0 ? '#dcfce7' : '#fee2e2', color: b.availableCopies > 0 ? '#16a34a' : '#dc2626', borderRadius: 6, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700 }}>{b.availableCopies}</span></td>
                          <td>{b.qrCode ? <img src={`data:image/png;base64,${b.qrCode}`} alt="QR" style={{ width: 32, height: 32, borderRadius: 4, background: '#f8fafc', padding: 2 }} /> : <QrCode size={15} color="#d1d5db" />}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: 7, padding: '3px 8px' }} onClick={() => handleEditBook(b)}>
                              <Edit2 size={12} />
                            </button>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-danger" style={{ borderRadius: 7, padding: '3px 8px' }} onClick={() => handleDeleteBook(b.bookId, b.title)}>
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══ VIEW / MANAGE USERS ══ */}
            {tab === 'users' && (
              <div className="card" style={card}>
                <div className="card-header bg-white border-0 px-4 pt-4 pb-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
                  style={{ borderRadius: '16px 16px 0 0' }}>
                  <h6 style={{ fontWeight: 700, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={17} color={accent} /> Users
                    <span style={{ background: '#ede9fe', color: accent, borderRadius: 6, padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700 }}>{users.length}</span>
                  </h6>
                  <div className="input-group input-group-sm" style={{ width: 220 }}>
                    <span className="input-group-text border-0" style={{ background: '#f1f5f9' }}><Search size={13} /></span>
                    <input className="form-control border-0" style={{ background: '#f1f5f9' }} placeholder="Search users…"
                      value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>{['ID', 'Username', 'Email', 'Role', 'Fine', 'QR', 'Delete'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 && <tr><td colSpan={7} className="text-center text-muted py-4" style={{ fontSize: '0.88rem' }}>No users found.</td></tr>}
                      {filteredUsers.map(u => (
                        <tr key={u.userId}>
                          <td style={{ fontSize: '0.77rem', color: '#9ca3af' }}>#{u.userId}</td>
                          <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.userName}</td>
                          <td style={{ fontSize: '0.8rem', color: '#6b7280' }}>{u.emailId}</td>
                          <td>
                            <span style={{
                              borderRadius: 6, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700,
                              background: u.role === 'ADMIN' ? '#fee2e2' : u.role === 'LIBRARIAN' ? '#fef9c3' : '#ede9fe',
                              color: u.role === 'ADMIN' ? '#dc2626' : u.role === 'LIBRARIAN' ? '#92400e' : accent,
                            }}>{u.role}</span>
                          </td>
                          <td style={{ fontSize: '0.875rem' }}>
                            {u.fine > 0 ? <span style={{ color: '#dc2626', fontWeight: 700 }}>₹{u.fine?.toFixed(2)}</span> : <span style={{ color: '#9ca3af' }}>₹0</span>}
                          </td>
                          <td>{u.qrCode ? <img src={`data:image/png;base64,${u.qrCode}`} alt="QR" style={{ width: 32, height: 32, borderRadius: 4, background: '#f8fafc', padding: 2 }} /> : <QrCode size={15} color="#d1d5db" />}</td>
                          <td>
                            <button className="btn btn-sm btn-danger" style={{ borderRadius: 7, padding: '3px 8px' }} onClick={() => handleDeleteUser(u)}>
                              <UserX size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══ ISSUE BOOK (QR) ══ */}
            {tab === 'issue' && (
              <div className="row justify-content-center">
                <div className="col-md-10 col-lg-8">
                  <div className="card" style={card}>
                    <div className="card-body p-4">
                      <h5 style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ArrowRightLeft size={19} color={accent} /> Issue Book
                      </h5>
                      <p style={{ color: '#6b7280', fontSize: '0.84rem', marginBottom: '1.4rem' }}>
                        Scan the <strong>User QR</strong> then the <strong>Book QR</strong> to issue a book.
                      </p>
                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <ScanCard info={issueUserInfo} scanKey="issue-user" labelTitle="User QR"
                            iconOverride={<QrCode size={30} color="#94a3b8" />}
                            onScan={() => setScannerTarget('issue-user')} color={accent}
                            onClear={() => { setIssueUserId(null); setIssueUserInfo(null); }} />
                        </div>
                        <div className="col-md-6">
                          <ScanCard info={issueBookInfo} scanKey="issue-book" labelTitle="Book QR"
                            iconOverride={<BookOpen size={30} color="#94a3b8" />}
                            onScan={() => setScannerTarget('issue-book')} color={accent}
                            onClear={() => { setIssueBookId(null); setIssueBookInfo(null); }} />
                        </div>
                      </div>
                      {issueUserInfo && issueBookInfo && (
                        <div style={{ background: '#ede9fe', borderRadius: 12, padding: '0.8rem 1rem', marginBottom: '1rem', fontSize: '0.84rem' }}>
                          <strong>Ready:</strong> <em>{issueBookInfo.title}</em> → <em>{issueUserInfo.userName}</em>
                        </div>
                      )}
                      <button className="btn w-100 fw-semibold" style={{ borderRadius: 12, padding: '0.7rem', background: accent, color: '#fff' }}
                        onClick={handleIssue} disabled={issueLoading || !issueUserId || !issueBookId}>
                        {issueLoading ? <><span className="spinner-border spinner-border-sm me-2" />Processing…</> : <><ArrowRightLeft size={15} className="me-2" />Confirm Issue</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ RETURN BOOK (QR) ══ */}
            {tab === 'return' && (
              <div className="row justify-content-center">
                <div className="col-md-10 col-lg-8">
                  <div className="card" style={card}>
                    <div className="card-body p-4">
                      <h5 style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <RotateCcw size={19} color="#16a34a" /> Return Book
                      </h5>
                      <p style={{ color: '#6b7280', fontSize: '0.84rem', marginBottom: '1.4rem' }}>
                        Scan the <strong>User QR</strong> then the <strong>Book QR</strong> to process a return.
                      </p>
                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <ScanCard info={returnUserInfo} scanKey="return-user" labelTitle="User QR"
                            iconOverride={<QrCode size={30} color="#94a3b8" />}
                            onScan={() => setScannerTarget('return-user')} color="#16a34a"
                            onClear={() => { setReturnUserId(null); setReturnUserInfo(null); }} />
                        </div>
                        <div className="col-md-6">
                          <ScanCard info={returnBookInfo} scanKey="return-book" labelTitle="Book QR"
                            iconOverride={<BookOpen size={30} color="#94a3b8" />}
                            onScan={() => setScannerTarget('return-book')} color="#16a34a"
                            onClear={() => { setReturnBookId(null); setReturnBookInfo(null); }} />
                        </div>
                      </div>
                      {returnUserInfo && returnBookInfo && (
                        <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '0.8rem 1rem', marginBottom: '1rem', fontSize: '0.84rem' }}>
                          <strong>Ready:</strong> <em>{returnBookInfo.title}</em> from <em>{returnUserInfo.userName}</em>
                        </div>
                      )}
                      <button className="btn btn-success w-100 fw-semibold" style={{ borderRadius: 12, padding: '0.7rem' }}
                        onClick={handleReturn} disabled={returnLoading || !returnUserId || !returnBookId}>
                        {returnLoading ? <><span className="spinner-border spinner-border-sm me-2" />Processing…</> : <><RotateCcw size={15} className="me-2" />Confirm Return</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ ROLES ══ */}
            {tab === 'roles' && (
              <div className="card" style={card}>
                <div className="card-header bg-white border-0 px-4 pt-4 pb-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
                  style={{ borderRadius: '16px 16px 0 0' }}>
                  <h6 style={{ fontWeight: 700, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Crown size={17} color={accent} /> Role Management
                  </h6>
                  <div className="input-group input-group-sm" style={{ width: 220 }}>
                    <span className="input-group-text border-0" style={{ background: '#f1f5f9' }}><Search size={13} /></span>
                    <input className="form-control border-0" style={{ background: '#f1f5f9' }} placeholder="Search…"
                      value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                  </div>
                </div>

                {/* Role summary pills */}
                <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Users', count: users.filter(u => u.role === 'USER').length, bg: '#ede9fe', color: accent },
                    { label: 'Librarians', count: users.filter(u => u.role === 'LIBRARIAN').length, bg: '#fef9c3', color: '#92400e' },
                    { label: 'Admins', count: users.filter(u => u.role === 'ADMIN').length, bg: '#fee2e2', color: '#dc2626' },
                  ].map(r => (
                    <span key={r.label} style={{ background: r.bg, color: r.color, borderRadius: 8, padding: '4px 14px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {r.label}: {r.count}
                    </span>
                  ))}
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>{['ID', 'Username', 'Email', 'Current Role', 'Make Librarian', 'Make Admin'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.userId}>
                          <td style={{ fontSize: '0.77rem', color: '#9ca3af' }}>#{u.userId}</td>
                          <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.userName}</td>
                          <td style={{ fontSize: '0.8rem', color: '#6b7280' }}>{u.emailId}</td>
                          <td>
                            <span style={{
                              borderRadius: 6, padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700,
                              background: u.role === 'ADMIN' ? '#fee2e2' : u.role === 'LIBRARIAN' ? '#fef9c3' : '#ede9fe',
                              color: u.role === 'ADMIN' ? '#dc2626' : u.role === 'LIBRARIAN' ? '#92400e' : accent,
                            }}>{u.role}</span>
                          </td>
                          <td>
                            {u.role !== 'LIBRARIAN' && u.role !== 'ADMIN' ? (
                              <button className="btn btn-sm btn-outline-warning fw-semibold" style={{ borderRadius: 7, fontSize: '0.72rem' }}
                                onClick={() => handleChangeRole(u, 'LIBRARIAN')}>
                                <Crown size={11} className="me-1" />→ Librarian
                              </button>
                            ) : <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>—</span>}
                          </td>
                          <td>
                            {u.role !== 'ADMIN' ? (
                              <button className="btn btn-sm btn-outline-danger fw-semibold" style={{ borderRadius: 7, fontSize: '0.72rem' }}
                                onClick={() => handleChangeRole(u, 'ADMIN')}>
                                <Shield size={11} className="me-1" />→ Admin
                              </button>
                            ) : <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══ FINE RULES ══ */}
            {tab === 'fine-rules' && (
              <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                  <div className="card" style={card}>
                    <div className="card-body p-4">
                      <h5 style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Settings size={19} color={accent} /> Fine Rule Settings
                      </h5>
                      <p style={{ color: '#6b7280', fontSize: '0.84rem', marginBottom: '1.4rem' }}>
                        Configure the overdue fine rules applied to all borrowed books.
                      </p>

                      {/* Info banner */}
                      <div style={{ background: '#fef9c3', borderRadius: 10, padding: '0.7rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', display: 'flex', gap: 8 }}>
                        <AlertTriangle size={16} color="#92400e" style={{ flexShrink: 0, marginTop: 1 }} />
                        <span style={{ color: '#78350f' }}>Changes apply globally to all future fine calculations.</span>
                      </div>

                      <form onSubmit={handleFineRule}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label" style={lbl}>Rule ID</label>
                            <input type="number" min={1} className="form-control" style={inp}
                              value={fineRuleId} onChange={e => setFineRuleId(e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label" style={lbl}>Fine Per Day (₹)</label>
                            <input type="number" step="0.01" min={0} className="form-control" style={inp}
                              value={fineRuleData.finePerDay}
                              onChange={e => setFineRuleData({ ...fineRuleData, finePerDay: parseFloat(e.target.value) })} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label" style={lbl}>Grace Period (days)</label>
                            <input type="number" min={0} className="form-control" style={inp}
                              value={fineRuleData.gracePeriod}
                              onChange={e => setFineRuleData({ ...fineRuleData, gracePeriod: parseInt(e.target.value) })} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label" style={lbl}>Maximum Fine (₹)</label>
                            <input type="number" min={0} className="form-control" style={inp}
                              value={fineRuleData.maxFine}
                              onChange={e => setFineRuleData({ ...fineRuleData, maxFine: parseFloat(e.target.value) })} />
                          </div>
                        </div>

                        {/* Preview */}
                        <div style={{ background: '#f5f3ff', borderRadius: 10, padding: '0.75rem 1rem', margin: '1rem 0 0', fontSize: '0.82rem' }}>
                          <strong style={{ color: accent }}>Preview:</strong>{' '}
                          ₹{fineRuleData.finePerDay}/day after {fineRuleData.gracePeriod} day grace, max ₹{fineRuleData.maxFine}
                        </div>

                        <button type="submit" className="btn fw-semibold w-100 mt-3"
                          style={{ borderRadius: 10, background: accent, color: '#fff' }} disabled={fineLoading}>
                          {fineLoading ? <span className="spinner-border spinner-border-sm me-2" /> : <Settings size={14} className="me-2" />}
                          Update Fine Rule
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ QR MANAGEMENT ══ */}
            {tab === 'qr' && (
              <div className="row g-4 justify-content-center">

                {/* Regenerate per-user QR */}
                <div className="col-md-6 col-lg-5">
                  <div className="card h-100" style={card}>
                    <div className="card-body p-4">
                      <h5 style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <RefreshCw size={19} color={accent} /> Regenerate User QR
                      </h5>
                      <p style={{ color: '#6b7280', fontSize: '0.84rem', marginBottom: '1.2rem' }}>
                        Generate a fresh QR code for a specific user.
                      </p>
                      <form onSubmit={handleRegenQR}>
                        <label className="form-label" style={lbl}>Select User</label>
                        <select className="form-select mb-3" style={inp}
                          value={qrUserId} onChange={e => setQrUserId(e.target.value)} required>
                          <option value="">— choose a user —</option>
                          {users.map(u => (
                            <option key={u.userId} value={u.userId}>#{u.userId} {u.userName} ({u.role})</option>
                          ))}
                        </select>

                        {/* QR preview if user already has one */}
                        {qrUserId && (() => {
                          const u = users.find(x => x.userId === parseInt(qrUserId));
                          return u?.qrCode ? (
                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                              <small style={{ color: '#6b7280', display: 'block', marginBottom: 6 }}>Current QR</small>
                              <img src={`data:image/png;base64,${u.qrCode}`} alt="QR"
                                style={{ width: 80, height: 80, borderRadius: 8, background: '#fff', padding: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                            </div>
                          ) : null;
                        })()}

                        <button type="submit" className="btn fw-semibold w-100"
                          style={{ borderRadius: 10, background: accent, color: '#fff' }} disabled={qrLoading}>
                          {qrLoading ? <span className="spinner-border spinner-border-sm me-2" /> : <RefreshCw size={14} className="me-2" />}
                          Regenerate QR
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Generate QR for all books */}
                <div className="col-md-6 col-lg-5">
                  <div className="card h-100" style={card}>
                    <div className="card-body p-4 d-flex flex-column">
                      <h5 style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <QrCode size={19} color="#16a34a" /> Generate Book QRs
                      </h5>
                      <p style={{ color: '#6b7280', fontSize: '0.84rem', marginBottom: '1rem', flex: 1 }}>
                        Generates QR codes for every book in the library. Useful after a bulk import or if QRs are missing.
                      </p>
                      <div style={{ background: '#fef9c3', borderRadius: 10, padding: '0.65rem 0.9rem', marginBottom: '1.2rem', fontSize: '0.8rem', display: 'flex', gap: 8 }}>
                        <AlertTriangle size={15} color="#92400e" style={{ flexShrink: 0 }} />
                        <span style={{ color: '#78350f' }}>This will overwrite existing QR codes for all books.</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: '1rem', background: '#f0fdf4', borderRadius: 10, padding: '0.7rem 1rem' }}>
                        <BookOpen size={18} color="#16a34a" />
                        <span style={{ fontSize: '0.85rem', color: '#374151' }}>
                          <strong>{books.length}</strong> books · {books.filter(b => b.qrCode).length} already have QR
                        </span>
                      </div>
                      <button className="btn btn-success fw-semibold" style={{ borderRadius: 10 }}
                        onClick={handleAllBooksQR} disabled={allQrLoading}>
                        {allQrLoading ? <span className="spinner-border spinner-border-sm me-2" /> : <QrCode size={14} className="me-2" />}
                        Generate for All Books
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

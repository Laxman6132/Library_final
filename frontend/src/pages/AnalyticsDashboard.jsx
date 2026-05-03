import { useState, useEffect, useMemo } from 'react';
import {
  getAnalyticsMostBorrowed,
  getAnalyticsIssueTrends,
  getAnalyticsFineDefaulters,
  getAnalyticsInactiveUsers,
  sendRetentionEmails,
} from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import {
  BarChart3, TrendingUp, AlertTriangle, UserX,
  ArrowUpDown, ChevronUp, ChevronDown, Users, BookOpen, Mail, Loader2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart,
} from 'recharts';

/* ─── Shared styles ─── */
const card = {
  borderRadius: 16,
  border: 'none',
  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
  overflow: 'hidden',
};
const accent = 'var(--primary)';

/* ─── Custom Recharts tooltip ─── */
function CustomTooltip({ active, payload, label, valueLabel = 'Value' }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a1f35', color: '#fff', padding: '10px 14px',
      borderRadius: 10, fontSize: '0.82rem', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#fbbf24' }}>{valueLabel}: {payload[0].value}</div>
    </div>
  );
}

/* ─── Stat Card (top summary) ─── */
function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="col-md-3 col-sm-6">
      <div style={{
        ...card,
        padding: '1.25rem',
        display: 'flex', alignItems: 'center', gap: 14,
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.07)'; }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: bg, color: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 500 }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sortable Table Header ─── */
function SortTh({ label, field, sortField, sortDir, onSort, style = {} }) {
  const active = sortField === field;
  return (
    <th
      style={{
        fontSize: '0.75rem', fontWeight: 700, color: '#6b7280',
        padding: '10px 14px', border: 'none', background: '#f8fafc',
        cursor: 'pointer', userSelect: 'none', ...style,
      }}
      onClick={() => onSort(field)}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {label}
        {active
          ? (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)
          : <ArrowUpDown size={12} style={{ opacity: 0.3 }} />}
      </span>
    </th>
  );
}

export default function AnalyticsDashboard() {
  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [issueTrends, setIssueTrends] = useState([]);
  const [fineDefaulters, setFineDefaulters] = useState([]);
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  /* Sort state for fine defaulters table */
  const [sortField, setSortField] = useState('totalFines');
  const [sortDir, setSortDir] = useState('desc');

  /* Email sending state */
  const [sendingEmails, setSendingEmails] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [mbRes, itRes, fdRes, iuRes] = await Promise.all([
        getAnalyticsMostBorrowed(),
        getAnalyticsIssueTrends(),
        getAnalyticsFineDefaulters(),
        getAnalyticsInactiveUsers(),
      ]);
      setMostBorrowed(Array.isArray(mbRes.data) ? mbRes.data : []);
      setIssueTrends(Array.isArray(itRes.data) ? itRes.data : []);
      setFineDefaulters(Array.isArray(fdRes.data) ? fdRes.data : []);
      setInactiveUsers(Array.isArray(iuRes.data) ? iuRes.data : []);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setToast({ message: 'Failed to load analytics data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /* Sort handler */
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedDefaulters = useMemo(() => {
    const arr = [...fineDefaulters];
    arr.sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return arr;
  }, [fineDefaulters, sortField, sortDir]);

  /* Summary stats */
  const totalIssues = issueTrends.reduce((s, d) => s + (Number(d.totalIssues) || 0), 0);
  const totalFinesCollected = fineDefaulters.reduce((s, d) => s + (Number(d.totalFines) || 0), 0);

  /* Send retention emails handler */
  const handleSendRetentionEmails = async () => {
    if (sendingEmails || inactiveUsers.length === 0) return;
    setSendingEmails(true);
    try {
      const res = await sendRetentionEmails();
      setToast({ message: res.data?.message || 'Retention emails are being sent!', type: 'success' });
    } catch (err) {
      const msg = err.response?.status === 409
        ? err.response.data?.message || 'Email campaign already in progress.'
        : 'Failed to send retention emails.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSendingEmails(false);
    }
  };

  return (
    <div style={{ paddingTop: 10, minHeight: '100vh', background: 'transparent' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Header Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
        borderRadius: '24px', margin: '0 1rem', padding: '2rem 1rem 1.5rem',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '0.5rem 0.75rem' }}>
              <BarChart3 size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 0, fontSize: '1.4rem', letterSpacing: '-0.3px' }}>
                Analytics Dashboard
              </h2>
              <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>
                Library usage insights & reports
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {loading ? <LoadingSpinner text="Loading analytics…" /> : (
          <>
            {/* ── Summary Stats ── */}
            <div className="row g-3 mb-4">
              <StatCard
                icon={<BookOpen size={22} />}
                label="Top Book Borrows"
                value={mostBorrowed.length > 0 ? Number(mostBorrowed[0].totalIssues) : 0}
                color="var(--primary-dark)" bg="var(--primary-light)"
              />
              <StatCard
                icon={<TrendingUp size={22} />}
                label="Total Issues (All Time)"
                value={totalIssues}
                color="#059669" bg="#ecfdf5"
              />
              <StatCard
                icon={<AlertTriangle size={22} />}
                label="Total Fines Collected"
                value={`₹${totalFinesCollected}`}
                color="#dc2626" bg="#fef2f2"
              />
              <StatCard
                icon={<UserX size={22} />}
                label="Inactive Users"
                value={inactiveUsers.length}
                color="#9333ea" bg="#faf5ff"
              />
            </div>

            {/* ── Charts Row ── */}
            <div className="row g-4 mb-4">
              {/* Most Borrowed Books — Bar Chart */}
              <div className="col-lg-6">
                <div style={card}>
                  <div style={{ padding: '1.25rem 1.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BarChart3 size={18} color={accent} />
                    <h6 style={{ fontWeight: 700, marginBottom: 0 }}>Most Borrowed Books</h6>
                    <span style={{
                      background: 'var(--primary-light)', color: 'var(--primary-dark)',
                      borderRadius: 6, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700,
                    }}>Top 10</span>
                  </div>
                  {mostBorrowed.length === 0 ? (
                    <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#9ca3af' }}>
                      <BookOpen size={36} style={{ opacity: 0.3 }} />
                      <p style={{ marginTop: 8, fontSize: '0.88rem' }}>No borrowing data yet</p>
                    </div>
                  ) : (
                    <div style={{ padding: '0.5rem 0.5rem 1rem' }}>
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={mostBorrowed} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis
                            dataKey="title"
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            angle={-35}
                            textAnchor="end"
                            interval={0}
                            height={80}
                          />
                          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip valueLabel="Borrows" />} />
                          <Bar
                            dataKey="totalIssues"
                            fill="var(--primary)"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={42}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Issue Trends — Area/Line Chart */}
              <div className="col-lg-6">
                <div style={card}>
                  <div style={{ padding: '1.25rem 1.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrendingUp size={18} color="#059669" />
                    <h6 style={{ fontWeight: 700, marginBottom: 0 }}>Issue Trends Over Time</h6>
                  </div>
                  {issueTrends.length === 0 ? (
                    <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#9ca3af' }}>
                      <TrendingUp size={36} style={{ opacity: 0.3 }} />
                      <p style={{ marginTop: 8, fontSize: '0.88rem' }}>No trend data yet</p>
                    </div>
                  ) : (
                    <div style={{ padding: '0.5rem 0.5rem 1rem' }}>
                      <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={issueTrends} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                          <defs>
                            <linearGradient id="issueGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip valueLabel="Issues" />} />
                          <Area
                            type="monotone"
                            dataKey="totalIssues"
                            stroke="#059669"
                            strokeWidth={2.5}
                            fill="url(#issueGradient)"
                            dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Fine Defaulters Table ── */}
            <div style={{ ...card, marginBottom: '1.5rem' }}>
              <div style={{
                padding: '1.25rem 1.25rem 0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={18} color="#dc2626" />
                  <h6 style={{ fontWeight: 700, marginBottom: 0 }}>Fine Defaulters & Late Returners</h6>
                  <span style={{
                    background: '#fef2f2', color: '#dc2626',
                    borderRadius: 6, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700,
                  }}>{fineDefaulters.length}</span>
                </div>
                <small style={{ color: '#9ca3af', fontSize: '0.76rem' }}>Click column headers to sort</small>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', padding: '10px 14px', border: 'none', background: '#f8fafc' }}>#</th>
                      <SortTh label="User Name" field="userName" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                      <SortTh label="Email" field="email" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                      <SortTh label="Late Returns" field="lateReturns" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                      <SortTh label="Total Fines Paid" field="totalFines" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDefaulters.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: '#9ca3af', fontSize: '0.88rem' }}>
                          No fine defaulters found — great news!
                        </td>
                      </tr>
                    ) : (
                      sortedDefaulters.map((d, idx) => (
                        <tr key={d.userId}>
                          <td style={{ fontSize: '0.77rem', color: '#9ca3af' }}>{idx + 1}</td>
                          <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{d.userName}</td>
                          <td style={{ fontSize: '0.8rem', color: '#6b7280' }}>{d.email}</td>
                          <td>
                            <span style={{
                              background: Number(d.lateReturns) > 3 ? '#fef2f2' : '#fffbeb',
                              color: Number(d.lateReturns) > 3 ? '#dc2626' : '#92400e',
                              borderRadius: 6, padding: '2px 10px', fontSize: '0.78rem', fontWeight: 700,
                            }}>{d.lateReturns}</span>
                          </td>
                          <td>
                            <span style={{
                              color: Number(d.totalFines) > 0 ? '#dc2626' : '#9ca3af',
                              fontWeight: 700, fontSize: '0.875rem',
                            }}>₹{Number(d.totalFines).toFixed(2)}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Inactive Users ── */}
            <div style={card}>
              <div style={{
                padding: '1.25rem 1.25rem 0.75rem',
                display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
              }}>
                <UserX size={18} color="#9333ea" />
                <h6 style={{ fontWeight: 700, marginBottom: 0 }}>Inactive Users</h6>
                <span style={{
                  background: '#faf5ff', color: '#9333ea',
                  borderRadius: 6, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700,
                }}>{inactiveUsers.length}</span>
                <small style={{ color: '#9ca3af', fontSize: '0.74rem', marginLeft: 'auto' }}>
                  No activity in the last 6 months
                </small>
                {inactiveUsers.length > 0 && (
                  <button
                    onClick={handleSendRetentionEmails}
                    disabled={sendingEmails}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: sendingEmails ? '#d8b4fe' : 'linear-gradient(135deg, #9333ea, #7c3aed)',
                      color: '#fff', border: 'none', borderRadius: 8,
                      padding: '7px 16px', fontSize: '0.78rem', fontWeight: 600,
                      cursor: sendingEmails ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(147,51,234,0.25)',
                      opacity: sendingEmails ? 0.75 : 1,
                    }}
                    onMouseEnter={e => { if (!sendingEmails) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(147,51,234,0.35)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(147,51,234,0.25)'; }}
                  >
                    {sendingEmails ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Mail size={14} />}
                    {sendingEmails ? 'Sending…' : 'Send Retention Emails'}
                  </button>
                )}
              </div>
              {inactiveUsers.length === 0 ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#9ca3af' }}>
                  <Users size={36} style={{ opacity: 0.3 }} />
                  <p style={{ marginTop: 8, fontSize: '0.88rem' }}>All users are active — excellent!</p>
                </div>
              ) : (
                <div style={{
                  maxHeight: 360, overflowY: 'auto', padding: '0 1.25rem 1.25rem',
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12,
                }}>
                  {inactiveUsers.map(u => (
                    <div key={u.userId} style={{
                      border: '1px solid #f1f5f9', borderRadius: 12, padding: '0.85rem 1rem',
                      display: 'flex', alignItems: 'center', gap: 12,
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#e9d5ff'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(147,51,234,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: '#faf5ff', color: '#9333ea',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.85rem',
                      }}>
                        {(u.userName || '?')[0].toUpperCase()}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.userName}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

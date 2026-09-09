import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// ─── small helpers ────────────────────────────────────────────────────────────

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function Badge({ status }) {
    const map = {
        confirmed: { bg: '#dcfce7', color: '#16a34a' },
        pending:   { bg: '#fef9c3', color: '#ca8a04' },
        cancelled: { bg: '#fee2e2', color: '#dc2626' },
        completed: { bg: '#ede9fe', color: '#7c3aed' },
        active:    { bg: '#dcfce7', color: '#16a34a' },
        inactive:  { bg: '#f3f4f6', color: '#6b7280' },
        user:      { bg: '#dbeafe', color: '#1d4ed8' },
        host:      { bg: '#fce7f3', color: '#be185d' },
        admin:     { bg: '#fee2e2', color: '#dc2626' },
    };
    const s = map[status] || map.pending;
    return (
        <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
            {status}
        </span>
    );
}

function StatCard({ label, value, sub, color }) {
    return (
        <div className="bg-white rounded-xl p-5 shadow-sm" style={{ borderLeft: `4px solid ${color || '#1A1A18'}` }}>
            <p className="text-sm font-medium" style={{ color: '#5F5E5A' }}>{label}</p>
            <p className="text-3xl font-bold mt-1" style={{ color: '#1A1A18' }}>{value}</p>
            {sub && <p className="text-xs mt-1" style={{ color: '#B4B2A9' }}>{sub}</p>}
        </div>
    );
}

function Pagination({ page, pages, onChange }) {
    if (pages <= 1) return null;
    return (
        <div className="flex gap-2 justify-end mt-4">
            <button onClick={() => onChange(page - 1)} disabled={page <= 1}
                className="px-3 py-1 rounded border text-sm disabled:opacity-40"
                style={{ borderColor: '#1A1A18', color: '#1A1A18' }}>← Prev</button>
            <span className="px-3 py-1 text-sm" style={{ color: '#5F5E5A' }}>Page {page} / {pages}</span>
            <button onClick={() => onChange(page + 1)} disabled={page >= pages}
                className="px-3 py-1 rounded border text-sm disabled:opacity-40"
                style={{ borderColor: '#1A1A18', color: '#1A1A18' }}>Next →</button>
        </div>
    );
}

// ─── TAB: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ stats, recentUsers, recentBookings, monthlyRevenue }) {
    if (!stats) return <p style={{ color: '#B4B2A9' }}>Loading...</p>;
    return (
        <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Users"      value={fmt(stats.totalUsers)}      color="#3b82f6" />
                <StatCard label="Total Hosts"      value={fmt(stats.totalHosts)}      color="#8b5cf6" />
                <StatCard label="Total Properties" value={fmt(stats.totalProperties)} color="#10b981" />
                <StatCard label="Total Revenue"    value={`₹${fmt(stats.totalRevenue)}`} color="#f59e0b" />
                <StatCard label="Total Bookings"   value={fmt(stats.totalBookings)}   color="#6366f1" />
                <StatCard label="Confirmed"        value={fmt(stats.bookings?.confirmed)} color="#10b981" />
                <StatCard label="Pending"          value={fmt(stats.bookings?.pending)}  color="#f59e0b" />
                <StatCard label="Cancelled"        value={fmt(stats.bookings?.cancelled)} color="#ef4444" />
            </div>

            {/* Monthly Revenue Bar */}
            {monthlyRevenue?.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                    <h3 className="font-bold mb-4" style={{ color: '#1A1A18' }}>Monthly Revenue (Last 6 Months)</h3>
                    <div className="flex items-end gap-3 h-32">
                        {monthlyRevenue.map((m) => {
                            const maxRev = Math.max(...monthlyRevenue.map(x => x.revenue), 1);
                            const heightPct = Math.round((m.revenue / maxRev) * 100);
                            const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            return (
                                <div key={`${m._id.year}-${m._id.month}`} className="flex flex-col items-center flex-1 gap-1">
                                    <span className="text-xs" style={{ color: '#5F5E5A' }}>₹{fmt(m.revenue)}</span>
                                    <div style={{ height: `${Math.max(heightPct, 4)}%`, background: '#1A1A18', width: '100%', borderRadius: '4px 4px 0 0', minHeight: 6 }} />
                                    <span className="text-xs" style={{ color: '#B4B2A9' }}>{months[m._id.month]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <h3 className="font-bold mb-3" style={{ color: '#1A1A18' }}>Recent Sign-ups</h3>
                    <table className="w-full text-sm">
                        <tbody>
                            {(recentUsers || []).map(u => (
                                <tr key={u._id} className="border-b last:border-0" style={{ borderColor: 'rgba(26,26,24,0.08)' }}>
                                    <td className="py-2 font-medium" style={{ color: '#1A1A18' }}>{u.name}</td>
                                    <td className="py-2" style={{ color: '#5F5E5A' }}>{u.email}</td>
                                    <td className="py-2 text-right"><Badge status={u.role} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <h3 className="font-bold mb-3" style={{ color: '#1A1A18' }}>Recent Bookings</h3>
                    <table className="w-full text-sm">
                        <tbody>
                            {(recentBookings || []).map(b => (
                                <tr key={b._id} className="border-b last:border-0" style={{ borderColor: 'rgba(26,26,24,0.08)' }}>
                                    <td className="py-2 font-medium" style={{ color: '#1A1A18', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {b.property?.title || 'N/A'}
                                    </td>
                                    <td className="py-2" style={{ color: '#5F5E5A' }}>{b.user?.name || 'N/A'}</td>
                                    <td className="py-2 text-right"><Badge status={b.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ─── TAB: Users ───────────────────────────────────────────────────────────────

function UsersTab() {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [roleModal, setRoleModal] = useState(null); // { user, newRole }

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (search) params.search = search;
            if (roleFilter) params.role = roleFilter;
            const res = await api.get('/admin/users', { params });
            setUsers(res.data.users);
            setTotal(res.data.total);
            setPages(res.data.pages);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [page, search, roleFilter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleRoleChange = async () => {
        if (!roleModal) return;
        try {
            await api.put(`/admin/users/${roleModal.user._id}/role`, { role: roleModal.newRole });
            setRoleModal(null);
            fetchUsers();
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to update role');
        }
    };

    const handleDelete = async (userId, name) => {
        if (!window.confirm(`Delete user "${name}" and all their data? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            fetchUsers();
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to delete user');
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search name or email..."
                    className="flex-1 p-2.5 rounded-lg border text-sm outline-none"
                    style={{ borderColor: 'rgba(26,26,24,0.2)', color: '#1A1A18' }} />
                <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                    className="p-2.5 rounded-lg border text-sm outline-none"
                    style={{ borderColor: 'rgba(26,26,24,0.2)', color: '#1A1A18' }}>
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="host">Host</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <p className="text-xs mb-3" style={{ color: '#B4B2A9' }}>{fmt(total)} users found</p>

            {loading ? (
                <p style={{ color: '#B4B2A9' }} className="text-center py-8">Loading...</p>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(26,26,24,0.1)', background: '#FAFAF8' }}>
                                {['Name', 'Email', 'Role', 'Joined', 'Verified', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: '#5F5E5A' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id} className="border-b hover:bg-gray-50" style={{ borderColor: 'rgba(26,26,24,0.06)' }}>
                                    <td className="px-4 py-3 font-medium" style={{ color: '#1A1A18' }}>{u.name}</td>
                                    <td className="px-4 py-3" style={{ color: '#5F5E5A' }}>{u.email}</td>
                                    <td className="px-4 py-3"><Badge status={u.role} /></td>
                                    <td className="px-4 py-3" style={{ color: '#5F5E5A' }}>{fmtDate(u.createdAt)}</td>
                                    <td className="px-4 py-3">
                                        <span style={{ color: (u.isEmailVerified || u.isVerified) ? '#16a34a' : '#dc2626', fontWeight: 700, fontSize: 12 }}>
                                            {(u.isEmailVerified || u.isVerified) ? '✓ Yes' : '✗ No'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => setRoleModal({ user: u, newRole: u.role })}
                                                className="text-xs px-2 py-1 rounded border transition-colors hover:bg-gray-100"
                                                style={{ borderColor: '#1A1A18', color: '#1A1A18' }}>
                                                Change Role
                                            </button>
                                            <button onClick={() => handleDelete(u._id, u.name)}
                                                className="text-xs px-2 py-1 rounded border transition-colors hover:bg-red-50"
                                                style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Pagination page={page} pages={pages} onChange={setPage} />

            {/* Role Change Modal */}
            {roleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4">
                        <h3 className="font-bold mb-4" style={{ color: '#1A1A18' }}>Change Role — {roleModal.user.name}</h3>
                        <select value={roleModal.newRole}
                            onChange={e => setRoleModal({ ...roleModal, newRole: e.target.value })}
                            className="w-full p-3 rounded-lg border mb-4"
                            style={{ borderColor: 'rgba(26,26,24,0.2)' }}>
                            <option value="user">User</option>
                            <option value="host">Host</option>
                            <option value="admin">Admin</option>
                        </select>
                        <div className="flex gap-3">
                            <button onClick={handleRoleChange}
                                className="flex-1 py-2 rounded-lg text-white font-medium"
                                style={{ background: '#1A1A18' }}>Save</button>
                            <button onClick={() => setRoleModal(null)}
                                className="flex-1 py-2 rounded-lg border"
                                style={{ borderColor: '#1A1A18', color: '#1A1A18' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── TAB: Properties ─────────────────────────────────────────────────────────

function PropertiesTab() {
    const [properties, setProperties] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchProps = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (search) params.search = search;
            const res = await api.get('/admin/properties', { params });
            setProperties(res.data.properties);
            setTotal(res.data.total);
            setPages(res.data.pages);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [page, search]);

    useEffect(() => { fetchProps(); }, [fetchProps]);

    const handleToggle = async (id) => {
        try {
            await api.put(`/admin/properties/${id}/toggle`);
            fetchProps();
        } catch (e) { alert(e.response?.data?.message || 'Failed'); }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete property "${title}" and all bookings/reviews? Cannot be undone.`)) return;
        try {
            await api.delete(`/admin/properties/${id}`);
            fetchProps();
        } catch (e) { alert(e.response?.data?.message || 'Failed to delete'); }
    };

    return (
        <div>
            <div className="flex gap-3 mb-4">
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search title or city..."
                    className="flex-1 p-2.5 rounded-lg border text-sm outline-none"
                    style={{ borderColor: 'rgba(26,26,24,0.2)', color: '#1A1A18' }} />
            </div>
            <p className="text-xs mb-3" style={{ color: '#B4B2A9' }}>{fmt(total)} properties</p>

            {loading ? <p className="text-center py-8" style={{ color: '#B4B2A9' }}>Loading...</p> : (
                <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(26,26,24,0.1)', background: '#FAFAF8' }}>
                                {['Image', 'Title', 'Host', 'Location', 'Price/Night', 'Rating', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: '#5F5E5A' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {properties.map(p => (
                                <tr key={p._id} className="border-b hover:bg-gray-50" style={{ borderColor: 'rgba(26,26,24,0.06)' }}>
                                    <td className="px-4 py-3">
                                        <img src={p.images?.[0]?.url || 'https://via.placeholder.com/60x40'}
                                            alt="" className="w-14 h-10 object-cover rounded" />
                                    </td>
                                    <td className="px-4 py-3 font-medium" style={{ color: '#1A1A18', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                                    <td className="px-4 py-3" style={{ color: '#5F5E5A' }}>{p.host?.name || '—'}</td>
                                    <td className="px-4 py-3" style={{ color: '#5F5E5A' }}>{p.location?.city}, {p.location?.country}</td>
                                    <td className="px-4 py-3 font-semibold" style={{ color: '#1A1A18' }}>₹{fmt(p.price)}</td>
                                    <td className="px-4 py-3" style={{ color: '#1A1A18' }}>⭐ {p.rating?.toFixed(1) || '—'}</td>
                                    <td className="px-4 py-3"><Badge status={p.isAvailable ? 'active' : 'inactive'} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleToggle(p._id)}
                                                className="text-xs px-2 py-1 rounded border transition-colors hover:bg-gray-100"
                                                style={{ borderColor: '#1A1A18', color: '#1A1A18' }}>
                                                {p.isAvailable ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button onClick={() => handleDelete(p._id, p.title)}
                                                className="text-xs px-2 py-1 rounded border transition-colors hover:bg-red-50"
                                                style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Pagination page={page} pages={pages} onChange={setPage} />
        </div>
    );
}

// ─── TAB: Bookings ────────────────────────────────────────────────────────────

function BookingsTab() {
    const [bookings, setBookings] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (statusFilter) params.status = statusFilter;
            const res = await api.get('/admin/bookings', { params });
            setBookings(res.data.bookings);
            setTotal(res.data.total);
            setPages(res.data.pages);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [page, statusFilter]);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/admin/bookings/${id}/status`, { status });
            fetchBookings();
        } catch (e) { alert(e.response?.data?.message || 'Failed'); }
    };

    return (
        <div>
            <div className="flex gap-3 mb-4">
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="p-2.5 rounded-lg border text-sm outline-none"
                    style={{ borderColor: 'rgba(26,26,24,0.2)', color: '#1A1A18' }}>
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
            <p className="text-xs mb-3" style={{ color: '#B4B2A9' }}>{fmt(total)} bookings</p>

            {loading ? <p className="text-center py-8" style={{ color: '#B4B2A9' }}>Loading...</p> : (
                <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(26,26,24,0.1)', background: '#FAFAF8' }}>
                                {['Property', 'Guest', 'Check-in', 'Check-out', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: '#5F5E5A' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b._id} className="border-b hover:bg-gray-50" style={{ borderColor: 'rgba(26,26,24,0.06)' }}>
                                    <td className="px-4 py-3 font-medium" style={{ color: '#1A1A18', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {b.property?.title || '—'}
                                    </td>
                                    <td className="px-4 py-3" style={{ color: '#5F5E5A' }}>{b.user?.name || '—'}</td>
                                    <td className="px-4 py-3" style={{ color: '#5F5E5A' }}>{fmtDate(b.checkIn)}</td>
                                    <td className="px-4 py-3" style={{ color: '#5F5E5A' }}>{fmtDate(b.checkOut)}</td>
                                    <td className="px-4 py-3 font-semibold" style={{ color: '#1A1A18' }}>₹{fmt(b.totalPrice)}</td>
                                    <td className="px-4 py-3"><Badge status={b.paymentStatus} /></td>
                                    <td className="px-4 py-3"><Badge status={b.status} /></td>
                                    <td className="px-4 py-3">
                                        <select value={b.status}
                                            onChange={e => handleStatusUpdate(b._id, e.target.value)}
                                            className="text-xs p-1.5 rounded border outline-none"
                                            style={{ borderColor: 'rgba(26,26,24,0.2)', color: '#1A1A18' }}>
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Pagination page={page} pages={pages} onChange={setPage} />
        </div>
    );
}

// ─── TAB: Reviews ─────────────────────────────────────────────────────────────

function ReviewsTab() {
    const [reviews, setReviews] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/reviews', { params: { page, limit: 15 } });
            setReviews(res.data.reviews);
            setTotal(res.data.total);
            setPages(res.data.pages);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [page]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this review? This will also recalculate the property rating.')) return;
        try {
            await api.delete(`/admin/reviews/${id}`);
            fetchReviews();
        } catch (e) { alert(e.response?.data?.message || 'Failed to delete'); }
    };

    const stars = (n) => '⭐'.repeat(Math.min(n, 5));

    return (
        <div>
            <p className="text-xs mb-3" style={{ color: '#B4B2A9' }}>{fmt(total)} reviews</p>
            {loading ? <p className="text-center py-8" style={{ color: '#B4B2A9' }}>Loading...</p> : (
                <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(26,26,24,0.1)', background: '#FAFAF8' }}>
                                {['Property', 'Reviewer', 'Rating', 'Comment', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: '#5F5E5A' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map(r => (
                                <tr key={r._id} className="border-b hover:bg-gray-50" style={{ borderColor: 'rgba(26,26,24,0.06)' }}>
                                    <td className="px-4 py-3 font-medium" style={{ color: '#1A1A18', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {r.property?.title || '—'}
                                    </td>
                                    <td className="px-4 py-3" style={{ color: '#5F5E5A' }}>{r.user?.name || '—'}</td>
                                    <td className="px-4 py-3 font-semibold">{stars(r.rating)} ({r.rating})</td>
                                    <td className="px-4 py-3" style={{ color: '#5F5E5A', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.comment}</td>
                                    <td className="px-4 py-3" style={{ color: '#B4B2A9' }}>{fmtDate(r.createdAt)}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleDelete(r._id)}
                                            className="text-xs px-2 py-1 rounded border transition-colors hover:bg-red-50"
                                            style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Pagination page={page} pages={pages} onChange={setPage} />
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const TABS = [
    { id: 'overview',    label: '📊 Overview' },
    { id: 'users',       label: '👥 Users' },
    { id: 'properties',  label: '🏠 Properties' },
    { id: 'bookings',    label: '📅 Bookings' },
    { id: 'reviews',     label: '⭐ Reviews' },
];

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [overviewData, setOverviewData] = useState(null);
    const [overviewLoading, setOverviewLoading] = useState(true);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        api.get('/admin/stats')
            .then(res => setOverviewData(res.data))
            .catch(console.error)
            .finally(() => setOverviewLoading(false));
    }, [navigate]);

    return (
        <div className="min-h-screen" style={{ background: '#FAFAF8', paddingTop: 80, paddingBottom: 40 }}>
            <div className="max-w-7xl mx-auto px-4">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold" style={{ fontFamily: 'Georgia, serif', color: '#1A1A18' }}>
                        Admin Dashboard
                    </h1>
                    <p style={{ color: '#5F5E5A', marginTop: 4 }}>Manage users, properties, bookings and reviews.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 flex-wrap mb-8 border-b" style={{ borderColor: 'rgba(26,26,24,0.12)' }}>
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className="px-4 py-2.5 text-sm font-medium transition-all"
                            style={{
                                color: activeTab === t.id ? '#1A1A18' : '#B4B2A9',
                                borderBottom: activeTab === t.id ? '2px solid #1A1A18' : '2px solid transparent',
                                background: 'transparent',
                                cursor: 'pointer',
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    overviewLoading
                        ? <p className="text-center py-16" style={{ color: '#B4B2A9' }}>Loading dashboard...</p>
                        : <OverviewTab
                            stats={overviewData?.stats}
                            recentUsers={overviewData?.recentUsers}
                            recentBookings={overviewData?.recentBookings}
                            monthlyRevenue={overviewData?.monthlyRevenue}
                        />
                )}
                {activeTab === 'users'      && <UsersTab />}
                {activeTab === 'properties' && <PropertiesTab />}
                {activeTab === 'bookings'   && <BookingsTab />}
                {activeTab === 'reviews'    && <ReviewsTab />}
            </div>
        </div>
    );
}

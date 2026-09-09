import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// ── helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function StatusBadge({ status }) {
    const map = {
        confirmed: { bg: '#dcfce7', color: '#16a34a' },
        pending:   { bg: '#fef9c3', color: '#ca8a04' },
        cancelled: { bg: '#fee2e2', color: '#dc2626' },
        completed: { bg: '#ede9fe', color: '#7c3aed' },
    };
    const s = map[status] || map.pending;
    return (
        <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
            {status}
        </span>
    );
}

function StatCard({ label, value, sub, icon, color }) {
    return (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            style={{ borderLeft: `4px solid ${color || '#1A1A18'}` }}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium" style={{ color: '#5F5E5A' }}>{label}</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#1A1A18' }}>{value}</p>
                    {sub && <p className="text-xs mt-1" style={{ color: '#B4B2A9' }}>{sub}</p>}
                </div>
                {icon && <span className="text-2xl">{icon}</span>}
            </div>
        </div>
    );
}

// ── Tab: Properties ──────────────────────────────────────────────────────────

function PropertiesTab({ properties, onDelete, navigate }) {
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async (id) => {
        setDeleting(true);
        await onDelete(id);
        setDeleteConfirm(null);
        setDeleting(false);
    };

    if (properties.length === 0) return (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <div className="text-5xl mb-4">🏠</div>
            <p className="mb-4 font-medium" style={{ color: '#5F5E5A' }}>No properties listed yet</p>
            <button onClick={() => navigate('/add-property')}
                className="px-6 py-2.5 rounded-lg font-medium text-sm"
                style={{ background: '#1A1A18', color: '#FAFAF8' }}>
                List Your First Property
            </button>
        </div>
    );

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {properties.map(p => (
                    <div key={p._id}
                        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col">
                        <div className="relative">
                            <img src={p.images?.[0]?.url || 'https://via.placeholder.com/400x200?text=No+Image'}
                                alt={p.title} className="w-full h-44 object-cover" />
                            {/* availability pill */}
                            <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full"
                                style={{
                                    background: p.isAvailable ? '#dcfce7' : '#fee2e2',
                                    color: p.isAvailable ? '#16a34a' : '#dc2626',
                                }}>
                                {p.isAvailable ? '● Active' : '● Paused'}
                            </span>
                        </div>
                        <div className="p-4 flex-1">
                            <h3 className="font-bold text-base leading-snug mb-1" style={{ color: '#1A1A18' }}>
                                {p.title}
                            </h3>
                            <p className="text-xs mb-2" style={{ color: '#5F5E5A' }}>
                                📍 {p.location?.city}, {p.location?.country}
                            </p>
                            <div className="flex gap-3 text-xs mb-3" style={{ color: '#B4B2A9' }}>
                                <span>🛏 {p.bedrooms || 0} beds</span>
                                <span>🚿 {p.bathrooms || 0} baths</span>
                                <span>👥 {p.maxGuests || 0} guests</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-base" style={{ color: '#1A1A18' }}>
                                    ₹{fmt(p.price)}<span className="text-xs font-normal text-gray-400"> /night</span>
                                </p>
                                <div className="flex items-center gap-1 text-xs font-semibold">
                                    <span className="text-yellow-500">★</span>
                                    <span style={{ color: '#1A1A18' }}>{p.rating ? p.rating.toFixed(1) : 'New'}</span>
                                    <span style={{ color: '#B4B2A9' }}>({p.totalReviews || 0})</span>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 pb-4 flex gap-2">
                            <button onClick={() => navigate(`/property/${p._id}`)}
                                className="flex-1 py-2 text-xs rounded-lg border font-medium hover:bg-gray-50 transition"
                                style={{ borderColor: '#1A1A18', color: '#1A1A18' }}>View</button>
                            <button onClick={() => navigate(`/edit-property/${p._id}`)}
                                className="flex-1 py-2 text-xs rounded-lg border font-medium hover:bg-gray-50 transition"
                                style={{ borderColor: '#1A1A18', color: '#1A1A18' }}>Edit</button>
                            <button onClick={() => setDeleteConfirm(p._id)}
                                className="px-3 py-2 text-xs rounded-lg border font-medium hover:bg-red-50 transition"
                                style={{ borderColor: '#ef4444', color: '#ef4444' }}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
                        <h3 className="font-bold text-lg mb-2" style={{ color: '#1A1A18' }}>Delete Property</h3>
                        <p className="text-sm mb-6" style={{ color: '#5F5E5A' }}>
                            This will permanently delete the property. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting}
                                className="flex-1 py-2.5 rounded-lg font-medium text-sm text-white"
                                style={{ background: '#ef4444' }}>
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} disabled={deleting}
                                className="flex-1 py-2.5 rounded-lg font-medium text-sm border hover:bg-gray-50"
                                style={{ borderColor: '#1A1A18', color: '#1A1A18' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ── Tab: Bookings ────────────────────────────────────────────────────────────

function BookingsTab() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selected, setSelected] = useState(null);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter) params.status = filter;
            const res = await api.get('/properties/host/bookings', { params });
            setBookings(res.data.bookings || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [filter]);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    if (loading) return <p className="text-center py-10" style={{ color: '#B4B2A9' }}>Loading bookings...</p>;

    return (
        <div>
            {/* Filter */}
            <div className="flex gap-2 flex-wrap mb-4">
                {['', 'pending', 'confirmed', 'cancelled', 'completed'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className="px-4 py-1.5 rounded-full text-xs font-semibold border transition-all"
                        style={{
                            background: filter === s ? '#1A1A18' : 'transparent',
                            color: filter === s ? '#FAFAF8' : '#1A1A18',
                            borderColor: '#1A1A18',
                        }}>
                        {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
                    </button>
                ))}
            </div>

            {bookings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                    <div className="text-4xl mb-3">📅</div>
                    <p style={{ color: '#5F5E5A' }}>No bookings yet for your properties.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {bookings.map(b => (
                        <div key={b._id}
                            className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition cursor-pointer"
                            onClick={() => setSelected(selected?._id === b._id ? null : b)}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex gap-4 items-center">
                                    <img src={b.property?.images?.[0]?.url || 'https://via.placeholder.com/60x60'}
                                        alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: '#1A1A18' }}>
                                            {b.property?.title || 'Property'}
                                        </p>
                                        <p className="text-xs" style={{ color: '#5F5E5A' }}>
                                            Guest: <strong>{b.user?.name}</strong> · {b.user?.email}
                                        </p>
                                        <p className="text-xs" style={{ color: '#B4B2A9' }}>
                                            {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)} · {b.guests} guest{b.guests !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold" style={{ color: '#1A1A18' }}>₹{fmt(b.totalPrice)}</p>
                                    <StatusBadge status={b.status} />
                                    <p className="text-xs mt-1" style={{ color: '#B4B2A9' }}>{b.paymentMethod || 'N/A'}</p>
                                </div>
                            </div>
                            {/* Expanded details */}
                            {selected?._id === b._id && (
                                <div className="mt-4 pt-4 border-t grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm"
                                    style={{ borderColor: 'rgba(26,26,24,0.08)' }}>
                                    <div><p className="text-xs" style={{ color: '#B4B2A9' }}>Booking ID</p><p className="font-mono text-xs" style={{ color: '#1A1A18' }}>{b._id}</p></div>
                                    <div><p className="text-xs" style={{ color: '#B4B2A9' }}>Booked On</p><p style={{ color: '#1A1A18' }}>{fmtDate(b.createdAt)}</p></div>
                                    <div><p className="text-xs" style={{ color: '#B4B2A9' }}>Payment</p><p style={{ color: '#1A1A18' }}>{b.paymentStatus}</p></div>
                                    {b.specialRequests && (
                                        <div className="col-span-2 sm:col-span-4">
                                            <p className="text-xs" style={{ color: '#B4B2A9' }}>Special Requests</p>
                                            <p className="text-sm italic" style={{ color: '#5F5E5A' }}>"{b.specialRequests}"</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Tab: Reviews ─────────────────────────────────────────────────────────────

function ReviewsTab() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/properties/host/reviews')
            .then(res => setReviews(res.data.reviews || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const stars = (n) => '★'.repeat(Math.min(n, 5)) + '☆'.repeat(Math.max(0, 5 - n));

    if (loading) return <p className="text-center py-10" style={{ color: '#B4B2A9' }}>Loading reviews...</p>;

    return (
        <div>
            {reviews.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                    <div className="text-4xl mb-3">⭐</div>
                    <p style={{ color: '#5F5E5A' }}>No reviews yet. Keep hosting to earn your first review!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(r => (
                        <div key={r._id} className="bg-white rounded-xl border border-gray-100 p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                        style={{ background: '#1A1A18' }}>
                                        {r.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: '#1A1A18' }}>{r.user?.name}</p>
                                        <p className="text-xs" style={{ color: '#B4B2A9' }}>{fmtDate(r.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-yellow-500 font-bold">{stars(r.rating)}</p>
                                    <p className="text-xs" style={{ color: '#5F5E5A' }}>{r.property?.title}</p>
                                </div>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed" style={{ color: '#5F5E5A' }}>
                                &ldquo;{r.comment}&rdquo;
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Tab: Earnings ────────────────────────────────────────────────────────────

function EarningsTab({ stats, monthlyEarnings }) {
    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const maxEarning = Math.max(...(monthlyEarnings || []).map(m => m.earnings), 1);

    return (
        <div className="space-y-6">
            {/* Earnings summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Total Earnings" value={`₹${fmt(stats?.totalEarnings)}`} icon="💰" color="#10b981" />
                <StatCard label="Confirmed Bookings" value={fmt(stats?.totalBookings)} icon="✅" color="#3b82f6" />
                <StatCard label="Pending Bookings" value={fmt(stats?.pendingBookings)} icon="⏳" color="#f59e0b" />
            </div>

            {/* Monthly bar chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-bold mb-5" style={{ color: '#1A1A18' }}>Monthly Earnings (Last 6 Months)</h3>
                {!monthlyEarnings?.length ? (
                    <p className="text-center py-8" style={{ color: '#B4B2A9' }}>No earnings data yet.</p>
                ) : (
                    <div className="flex items-end gap-3 h-36">
                        {monthlyEarnings.map((m) => {
                            const pct = Math.round((m.earnings / maxEarning) * 100);
                            return (
                                <div key={`${m._id.year}-${m._id.month}`}
                                    className="flex flex-col items-center flex-1 gap-1">
                                    <span className="text-xs font-semibold" style={{ color: '#5F5E5A' }}>
                                        ₹{fmt(m.earnings)}
                                    </span>
                                    <div className="group relative w-full" style={{ height: `${Math.max(pct, 4)}%`, minHeight: 8 }}>
                                        <div className="w-full h-full rounded-t-md transition-all"
                                            style={{ background: '#1A1A18' }} />
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap hidden group-hover:block bg-black text-white px-1.5 py-0.5 rounded">
                                            {m.bookings} booking{m.bookings !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <span className="text-xs" style={{ color: '#B4B2A9' }}>
                                        {months[m._id.month]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Tips */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-bold mb-4" style={{ color: '#1A1A18' }}>💡 Tips to Earn More</h3>
                <ul className="space-y-2 text-sm" style={{ color: '#5F5E5A' }}>
                    <li>✅ Keep your listing photos updated and high-quality</li>
                    <li>✅ Respond to booking requests quickly to improve ranking</li>
                    <li>✅ Offer competitive pricing — check similar properties in your area</li>
                    <li>✅ Add all available amenities to attract more guests</li>
                    <li>✅ Maintain a 4.5+ rating by providing exceptional service</li>
                </ul>
            </div>
        </div>
    );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

const TABS = [
    { id: 'properties', label: '🏠 Properties' },
    { id: 'bookings',   label: '📅 Bookings' },
    { id: 'reviews',    label: '⭐ Reviews' },
    { id: 'earnings',   label: '💰 Earnings' },
];

export default function HostDashboard() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [stats, setStats] = useState({});
    const [monthlyEarnings, setMonthlyEarnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('properties');

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchHostData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        try {
            setLoading(true); setError('');

            const [propertiesRes, statsRes] = await Promise.all([
                api.get('/properties/host/properties'),
                api.get('/properties/host/stats'),
            ]);

            setProperties(propertiesRes.data?.properties || []);
            setStats(statsRes.data?.stats || {});
            setMonthlyEarnings(statsRes.data?.monthlyEarnings || []);
        } catch (err) {
            console.error('Error fetching host data:', err);
            setError(err.response?.data?.message || 'Failed to load host dashboard.');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => { fetchHostData(); }, [fetchHostData]);

    const handleDeleteProperty = async (propertyId) => {
        try {
            await api.delete(`/properties/${propertyId}`);
            setProperties(prev => prev.filter(p => p._id !== propertyId));
            setStats(prev => ({ ...prev, totalProperties: Math.max(0, (prev.totalProperties || 1) - 1) }));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete property');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAF8' }}>
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
                <p style={{ color: '#5F5E5A' }}>Loading dashboard...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#FAFAF8' }}>
            <div className="bg-white p-6 rounded-xl text-center max-w-md w-full shadow-sm">
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={fetchHostData} className="px-6 py-2 rounded-lg text-white font-medium"
                    style={{ background: '#1A1A18' }}>Retry</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen" style={{ background: '#FAFAF8', paddingTop: 80, paddingBottom: 40 }}>
            <div className="max-w-6xl mx-auto px-4">

                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Georgia, serif', color: '#1A1A18' }}>
                            Host Dashboard
                        </h1>
                        <p style={{ color: '#5F5E5A', marginTop: 4 }}>
                            Welcome back, {user.name?.split(' ')[0] || 'Host'}! Here's how your listings are doing.
                        </p>
                    </div>
                    <button onClick={() => navigate('/add-property')}
                        className="self-start sm:self-auto px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                        style={{ background: '#1A1A18', color: '#FAFAF8' }}>
                        + Add New Property
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Properties"  value={stats.totalProperties || 0} icon="🏠" color="#3b82f6" />
                    <StatCard label="Bookings"    value={stats.totalBookings || 0}   icon="📅" color="#10b981" />
                    <StatCard label="Earnings"    value={`₹${fmt(stats.totalEarnings)}`} icon="💰" color="#f59e0b" />
                    <StatCard label="Avg Rating"  value={`${stats.avgRating || 0} ★`}
                        sub={`${stats.totalReviews || 0} reviews`} icon="⭐" color="#8b5cf6" />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 flex-wrap mb-8 border-b" style={{ borderColor: 'rgba(26,26,24,0.12)' }}>
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className="px-4 py-2.5 text-sm font-medium transition-all"
                            style={{
                                color: activeTab === t.id ? '#1A1A18' : '#B4B2A9',
                                borderBottom: activeTab === t.id ? '2px solid #1A1A18' : '2px solid transparent',
                                background: 'transparent',
                                cursor: 'pointer',
                            }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'properties' && (
                    <PropertiesTab properties={properties} onDelete={handleDeleteProperty} navigate={navigate} />
                )}
                {activeTab === 'bookings' && <BookingsTab />}
                {activeTab === 'reviews'  && <ReviewsTab />}
                {activeTab === 'earnings' && <EarningsTab stats={stats} monthlyEarnings={monthlyEarnings} />}
            </div>
        </div>
    );
}

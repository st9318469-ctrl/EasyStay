import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';

export default function BookingManagement() {
    const [categories, setCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const navigate = useNavigate();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/bookings/my-bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data.categories);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, 
                { reason: 'Cancelled by user' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Booking cancelled successfully');
            fetchBookings();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            confirmed: { background: "#10B98120", color: "#10B981" },
            pending: { background: "#F59E0B20", color: "#F59E0B" },
            cancelled: { background: "#EF444420", color: "#EF4444" },
            completed: { background: "#6B728020", color: "#6B7280" }
        };
        const style = styles[status] || styles.pending;
        return (
            <span className="px-2 py-1 rounded-full text-xs font-medium" style={style}>
                {status.toUpperCase()}
            </span>
        );
    };

    const tabs = [
        { id: 'upcoming', label: 'Upcoming', count: categories?.counts?.upcoming || 0 },
        { id: 'current', label: 'Current', count: categories?.counts?.current || 0 },
        { id: 'past', label: 'Past', count: categories?.counts?.past || 0 },
        { id: 'cancelled', label: 'Cancelled', count: categories?.counts?.cancelled || 0 }
    ];

    const currentBookings = categories[activeTab] || [];

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                <p style={{ color: "#5F5E5A" }}>Loading your bookings...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm" style={{ color: "#5F5E5A" }}>Total Bookings</p>
                    <p className="text-2xl font-bold" style={{ color: "#1A1A18" }}>{categories?.counts?.total || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm" style={{ color: "#5F5E5A" }}>Upcoming</p>
                    <p className="text-2xl font-bold" style={{ color: "#1A1A18" }}>{categories?.counts?.upcoming || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm" style={{ color: "#5F5E5A" }}>Current</p>
                    <p className="text-2xl font-bold" style={{ color: "#1A1A18" }}>{categories?.counts?.current || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm" style={{ color: "#5F5E5A" }}>Completed</p>
                    <p className="text-2xl font-bold" style={{ color: "#1A1A18" }}>{categories?.counts?.past || 0}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b" style={{ borderColor: "rgba(26,26,24,0.12)" }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="px-4 py-2 font-medium transition-all duration-200"
                        style={{
                            color: activeTab === tab.id ? "#1A1A18" : "#B4B2A9",
                            borderBottom: activeTab === tab.id ? "2px solid #1A1A18" : "2px solid transparent"
                        }}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
                {currentBookings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl">
                        <p className="mb-4" style={{ color: "#B4B2A9" }}>No {activeTab} bookings found</p>
                        <button
                            onClick={() => navigate('/properties')}
                            className="px-6 py-2 rounded-lg transition-all duration-200"
                            style={{ background: "#1A1A18", color: "#FAFAF8" }}
                        >
                            Browse Properties
                        </button>
                    </div>
                ) : (
                    currentBookings.map(booking => (
                        <div key={booking._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row">
                                <div className="md:w-48 h-48">
                                    <img
                                        src={booking.property?.images?.[0]?.url || '/placeholder.jpg'}
                                        alt={booking.property?.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold mb-1" style={{ color: "#1A1A18" }}>
                                                {booking.property?.title}
                                            </h3>
                                            <p className="text-sm mb-2" style={{ color: "#5F5E5A" }}>
                                                📍 {booking.property?.location?.city}, {booking.property?.location?.country}
                                            </p>
                                        </div>
                                        {getStatusBadge(booking.status)}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div>
                                            <p className="text-xs" style={{ color: "#B4B2A9" }}>Check In</p>
                                            <p className="font-medium" style={{ color: "#1A1A18" }}>
                                                {new Date(booking.checkIn).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs" style={{ color: "#B4B2A9" }}>Check Out</p>
                                            <p className="font-medium" style={{ color: "#1A1A18" }}>
                                                {new Date(booking.checkOut).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs" style={{ color: "#B4B2A9" }}>Guests</p>
                                            <p className="font-medium" style={{ color: "#1A1A18" }}>{booking.guests}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs" style={{ color: "#B4B2A9" }}>Total Price</p>
                                            <p className="font-medium" style={{ color: "#1A1A18" }}>
                                                ₹{booking.totalPrice?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {booking.status === 'confirmed' && new Date(booking.checkIn) > new Date() && (
                                        <button
                                            onClick={() => handleCancelBooking(booking._id)}
                                            className="text-sm px-4 py-2 rounded-lg transition-all duration-200"
                                            style={{ color: "#E24B4A", border: "1px solid #E24B4A" }}
                                            onMouseEnter={e => { e.currentTarget.style.background = "#E24B4A"; e.currentTarget.style.color = "#FAFAF8"; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#E24B4A"; }}
                                        >
                                            Cancel Booking
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api/config";

export default function Dashboard() {
    const [categories, setCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Extracted fetch function wrapped with useCallback
    const fetchBookings = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            
            const response = await axios.get(`${API_BASE_URL}/api/bookings/my-bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setCategories(response.data.categories || {});
        } catch (error) {
            console.error("Failed to fetch bookings:", {
                apiUrl: API_BASE_URL,
                status: error?.response?.status,
                message: error?.response?.data?.message || error.message
            });
            if (error?.response?.status === 401) {
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Booking cancelled successfully!");
            fetchBookings(); // Now accessible without scope errors
        } catch (error) {
            alert(error.response?.data?.message || "Failed to cancel booking");
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            confirmed: { background: "#10B98120", color: "#10B981", label: "Confirmed" },
            pending: { background: "#F59E0B20", color: "#F59E0B", label: "Pending" },
            cancelled: { background: "#EF444420", color: "#EF4444", label: "Cancelled" },
            completed: { background: "#6B728020", color: "#6B7280", label: "Completed" }
        };
        const style = styles[status] || styles.pending;
        return (
            <span className="px-3 py-1 rounded-full text-xs font-medium" style={style}>
                {style.label}
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
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p style={{ color: "#5F5E5A" }}>Loading your bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Georgia, serif", color: "#1A1A18" }}>
                        My Dashboard
                    </h1>
                    <p style={{ color: "#5F5E5A" }}>Welcome back, {user.name || "Traveler"}! Here are your bookings.</p>
                </div>

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
                        <p className="text-sm" style={{ color: "#5F5E5A" }}>Current Stays</p>
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
                {currentBookings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl">
                        <div className="mb-4">
                            <span className="text-6xl">🏠</span>
                        </div>
                        <p className="mb-4" style={{ color: "#B4B2A9" }}>No {activeTab} bookings found</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2 rounded-lg transition-all duration-200"
                            style={{ background: "#1A1A18", color: "#FAFAF8" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#2A2A28"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#1A1A18"; }}
                        >
                            Browse Properties
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {currentBookings.map(booking => (
                            <div key={booking._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row">
                                    {/* Property Image */}
                                    <div className="md:w-48 h-48">
                                        <img
                                            src={booking.property?.images?.[0]?.url || "https://via.placeholder.com/200x200"}
                                            alt={booking.property?.title || "Property Image"}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    
                                    {/* Booking Details */}
                                    <div className="flex-1 p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold mb-1" style={{ color: "#1A1A18" }}>
                                                    {booking.property?.title || "Property Details Unavailable"}
                                                </h3>
                                                <p className="text-sm" style={{ color: "#5F5E5A" }}>
                                                    📍 {booking.property?.location?.city || 'N/A'}, {booking.property?.location?.country || 'N/A'}
                                                </p>
                                            </div>
                                            {getStatusBadge(booking.status)}
                                        </div>
                                        
                                        {/* Booking Info Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs" style={{ color: "#B4B2A9" }}>Check In</p>
                                                <p className="font-medium" style={{ color: "#1A1A18" }}>
                                                    {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric', 
                                                        year: 'numeric' 
                                                    }) : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs" style={{ color: "#B4B2A9" }}>Check Out</p>
                                                <p className="font-medium" style={{ color: "#1A1A18" }}>
                                                    {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric', 
                                                        year: 'numeric' 
                                                    }) : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs" style={{ color: "#B4B2A9" }}>Guests</p>
                                                <p className="font-medium" style={{ color: "#1A1A18" }}>{booking.guests || 0} guests</p>
                                            </div>
                                            <div>
                                                <p className="text-xs" style={{ color: "#B4B2A9" }}>Total Price</p>
                                                <p className="font-bold" style={{ color: "#1A1A18" }}>
                                                    ₹{booking.totalPrice ? booking.totalPrice.toLocaleString() : '0'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Booking Date */}
                                        <div className="text-xs mb-4" style={{ color: "#B4B2A9" }}>
                                            Booked on: {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        {booking.status === 'confirmed' && (
                                            <button
                                                onClick={() => handleCancelBooking(booking._id)}
                                                className="text-sm px-4 py-2 rounded-lg transition-all duration-200"
                                                style={{ 
                                                    color: "#E24B4A", 
                                                    border: "1px solid #E24B4A",
                                                    background: "transparent"
                                                }}
                                                onMouseEnter={e => { 
                                                    e.currentTarget.style.background = "#E24B4A"; 
                                                    e.currentTarget.style.color = "#FAFAF8"; 
                                                }}
                                                onMouseLeave={e => { 
                                                    e.currentTarget.style.background = "transparent"; 
                                                    e.currentTarget.style.color = "#E24B4A"; 
                                                }}
                                            >
                                                Cancel Booking
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
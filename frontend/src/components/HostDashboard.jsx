import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function HostDashboard() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('properties');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchHostData();
    }, []);

    const fetchHostData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            
            // Fetch properties
            const propertiesRes = await axios.get(`${API_URL}/api/properties/host/properties`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProperties(propertiesRes.data.properties);
            
            // Fetch stats
            const statsRes = await axios.get(`${API_URL}/api/properties/host/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(statsRes.data.stats);
            
        } catch (error) {
            console.error('Error fetching host data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProperty = async (propertyId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/properties/${propertyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchHostData();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting property:', error);
            alert(error.response?.data?.message || 'Failed to delete property');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p style={{ color: "#5F5E5A" }}>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: "#FAFAF8", padding: "80px 0" }}>
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Georgia, serif", color: "#1A1A18" }}>
                        Host Dashboard
                    </h1>
                    <p style={{ color: "#5F5E5A" }}>Manage your properties and track earnings</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <p className="text-sm" style={{ color: "#5F5E5A" }}>Total Properties</p>
                        <p className="text-2xl font-bold" style={{ color: "#1A1A18" }}>{stats.totalProperties || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <p className="text-sm" style={{ color: "#5F5E5A" }}>Total Bookings</p>
                        <p className="text-2xl font-bold" style={{ color: "#1A1A18" }}>{stats.totalBookings || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <p className="text-sm" style={{ color: "#5F5E5A" }}>Total Earnings</p>
                        <p className="text-2xl font-bold" style={{ color: "#1A1A18" }}>₹{stats.totalEarnings?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <p className="text-sm" style={{ color: "#5F5E5A" }}>Average Rating</p>
                        <p className="text-2xl font-bold" style={{ color: "#1A1A18" }}>{stats.avgRating || 0} ★</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b" style={{ borderColor: "rgba(26,26,24,0.12)" }}>
                    <button
                        onClick={() => setActiveTab('properties')}
                        className="px-4 py-2 font-medium transition-all"
                        style={{
                            color: activeTab === 'properties' ? "#1A1A18" : "#B4B2A9",
                            borderBottom: activeTab === 'properties' ? "2px solid #1A1A18" : "2px solid transparent"
                        }}
                    >
                        My Properties ({properties.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('add')}
                        className="px-4 py-2 font-medium transition-all"
                        style={{
                            color: activeTab === 'add' ? "#1A1A18" : "#B4B2A9",
                            borderBottom: activeTab === 'add' ? "2px solid #1A1A18" : "2px solid transparent"
                        }}
                    >
                        + Add New Property
                    </button>
                </div>

                {/* Properties List */}
                {activeTab === 'properties' && (
                    <div>
                        {properties.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl">
                                <div className="mb-4">
                                    <span className="text-6xl">🏠</span>
                                </div>
                                <p className="mb-4" style={{ color: "#B4B2A9" }}>You haven't listed any properties yet</p>
                                <button
                                    onClick={() => setActiveTab('add')}
                                    className="px-6 py-2 rounded-lg"
                                    style={{ background: "#1A1A18", color: "#FAFAF8" }}
                                >
                                    List Your First Property
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {properties.map(property => (
                                    <div key={property._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <img
                                            src={property.images?.[0]?.url || "https://via.placeholder.com/400x200"}
                                            alt={property.title}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg mb-1" style={{ color: "#1A1A18" }}>{property.title}</h3>
                                                    <p className="text-sm mb-2" style={{ color: "#5F5E5A" }}>
                                                        📍 {property.location?.city}, {property.location?.country}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-yellow-500">★</span>
                                                    <span style={{ color: "#1A1A18" }}>{property.rating || "New"}</span>
                                                </div>
                                            </div>
                                            <p className="font-bold mb-3" style={{ color: "#1A1A18" }}>
                                                ₹{property.price} <span className="text-sm font-normal text-gray-500">/ night</span>
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/property/${property._id}`)}
                                                    className="flex-1 px-3 py-2 text-sm rounded-lg border"
                                                    style={{ borderColor: "#1A1A18", color: "#1A1A18" }}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/edit-property/${property._id}`)}
                                                    className="flex-1 px-3 py-2 text-sm rounded-lg border"
                                                    style={{ borderColor: "#1A1A18", color: "#1A1A18" }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(property._id)}
                                                    className="px-3 py-2 text-sm rounded-lg border border-red-300 text-red-500 hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Add Property Form */}
                {activeTab === 'add' && (
                    <div className="bg-white rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4" style={{ color: "#1A1A18" }}>Add New Property</h2>
                        <p className="mb-6" style={{ color: "#5F5E5A" }}>Fill in the details to list your property</p>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            navigate('/add-property');
                        }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>Property Title</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border rounded-lg"
                                        style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                        placeholder="e.g., Luxury Beach Villa"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>Property Type</label>
                                    <select className="w-full p-3 border rounded-lg" style={{ borderColor: "rgba(26,26,24,0.2)" }}>
                                        <option>Villa</option>
                                        <option>Apartment</option>
                                        <option>Cabin</option>
                                        <option>Cottage</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                className="w-full py-3 rounded-lg font-bold"
                                style={{ background: "#1A1A18", color: "#FAFAF8" }}
                            >
                                Continue to Full Form →
                            </button>
                        </form>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#1A1A18" }}>Delete Property</h2>
                            <p className="mb-6" style={{ color: "#5F5E5A" }}>
                                Are you sure you want to delete this property? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleDeleteProperty(deleteConfirm)}
                                    className="flex-1 py-2 rounded-lg font-medium"
                                    style={{ background: "#E24B4A", color: "#FAFAF8" }}
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-2 rounded-lg font-medium border"
                                    style={{ borderColor: "#1A1A18", color: "#1A1A18" }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AccountSettings() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [settings, setSettings] = useState({});
    const [message, setMessage] = useState({ text: '', type: '' });
    
    // Profile form
    const [profileForm, setProfileForm] = useState({
        name: '',
        phone: '',
        bio: '',
        location: ''
    });
    
    // Notification settings
    const [notificationSettings, setNotificationSettings] = useState({
        bookingConfirmation: true,
        promotionalEmails: false,
        bookingReminders: true
    });
    
    // Privacy settings
    const [privacySettings, setPrivacySettings] = useState({
        showEmail: false,
        showPhone: false,
        profileVisibility: 'public'
    });
    
    // Preferences
    const [preferences, setPreferences] = useState({
        language: 'en',
        currency: 'INR',
        timezone: 'Asia/Kolkata'
    });
    
    // Delete account
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const data = response.data.settings;
            setSettings(data);
            
            setProfileForm({
                name: data.profile?.name || '',
                phone: data.profile?.phone || '',
                bio: data.profile?.bio || '',
                location: data.profile?.location || ''
            });
            
            setNotificationSettings(data.notifications || {});
            setPrivacySettings(data.privacy || {});
            setPreferences(data.preferences || {});
            
        } catch (error) {
            console.error('Error fetching settings:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/settings/profile`, profileForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            
            // Update localStorage
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            storedUser.name = profileForm.name;
            localStorage.setItem('user', JSON.stringify(storedUser));
            
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Update failed', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleNotificationUpdate = async () => {
        setSaving(true);
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/settings/notifications`, notificationSettings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessage({ text: 'Notification settings updated!', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Update failed', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handlePrivacyUpdate = async () => {
        setSaving(true);
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/settings/privacy`, privacySettings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessage({ text: 'Privacy settings updated!', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Update failed', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handlePreferencesUpdate = async () => {
        setSaving(true);
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/settings/preferences`, preferences, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessage({ text: 'Preferences updated!', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Update failed', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setMessage({ text: 'Please enter your password', type: 'error' });
            return;
        }
        
        setDeleteLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/settings/account`, {
                data: { password: deletePassword },
                headers: { Authorization: `Bearer ${token}` }
            });
            
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            alert('Account deleted successfully');
            navigate('/');
            
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Failed to delete account', type: 'error' });
        } finally {
            setDeleteLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p style={{ color: "#5F5E5A" }}>Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: "#FAFAF8", padding: "80px 0" }}>
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Georgia, serif", color: "#1A1A18" }}>
                        Account Settings
                    </h1>
                    <p style={{ color: "#5F5E5A" }}>Manage your account preferences and privacy</p>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg text-center ${
                        message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b text-center" style={{ borderColor: "rgba(26,26,24,0.08)" }}>
                                <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white text-2xl font-bold mx-auto">
                                    {settings.profile?.name?.charAt(0) || 'U'}
                                </div>
                                <h3 className="font-semibold mt-2" style={{ color: "#1A1A18" }}>{settings.profile?.name}</h3>
                                <p className="text-xs text-gray-400">{settings.profile?.email}</p>
                                <p className="text-xs text-gray-400 mt-1">Member since {new Date(settings.memberSince).toLocaleDateString()}</p>
                            </div>
                            <div className="p-2">
                                {[
                                    { id: 'profile', label: 'Profile', icon: '👤' },
                                    { id: 'notifications', label: 'Notifications', icon: '🔔' },
                                    { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
                                    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
                                    { id: 'activity', label: 'Activity', icon: '📊' },
                                    { id: 'danger', label: 'Danger Zone', icon: '⚠️' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full text-left px-4 py-2 rounded-lg mb-1 transition ${
                                            activeTab === tab.id ? 'bg-black text-white' : 'hover:bg-gray-100'
                                        }`}
                                        style={{ color: activeTab === tab.id ? '#FAFAF8' : '#1A1A18' }}
                                    >
                                        <span className="mr-2">{tab.icon}</span> {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            {/* Profile Settings */}
                            {activeTab === 'profile' && (
                                <form onSubmit={handleProfileUpdate}>
                                    <h2 className="text-xl font-bold mb-4" style={{ color: "#1A1A18" }}>Profile Information</h2>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={profileForm.name}
                                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                className="w-full p-3 border rounded-lg"
                                                style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                className="w-full p-3 border rounded-lg"
                                                style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Location</label>
                                            <input
                                                type="text"
                                                value={profileForm.location}
                                                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                                                className="w-full p-3 border rounded-lg"
                                                style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                                placeholder="City, Country"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Bio</label>
                                            <textarea
                                                value={profileForm.bio}
                                                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                                                rows="3"
                                                className="w-full p-3 border rounded-lg"
                                                style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>
                                        
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-6 py-2 rounded-lg font-medium"
                                            style={{ background: "#1A1A18", color: "#FAFAF8" }}
                                        >
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Notification Settings */}
                            {activeTab === 'notifications' && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4" style={{ color: "#1A1A18" }}>Notification Preferences</h2>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between py-3 border-b">
                                            <div>
                                                <p className="font-medium">Booking Confirmation</p>
                                                <p className="text-sm text-gray-500">Receive email when you book a property</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.bookingConfirmation}
                                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, bookingConfirmation: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                            </label>
                                        </div>
                                        
                                        <div className="flex items-center justify-between py-3 border-b">
                                            <div>
                                                <p className="font-medium">Booking Reminders</p>
                                                <p className="text-sm text-gray-500">Get reminders before your stay</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.bookingReminders}
                                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, bookingReminders: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                            </label>
                                        </div>
                                        
                                        <div className="flex items-center justify-between py-3 border-b">
                                            <div>
                                                <p className="font-medium">Promotional Emails</p>
                                                <p className="text-sm text-gray-500">Receive offers and updates</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.promotionalEmails}
                                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, promotionalEmails: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={handleNotificationUpdate}
                                        disabled={saving}
                                        className="mt-6 px-6 py-2 rounded-lg font-medium"
                                        style={{ background: "#1A1A18", color: "#FAFAF8" }}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}

                            {/* Privacy Settings */}
                            {activeTab === 'privacy' && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4" style={{ color: "#1A1A18" }}>Privacy & Security</h2>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between py-3 border-b">
                                            <div>
                                                <p className="font-medium">Show Email on Profile</p>
                                                <p className="text-sm text-gray-500">Allow others to see your email</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={privacySettings.showEmail}
                                                    onChange={(e) => setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                            </label>
                                        </div>
                                        
                                        <div className="flex items-center justify-between py-3 border-b">
                                            <div>
                                                <p className="font-medium">Show Phone on Profile</p>
                                                <p className="text-sm text-gray-500">Allow others to see your phone number</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={privacySettings.showPhone}
                                                    onChange={(e) => setPrivacySettings({ ...privacySettings, showPhone: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                            </label>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Profile Visibility</label>
                                            <select
                                                value={privacySettings.profileVisibility}
                                                onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
                                                className="w-full p-3 border rounded-lg"
                                                style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                            >
                                                <option value="public">Public - Everyone can see</option>
                                                <option value="hosts-only">Hosts Only - Only property hosts</option>
                                                <option value="private">Private - Only you</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={handlePrivacyUpdate}
                                        disabled={saving}
                                        className="mt-6 px-6 py-2 rounded-lg font-medium"
                                        style={{ background: "#1A1A18", color: "#FAFAF8" }}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}

                            {/* Preferences */}
                            {activeTab === 'preferences' && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4" style={{ color: "#1A1A18" }}>Preferences</h2>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Language</label>
                                            <select
                                                value={preferences.language}
                                                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                                                className="w-full p-3 border rounded-lg"
                                                style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                            >
                                                <option value="en">English</option>
                                                <option value="hi">Hindi</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Currency</label>
                                            <select
                                                value={preferences.currency}
                                                onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                                                className="w-full p-3 border rounded-lg"
                                                style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                            >
                                                <option value="INR">Indian Rupee (₹)</option>
                                                <option value="USD">US Dollar ($)</option>
                                                <option value="EUR">Euro (€)</option>
                                                <option value="GBP">British Pound (£)</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Timezone</label>
                                            <select
                                                value={preferences.timezone}
                                                onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                                                className="w-full p-3 border rounded-lg"
                                                style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                            >
                                                <option value="Asia/Kolkata">India (IST)</option>
                                                <option value="America/New_York">USA (EST)</option>
                                                <option value="Europe/London">UK (GMT)</option>
                                                <option value="Asia/Tokyo">Japan (JST)</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={handlePreferencesUpdate}
                                        disabled={saving}
                                        className="mt-6 px-6 py-2 rounded-lg font-medium"
                                        style={{ background: "#1A1A18", color: "#FAFAF8" }}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}

                            {/* Activity */}
                            {activeTab === 'activity' && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4" style={{ color: "#1A1A18" }}>Account Activity</h2>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                                            <p className="text-2xl font-bold" style={{ color: "#1A1A18" }}>{settings.totalBookings || 0}</p>
                                            <p className="text-sm text-gray-500">Total Bookings</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                                            <p className="text-2xl font-bold" style={{ color: "#1A1A18" }}>{settings.totalReviews || 0}</p>
                                            <p className="text-sm text-gray-500">Reviews Written</p>
                                        </div>
                                    </div>
                                    
                                    <h3 className="font-semibold mb-3">Recent Activity</h3>
                                    <div className="space-y-3">
                                        {settings.recentBookings?.slice(0, 5).map(booking => (
                                            <div key={booking._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden">
                                                    <img src={booking.property?.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{booking.property?.title}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Booked on {new Date(booking.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Danger Zone */}
                            {activeTab === 'danger' && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4 text-red-600">Danger Zone</h2>
                                    <div className="border border-red-200 rounded-lg p-4">
                                        <div className="mb-4">
                                            <h3 className="font-semibold mb-1">Delete Account</h3>
                                            <p className="text-sm text-gray-500">
                                                Once you delete your account, there is no going back. All your data will be permanently removed.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            className="px-4 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600 transition"
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4 text-red-600">Delete Account</h2>
                        <p className="mb-4 text-gray-600">
                            This action cannot be undone. All your data including bookings, reviews, and properties will be permanently deleted.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Enter your password to confirm</label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="w-full p-3 border rounded-lg"
                                placeholder="Your password"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading}
                                className="flex-1 py-2 rounded-lg bg-red-500 text-white font-medium"
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete Account'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletePassword('');
                                }}
                                className="flex-1 py-2 rounded-lg border"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        bio: '',
        location: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            
            const response = await api.get('/profile');
            
            setUser(response.data.user);
            setFormData({
                name: response.data.user.name || '',
                phone: response.data.user.phone || '',
                bio: response.data.user.bio || '',
                location: response.data.user.location || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    fetchProfile();
}, [navigate]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            const response = await api.put('/profile', formData);
            
            setUser(response.data.user);
            setEditing(false);
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            
            // Update localStorage
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            storedUser.name = response.data.user.name;
            localStorage.setItem('user', JSON.stringify(storedUser));
            
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Update failed', type: 'error' });
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ text: 'New passwords do not match', type: 'error' });
            return;
        }
        
        if (passwordData.newPassword.length < 6) {
            setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
            return;
        }
        
        setUpdateLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            await api.put('/profile/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            
            setMessage({ text: 'Password changed successfully!', type: 'success' });
            setChangingPassword(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Password change failed', type: 'error' });
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p style={{ color: "#5F5E5A" }}>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: "#FAFAF8", padding: "80px 0" }}>
            <div className="max-w-3xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Georgia, serif", color: "#1A1A18" }}>
                        My Profile
                    </h1>
                    <p style={{ color: "#5F5E5A" }}>Manage your account information</p>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg text-center ${
                        message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Profile Header */}
                    <div className="p-6 border-b" style={{ borderColor: "rgba(26,26,24,0.08)" }}>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white text-2xl font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold" style={{ color: "#1A1A18" }}>{user?.name}</h2>
                                <p style={{ color: "#5F5E5A" }}>{user?.email}</p>
                                <p style={{ color: "#B4B2A9", fontSize: "12px" }}>Member since {new Date(user?.joinedDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="p-6">
                        {!editing ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide" style={{ color: "#B4B2A9" }}>Full Name</p>
                                        <p className="font-medium" style={{ color: "#1A1A18" }}>{user?.name || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide" style={{ color: "#B4B2A9" }}>Phone</p>
                                        <p className="font-medium" style={{ color: "#1A1A18" }}>{user?.phone || 'Not set'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs uppercase tracking-wide" style={{ color: "#B4B2A9" }}>Location</p>
                                        <p className="font-medium" style={{ color: "#1A1A18" }}>{user?.location || 'Not set'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs uppercase tracking-wide" style={{ color: "#B4B2A9" }}>Bio</p>
                                        <p className="font-medium" style={{ color: "#1A1A18" }}>{user?.bio || 'No bio yet'}</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="px-6 py-2 rounded-lg font-medium transition-all"
                                        style={{ background: "#1A1A18", color: "#FAFAF8" }}
                                    >
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={() => setChangingPassword(true)}
                                        className="px-6 py-2 rounded-lg font-medium border transition-all"
                                        style={{ borderColor: "#1A1A18", color: "#1A1A18" }}
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                            style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                            style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            placeholder="City, Country"
                                            className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                            style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>Bio</label>
                                        <textarea
                                            name="bio"
                                            rows="3"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            placeholder="Tell us about yourself..."
                                            className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                            style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                        />
                                    </div>
                                    
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={updateLoading}
                                            className="px-6 py-2 rounded-lg font-medium transition-all"
                                            style={{
                                                background: updateLoading ? "#B4B2A9" : "#1A1A18",
                                                color: "#FAFAF8"
                                            }}
                                        >
                                            {updateLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditing(false)}
                                            className="px-6 py-2 rounded-lg font-medium border transition-all"
                                            style={{ borderColor: "#1A1A18", color: "#1A1A18" }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Change Password Modal */}
                {changingPassword && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold" style={{ color: "#1A1A18" }}>Change Password</h2>
                                <button onClick={() => setChangingPassword(false)} className="text-gray-400 hover:text-gray-600">
                                    ✕
                                </button>
                            </div>
                            
                            <form onSubmit={handleChangePassword}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>Current Password</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                            style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                            style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                            style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                        />
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={updateLoading}
                                        className="w-full py-3 rounded-lg font-bold transition-all mt-4"
                                        style={{
                                            background: updateLoading ? "#B4B2A9" : "#1A1A18",
                                            color: "#FAFAF8"
                                        }}
                                    >
                                        {updateLoading ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const AMENITIES = [
    'wifi', 'pool', 'ac', 'kitchen', 'parking', 'tv',
    'fireplace', 'bbq', 'breakfast', 'gym', 'washer', 'elevator',
    'balcony', 'hot-tub', 'pet-friendly', 'beach-access',
];
const PROPERTY_TYPES = ['villa', 'cabin', 'apartment', 'cottage', 'hotel', 'resort'];

const EMPTY_FORM = {
    title: '', description: '', type: 'villa', price: '',
    location: { city: '', country: '', address: '', state: '' },
    bedrooms: '', bathrooms: '', maxGuests: '',
    amenities: [], images: [{ url: '' }],
    isAvailable: true, minStayDays: 1, maxStayDays: 30,
    checkInTime: '14:00', checkOutTime: '11:00',
};

export default function EditProperty() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState(EMPTY_FORM);

    // Load existing property data
    useEffect(() => {
        api.get(`/properties/${id}`)
            .then(res => {
                const p = res.data.property;
                setFormData({
                    title: p.title || '',
                    description: p.description || '',
                    type: p.type || 'villa',
                    price: p.price || '',
                    location: {
                        city: p.location?.city || '',
                        country: p.location?.country || '',
                        address: p.location?.address || '',
                        state: p.location?.state || '',
                    },
                    bedrooms: p.bedrooms || '',
                    bathrooms: p.bathrooms || '',
                    maxGuests: p.maxGuests || '',
                    amenities: p.amenities || [],
                    images: p.images?.length ? p.images : [{ url: '' }],
                    isAvailable: p.isAvailable ?? true,
                    minStayDays: p.minStayDays || 1,
                    maxStayDays: p.maxStayDays || 30,
                    checkInTime: p.checkInTime || '14:00',
                    checkOutTime: p.checkOutTime || '11:00',
                });
            })
            .catch(() => setError('Failed to load property. It may not exist or you may not have access.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('location.')) {
            const field = name.split('.')[1];
            setFormData(f => ({ ...f, location: { ...f.location, [field]: value } }));
        } else if (type === 'checkbox' && name === 'isAvailable') {
            setFormData(f => ({ ...f, isAvailable: checked }));
        } else {
            setFormData(f => ({ ...f, [name]: value }));
        }
    };

    const toggleAmenity = (a) => {
        setFormData(f => ({
            ...f,
            amenities: f.amenities.includes(a)
                ? f.amenities.filter(x => x !== a)
                : [...f.amenities, a],
        }));
    };

    const handleImageChange = (index, value) => {
        const imgs = [...formData.images];
        imgs[index] = { ...imgs[index], url: value };
        setFormData(f => ({ ...f, images: imgs }));
    };

    const addImage = () => setFormData(f => ({ ...f, images: [...f.images, { url: '' }] }));
    const removeImage = (i) => {
        if (formData.images.length > 1)
            setFormData(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');

        if (!formData.title.trim() || !formData.price || !formData.location.city || !formData.bedrooms) {
            setError('Please fill in all required fields (title, price, city, bedrooms).');
            return;
        }

        const filteredImages = formData.images.filter(img => img.url.trim());
        if (!filteredImages.length) {
            setError('Add at least one valid image URL.');
            return;
        }

        setSaving(true);
        try {
            await api.put(`/properties/${id}`, {
                ...formData,
                price: Number(formData.price),
                bedrooms: Number(formData.bedrooms),
                bathrooms: Number(formData.bathrooms),
                maxGuests: Number(formData.maxGuests),
                minStayDays: Number(formData.minStayDays),
                maxStayDays: Number(formData.maxStayDays),
                images: filteredImages,
            });
            setSuccess('Property updated successfully!');
            setTimeout(() => navigate('/host-dashboard'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update property.');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = 'w-full p-3 border rounded-lg outline-none focus:border-black text-sm';
    const borderStyle = { borderColor: 'rgba(26,26,24,0.2)' };
    const labelCls = 'block text-sm font-medium mb-1';

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAF8' }}>
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
                <p style={{ color: '#5F5E5A' }}>Loading property...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen" style={{ background: '#FAFAF8', paddingTop: 80, paddingBottom: 40 }}>
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/host-dashboard')}
                        className="text-sm font-medium transition-colors"
                        style={{ color: '#5F5E5A' }}>← Back to Dashboard</button>
                    <div>
                        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Georgia, serif', color: '#1A1A18' }}>
                            Edit Property
                        </h1>
                        <p style={{ color: '#5F5E5A', fontSize: 14 }}>Update your listing details</p>
                    </div>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
                {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* ── Basic Info ── */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-bold mb-5" style={{ color: '#1A1A18' }}>Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className={labelCls}>Property Title *</label>
                                <input name="title" value={formData.title} onChange={handleChange}
                                    placeholder="Beautiful Beach Villa" required
                                    className={inputCls} style={borderStyle} />
                            </div>
                            <div>
                                <label className={labelCls}>Property Type *</label>
                                <select name="type" value={formData.type} onChange={handleChange}
                                    className={inputCls} style={borderStyle}>
                                    {PROPERTY_TYPES.map(t => (
                                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Price per Night (₹) *</label>
                                <input name="price" type="number" min="1" value={formData.price} onChange={handleChange}
                                    placeholder="5000" required className={inputCls} style={borderStyle} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelCls}>Description *</label>
                                <textarea name="description" rows={4} value={formData.description} onChange={handleChange}
                                    placeholder="Describe your property..." required
                                    className={inputCls} style={borderStyle} />
                            </div>
                            {/* Availability toggle */}
                            <div className="md:col-span-2 flex items-center gap-3 p-4 rounded-lg" style={{ background: '#F7F6F2' }}>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="isAvailable" checked={formData.isAvailable}
                                        onChange={handleChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                                </label>
                                <div>
                                    <p className="font-semibold text-sm" style={{ color: '#1A1A18' }}>
                                        {formData.isAvailable ? '✅ Listing is Active' : '🔴 Listing is Inactive'}
                                    </p>
                                    <p className="text-xs" style={{ color: '#5F5E5A' }}>
                                        Toggle to pause or resume accepting bookings
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Location ── */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-bold mb-5" style={{ color: '#1A1A18' }}>Location</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>City *</label>
                                <input name="location.city" value={formData.location.city} onChange={handleChange}
                                    placeholder="Mumbai" required className={inputCls} style={borderStyle} />
                            </div>
                            <div>
                                <label className={labelCls}>Country *</label>
                                <input name="location.country" value={formData.location.country} onChange={handleChange}
                                    placeholder="India" required className={inputCls} style={borderStyle} />
                            </div>
                            <div>
                                <label className={labelCls}>State</label>
                                <input name="location.state" value={formData.location.state} onChange={handleChange}
                                    placeholder="Maharashtra" className={inputCls} style={borderStyle} />
                            </div>
                            <div>
                                <label className={labelCls}>Full Address</label>
                                <input name="location.address" value={formData.location.address} onChange={handleChange}
                                    placeholder="123 Beach Road, Bandra West" className={inputCls} style={borderStyle} />
                            </div>
                        </div>
                    </div>

                    {/* ── Property Details ── */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-bold mb-5" style={{ color: '#1A1A18' }}>Property Details</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className={labelCls}>Bedrooms *</label>
                                <input name="bedrooms" type="number" min="0" value={formData.bedrooms} onChange={handleChange}
                                    placeholder="2" required className={inputCls} style={borderStyle} />
                            </div>
                            <div>
                                <label className={labelCls}>Bathrooms</label>
                                <input name="bathrooms" type="number" min="0" value={formData.bathrooms} onChange={handleChange}
                                    placeholder="2" className={inputCls} style={borderStyle} />
                            </div>
                            <div>
                                <label className={labelCls}>Max Guests</label>
                                <input name="maxGuests" type="number" min="1" value={formData.maxGuests} onChange={handleChange}
                                    placeholder="4" className={inputCls} style={borderStyle} />
                            </div>
                            <div>
                                <label className={labelCls}>Min Stay (nights)</label>
                                <input name="minStayDays" type="number" min="1" value={formData.minStayDays} onChange={handleChange}
                                    className={inputCls} style={borderStyle} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelCls}>Max Stay (nights)</label>
                                <input name="maxStayDays" type="number" min="1" value={formData.maxStayDays} onChange={handleChange}
                                    className={inputCls} style={borderStyle} />
                            </div>
                            <div>
                                <label className={labelCls}>Check-in Time</label>
                                <input name="checkInTime" type="time" value={formData.checkInTime} onChange={handleChange}
                                    className={inputCls} style={borderStyle} />
                            </div>
                            <div>
                                <label className={labelCls}>Check-out Time</label>
                                <input name="checkOutTime" type="time" value={formData.checkOutTime} onChange={handleChange}
                                    className={inputCls} style={borderStyle} />
                            </div>
                        </div>
                    </div>

                    {/* ── Amenities ── */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-bold mb-4" style={{ color: '#1A1A18' }}>Amenities</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {AMENITIES.map(a => (
                                <label key={a} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition">
                                    <input type="checkbox" checked={formData.amenities.includes(a)}
                                        onChange={() => toggleAmenity(a)} className="w-4 h-4 accent-black" />
                                    <span className="text-sm capitalize" style={{ color: '#5F5E5A' }}>{a.replace('-', ' ')}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* ── Images ── */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-bold mb-4" style={{ color: '#1A1A18' }}>Property Images</h2>
                        <div className="space-y-3">
                            {formData.images.map((img, i) => (
                                <div key={i} className="flex gap-2">
                                    <div className="flex-1">
                                        <input value={img.url} onChange={e => handleImageChange(i, e.target.value)}
                                            placeholder="https://images.unsplash.com/..."
                                            className={inputCls} style={borderStyle} />
                                        {img.url && (
                                            <img src={img.url} alt="preview"
                                                className="mt-2 w-full h-28 object-cover rounded-lg"
                                                onError={e => { e.target.style.display = 'none'; }} />
                                        )}
                                    </div>
                                    {formData.images.length > 1 && (
                                        <button type="button" onClick={() => removeImage(i)}
                                            className="self-start px-3 py-3 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 text-sm">
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addImage}
                            className="mt-3 text-sm px-4 py-2 rounded-lg border transition hover:bg-gray-50"
                            style={{ borderColor: '#1A1A18', color: '#1A1A18' }}>
                            + Add Image URL
                        </button>
                    </div>

                    {/* ── Submit ── */}
                    <div className="flex gap-3">
                        <button type="submit" disabled={saving}
                            className="flex-1 py-3 rounded-lg font-bold text-sm transition-all"
                            style={{ background: saving ? '#B4B2A9' : '#1A1A18', color: '#FAFAF8' }}>
                            {saving ? 'Saving...' : '💾 Save Changes'}
                        </button>
                        <button type="button" onClick={() => navigate('/host-dashboard')}
                            className="px-8 py-3 rounded-lg font-medium text-sm border transition hover:bg-gray-50"
                            style={{ borderColor: '#1A1A18', color: '#1A1A18' }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

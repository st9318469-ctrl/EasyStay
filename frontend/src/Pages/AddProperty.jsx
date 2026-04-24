import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const amenitiesList = [
    "wifi", "pool", "ac", "kitchen", "parking", "tv", 
    "fireplace", "bbq", "breakfast", "gym", "washer", "elevator"
];

const propertyTypes = ["villa", "cabin", "apartment", "cottage", "hotel", "resort"];

export default function AddProperty() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'villa',
        price: '',
        location: {
            city: '',
            country: '',
            address: '',
            state: ''
        },
        bedrooms: '',
        bathrooms: '',
        maxGuests: '',
        amenities: [],
        images: [{ url: '' }]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('location.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                location: { ...formData.location, [field]: value }
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleAmenityToggle = (amenity) => {
        if (formData.amenities.includes(amenity)) {
            setFormData({
                ...formData,
                amenities: formData.amenities.filter(a => a !== amenity)
            });
        } else {
            setFormData({
                ...formData,
                amenities: [...formData.amenities, amenity]
            });
        }
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index].url = value;
        setFormData({ ...formData, images: newImages });
    };

    const addImageField = () => {
        setFormData({
            ...formData,
            images: [...formData.images, { url: '' }]
        });
    };

    const removeImageField = (index) => {
        if (formData.images.length > 1) {
            const newImages = formData.images.filter((_, i) => i !== index);
            setFormData({ ...formData, images: newImages });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate required fields
        if (!formData.title || !formData.price || !formData.location.city || !formData.bedrooms) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        // Filter out empty image URLs
        const filteredImages = formData.images.filter(img => img.url.trim() !== '');
        if (filteredImages.length === 0) {
            filteredImages.push({ url: "https://via.placeholder.com/800x600" });
        }

        const propertyData = {
            ...formData,
            price: Number(formData.price),
            bedrooms: Number(formData.bedrooms),
            bathrooms: Number(formData.bathrooms),
            maxGuests: Number(formData.maxGuests),
            images: filteredImages
        };

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/api/properties`, propertyData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                navigate('/host-dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add property');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen" style={{ background: "#FAFAF8", padding: "80px 0" }}>
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Georgia, serif", color: "#1A1A18" }}>
                        List Your Property
                    </h1>
                    <p style={{ color: "#5F5E5A" }}>Start earning by hosting guests</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 text-red-500 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="mb-6">
                        <h2 className="text-lg font-bold mb-4" style={{ color: "#1A1A18" }}>Basic Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>
                                    Property Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Beautiful Beach Villa"
                                    className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                    style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>
                                    Property Type *
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                    style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                >
                                    {propertyTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Describe your property, amenities, nearby attractions..."
                                className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                required
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="mb-6">
                        <h2 className="text-lg font-bold mb-4" style={{ color: "#1A1A18" }}>Location</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>
                                    City *
                                </label>
                                <input
                                    type="text"
                                    name="location.city"
                                    value={formData.location.city}
                                    onChange={handleChange}
                                    placeholder="Mumbai"
                                    className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                    style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>
                                    Country *
                                </label>
                                <input
                                    type="text"
                                    name="location.country"
                                    value={formData.location.country}
                                    onChange={handleChange}
                                    placeholder="India"
                                    className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                    style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>
                                    Full Address
                                </label>
                                <input
                                    type="text"
                                    name="location.address"
                                    value={formData.location.address}
                                    onChange={handleChange}
                                    placeholder="123 Beach Road, Bandra West"
                                    className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                    style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="mb-6">
                        <h2 className="text-lg font-bold mb-4" style={{ color: "#1A1A18" }}>Property Details</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>
                                    Price/Night * (₹)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="5000"
                                    className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                    style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>
                                    Bedrooms *
                                </label>
                                <input
                                    type="number"
                                    name="bedrooms"
                                    value={formData.bedrooms}
                                    onChange={handleChange}
                                    placeholder="2"
                                    className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                    style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>
                                    Bathrooms *
                                </label>
                                <input
                                    type="number"
                                    name="bathrooms"
                                    value={formData.bathrooms}
                                    onChange={handleChange}
                                    placeholder="2"
                                    className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                    style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>
                                    Max Guests *
                                </label>
                                <input
                                    type="number"
                                    name="maxGuests"
                                    value={formData.maxGuests}
                                    onChange={handleChange}
                                    placeholder="4"
                                    className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                    style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="mb-6">
                        <h2 className="text-lg font-bold mb-4" style={{ color: "#1A1A18" }}>Amenities</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {amenitiesList.map(amenity => (
                                <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.amenities.includes(amenity)}
                                        onChange={() => handleAmenityToggle(amenity)}
                                        className="w-4 h-4"
                                    />
                                    <span style={{ color: "#5F5E5A" }} className="capitalize">
                                        {amenity}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Images */}
                    <div className="mb-6">
                        <h2 className="text-lg font-bold mb-4" style={{ color: "#1A1A18" }}>Property Images</h2>
                        {formData.images.map((img, index) => (
                            <div key={index} className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={img.url}
                                    onChange={(e) => handleImageChange(index, e.target.value)}
                                    placeholder="https://images.unsplash.com/..."
                                    className="flex-1 p-3 border rounded-lg outline-none focus:border-black"
                                    style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                />
                                {formData.images.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeImageField(index)}
                                        className="px-3 rounded-lg border border-red-300 text-red-500 hover:bg-red-50"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addImageField}
                            className="mt-2 text-sm px-4 py-2 rounded-lg border"
                            style={{ borderColor: "#1A1A18", color: "#1A1A18" }}
                        >
                            + Add another image
                        </button>
                        <p className="text-xs mt-2" style={{ color: "#B4B2A9" }}>
                            Add image URLs from Unsplash or other sources
                        </p>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 rounded-lg font-bold transition-all"
                            style={{
                                background: loading ? "#B4B2A9" : "#1A1A18",
                                color: "#FAFAF8"
                            }}
                        >
                            {loading ? 'Adding Property...' : 'List Property'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/host-dashboard')}
                            className="px-6 py-3 rounded-lg font-medium border transition-all"
                            style={{ borderColor: "#1A1A18", color: "#1A1A18" }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
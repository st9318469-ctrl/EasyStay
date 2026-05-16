import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import StarRating from "../components/StarRating";
import ReviewModal from "../components/ReviewModal";
import PaymentModal from "../components/PaymentModal";
import MessageHostModal from "../components/MessageHostModal";

const LOCAL_API_URL = "http://localhost:8000";
const isLocalFrontend =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const API_URL = isLocalFrontend ? LOCAL_API_URL : (import.meta.env.VITE_API_URL || LOCAL_API_URL);

export default function PropertyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [bookingError, setBookingError] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(1);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [availability, setAvailability] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [currentBookingId, setCurrentBookingId] = useState(null);
    const [totalAmount, setTotalAmount] = useState(0);

    const [reviews, setReviews] = useState([]);
    const [ratingStats, setRatingStats] = useState(null);
    const [canReview, setCanReview] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);

    useEffect(() => {
        fetchProperty();
    }, [id]);

    useEffect(() => {
        fetchReviews();
        checkCanReview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/properties/${id}`);
            setProperty(response.data.property);
            setPageError("");
        } catch (err) {
            console.error("Failed to fetch property:", {
                apiUrl: API_URL,
                propertyId: id,
                status: err?.response?.status,
                message: err?.response?.data?.message || err.message
            });
            setPageError("Failed to load property details");
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/reviews/property/${id}`);
            setReviews(response.data.reviews || []);
            setRatingStats(response.data.stats || null);
        } catch (err) {
            console.error("Error fetching reviews:", {
                apiUrl: API_URL,
                propertyId: id,
                status: err?.response?.status,
                message: err?.response?.data?.message || err.message
            });
        }
    };

    const checkCanReview = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setCanReview(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/api/reviews/can-review/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCanReview(Boolean(response.data.canReview));
        } catch (err) {
            console.error("Error checking review eligibility:", err);
            setCanReview(false);
        }
    };

    const checkAvailability = async () => {
        if (!checkIn || !checkOut) return;
        
        try {
            const response = await axios.get(`${API_URL}/api/properties/${id}/check-availability`, {
                params: { checkIn, checkOut }
            });
            setAvailability(response.data);
        } catch (err) {
            console.error("Failed to check availability:", err);
        }
    };

    useEffect(() => {
        if (checkIn && checkOut) {
            checkAvailability();
        }
    }, [checkIn, checkOut]);

    const calculateNights = () => {
        if (!checkIn || !checkOut) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const calculateTotal = () => {
        const nights = calculateNights();
        return property?.price * nights;
    };

    const handleBooking = async () => {
        // Validate inputs
        if (!checkIn || !checkOut) {
            setBookingError("Please select check-in and check-out dates");
            return;
        }

        // Check if user is logged in
        const token = localStorage.getItem("token");
        if (!token) {
            setBookingError("Please login to book this property");
            setTimeout(() => navigate("/login"), 2000);
            return;
        }

        // Check availability again
        if (availability && !availability.isAvailable) {
            setBookingError("Property is not available for selected dates");
            return;
        }

        setBookingLoading(true);
        setBookingError("");
        
        try {
            console.log("Creating booking with:", {
                propertyId: id,
                checkIn,
                checkOut,
                guests
            });

            const response = await axios.post(
                `${API_URL}/api/bookings`,
                {
                    propertyId: id,
                    checkIn,
                    checkOut,
                    guests
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            
            console.log("Booking response:", response.data);
            
            if (response.data.success) {
                setCurrentBookingId(response.data.bookingId);
                setTotalAmount(response.data.totalPrice);
                setShowPayment(true);
            } else {
                setBookingError(response.data.message || "Booking failed");
            }
        } catch (err) {
            console.error("Booking error details:", err);
            
            // Handle different error scenarios
            if (err.response) {
                // Server responded with error
                console.log("Error response:", err.response.data);
                setBookingError(err.response.data.message || "Booking failed. Please try again.");
            } else if (err.request) {
                // Request was made but no response
                console.log("No response from server");
                setBookingError("Cannot connect to server. Please check if backend is running.");
            } else {
                // Something else happened
                console.log("Error:", err.message);
                setBookingError("An error occurred. Please try again.");
            }
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p style={{ color: "#1A1A18" }}>Loading amazing stays...</p>
                </div>
            </div>
        );
    }

    if (pageError || !property) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
                <div className="text-center">
                    <p className="text-red-500 mb-4">{pageError || "Property not found"}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-2 rounded-lg transition-all duration-200"
                        style={{ background: "#1A1A18", color: "#FAFAF8" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#2A2A28"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#1A1A18"; }}
                    >
                        Go Back Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 transition-colors duration-200"
                    style={{ color: "#1A1A18" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#5F5E5A"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#1A1A18"; }}
                >
                    {"\u2190"} Back to listings
                </button>

                {/* Image Gallery */}
                <div className="mb-8">
                    <div className="rounded-xl overflow-hidden h-96 mb-4">
                        <img
                            src={property.images?.[activeImage]?.url || "https://via.placeholder.com/800x600"}
                            alt={property.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {property.images?.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {property.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`rounded-lg overflow-hidden h-20 cursor-pointer transition-all duration-200 ${
                                        activeImage === idx ? "ring-2 ring-black" : "opacity-70 hover:opacity-100"
                                    }`}
                                >
                                    <img
                                        src={img.url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Property Details */}
                    <div className="lg:col-span-2">
                        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Georgia, serif", color: "#1A1A18" }}>
                            {property.title}
                        </h1>
                        <p className="mb-4" style={{ color: "#5F5E5A" }}>
                            {"\u{1F4CD}"} {property.location?.city}, {property.location?.country}
                        </p>
                        
                        <div className="flex gap-4 mb-6">
                            <span className="flex items-center gap-1" style={{ color: "#1A1A18" }}>
                                {"\u2B50"} {property.rating || "4.8"}
                            </span>
                            <span style={{ color: "#B4B2A9" }}>{"\u00B7"}</span>
                            <span style={{ color: "#5F5E5A" }}>{property.totalReviews || 0} reviews</span>
                        </div>

                        {/* Host Info */}
                        <div className="flex items-center gap-4 p-4 rounded-xl mb-6" style={{ background: "#F1EFE8" }}>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#1A1A18" }}>
                                {property.host?.name?.charAt(0) || "H"}
                            </div>
                            <div>
                                <p className="font-semibold" style={{ color: "#1A1A18" }}>Hosted by {property.host?.name || "EasyStay"}</p>
                                <p className="text-sm" style={{ color: "#5F5E5A" }}>Superhost {"\u00B7"} 3 years hosting</p>
                            </div>
                        </div>

                        {property.host && (
                            <button
                                onClick={() => setShowMessageModal(true)}
                                className="mb-6 w-full py-2 rounded-lg border transition-all hover:bg-gray-50"
                                style={{ borderColor: "#1A1A18", color: "#1A1A18" }}
                            >
                                💬 Message Host
                            </button>
                        )}

                        {property.host && (
                            <button
                                onClick={() => setShowMessageModal(true)}
                                className="mb-6 w-full py-2 rounded-lg border transition-all hover:bg-gray-50"
                                style={{ borderColor: "#1A1A18", color: "#1A1A18" }}
                            >
                                💬 Message Host
                            </button>
                        )}

                        {/* Description */}
                        <div className="border-t border-b py-6 mb-6" style={{ borderColor: "rgba(26,26,24,0.12)" }}>
                            <h3 className="font-semibold mb-3" style={{ color: "#1A1A18" }}>Description</h3>
                            <p className="leading-relaxed" style={{ color: "#5F5E5A" }}>{property.description}</p>
                        </div>

                        {/* Amenities */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3" style={{ color: "#1A1A18" }}>Amenities</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {property.amenities?.map(amenity => (
                                    <div key={amenity} className="flex items-center gap-2">
                                        <span style={{ color: "#1A1A18" }}>{"\u2713"}</span>
                                        <span className="capitalize" style={{ color: "#5F5E5A" }}>{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-3 gap-4 p-4 rounded-xl" style={{ background: "#F1EFE8" }}>
                            <div className="text-center">
                                <p className="text-2xl font-bold" style={{ color: "#1A1A18" }}>{property.bedrooms}</p>
                                <p className="text-sm" style={{ color: "#5F5E5A" }}>Bedrooms</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold" style={{ color: "#1A1A18" }}>{property.bathrooms}</p>
                                <p className="text-sm" style={{ color: "#5F5E5A" }}>Bathrooms</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold" style={{ color: "#1A1A18" }}>{property.maxGuests}</p>
                                <p className="text-sm" style={{ color: "#5F5E5A" }}>Max Guests</p>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg" style={{ color: "#1A1A18" }}>
                                    {ratingStats?.totalReviews || 0} Reviews
                                </h3>
                                {canReview && (
                                    <button
                                        onClick={() => setShowReviewModal(true)}
                                        className="px-4 py-2 rounded-lg text-sm font-medium"
                                        style={{ background: "#1A1A18", color: "#FAFAF8" }}
                                    >
                                        Write a Review
                                    </button>
                                )}
                            </div>

                            {/* Rating Summary */}
                            {ratingStats && (ratingStats.totalReviews || 0) > 0 && (
                                <div className="flex items-center gap-4 mb-6 p-4 rounded-xl" style={{ background: "#F1EFE8" }}>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold" style={{ color: "#1A1A18" }}>
                                            {Number(ratingStats.averageRating || 0).toFixed(1)}
                                        </div>
                                        <StarRating rating={ratingStats.averageRating || 0} readonly={true} size={16} />
                                        <div className="text-sm" style={{ color: "#5F5E5A" }}>{ratingStats.totalReviews} reviews</div>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        {[5, 4, 3, 2, 1].map(star => (
                                            <div key={star} className="flex items-center gap-2">
                                                <span className="text-sm w-12" style={{ color: "#5F5E5A" }}>{star} {"\u2605"}</span>
                                                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(26,26,24,0.12)" }}>
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            background: "#1A1A18",
                                                            width: `${((ratingStats[`${star}Star`] || 0) / (ratingStats.totalReviews || 1)) * 100}%`
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm" style={{ color: "#5F5E5A" }}>{ratingStats[`${star}Star`] || 0}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reviews List */}
                            <div className="space-y-4">
                                {reviews.map(review => (
                                    <div key={review._id} className="border-b pb-4" style={{ borderColor: "rgba(26,26,24,0.12)" }}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ background: "#1A1A18" }}>
                                                {review.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-medium" style={{ color: "#1A1A18" }}>{review.user?.name || "User"}</p>
                                                <p className="text-xs" style={{ color: "#B4B2A9" }}>
                                                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <StarRating rating={review.rating} readonly={true} size={14} />
                                        <p className="mt-2" style={{ color: "#5F5E5A" }}>{review.comment}</p>
                                    </div>
                                ))}
                                {reviews.length === 0 && (
                                    <p style={{ color: "#5F5E5A" }}>No reviews yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="lg:col-span-1">
                        <div
                            className="sticky top-24 p-6 rounded-xl"
                            style={{
                                border: "1px solid rgba(26,26,24,0.12)",
                                background: "#FFFFFF",
                                boxShadow: "0 8px 28px rgba(0,0,0,0.08)"
                            }}
                        >
                            <div className="mb-4">
                                <span className="text-3xl font-bold" style={{ color: "#1A1A18" }}>{"\u20B9"}{property.price.toLocaleString()}</span>
                                <span style={{ color: "#B4B2A9" }}> / night</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>Check-in</label>
                                    <input
                                        type="date"
                                        value={checkIn}
                                        onChange={(e) => setCheckIn(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full p-3 rounded-lg outline-none transition-all duration-200"
                                        style={{
                                            border: "1.5px solid rgba(26,26,24,0.2)",
                                            background: "#FAFAF8",
                                            color: "#1A1A18"
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = "#1A1A18"}
                                        onBlur={(e) => e.target.style.borderColor = "rgba(26,26,24,0.2)"}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>Check-out</label>
                                    <input
                                        type="date"
                                        value={checkOut}
                                        onChange={(e) => setCheckOut(e.target.value)}
                                        min={checkIn || new Date().toISOString().split('T')[0]}
                                        className="w-full p-3 rounded-lg outline-none transition-all duration-200"
                                        style={{
                                            border: "1.5px solid rgba(26,26,24,0.2)",
                                            background: "#FAFAF8",
                                            color: "#1A1A18"
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = "#1A1A18"}
                                        onBlur={(e) => e.target.style.borderColor = "rgba(26,26,24,0.2)"}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>Guests (max {property.maxGuests})</label>
                                    <select
                                        value={guests}
                                        onChange={(e) => setGuests(Number(e.target.value))}
                                        className="w-full p-3 rounded-lg outline-none transition-all duration-200"
                                        style={{
                                            border: "1.5px solid rgba(26,26,24,0.2)",
                                            background: "#FAFAF8",
                                            color: "#1A1A18"
                                        }}
                                    >
                                        {[...Array(Math.min(property.maxGuests || 10, 20))].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {i + 1} guest{i === 0 ? "" : "s"}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {checkIn && checkOut && (
                                    <div className="border-t pt-4 mt-4" style={{ borderColor: "rgba(26,26,24,0.12)" }}>
                                        <div className="flex justify-between mb-2">
                                            <span style={{ color: "#5F5E5A" }}>
                                                {"\u20B9"}{property.price} x {calculateNights()} nights
                                            </span>
                                            <span style={{ color: "#1A1A18" }}>{"\u20B9"}{calculateTotal()}</span>
                                        </div>
                                        {availability && availability.priceBreakdown && (
                                            <>
                                                <div className="flex justify-between mb-2">
                                                    <span style={{ color: "#5F5E5A" }}>Service Fee (10%)</span>
                                                    <span style={{ color: "#1A1A18" }}>{"\u20B9"}{availability.priceBreakdown.serviceFee}</span>
                                                </div>
                                                <div className="flex justify-between mb-2">
                                                    <span style={{ color: "#5F5E5A" }}>Cleaning Fee</span>
                                                    <span style={{ color: "#1A1A18" }}>{"\u20B9"}{availability.priceBreakdown.cleaningFee}</span>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex justify-between pt-2 border-t font-bold" style={{ borderColor: "rgba(26,26,24,0.12)" }}>
                                            <span style={{ color: "#1A1A18" }}>Total</span>
                                            <span className="text-xl" style={{ color: "#1A1A18" }}>
                                                {"\u20B9"}{availability?.priceBreakdown?.total || calculateTotal()}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {bookingError && (
                                    <p className="text-sm text-center p-2 rounded-lg" style={{ color: "#E24B4A", background: "#FEE2E2" }}>
                                        {bookingError}
                                    </p>
                                )}

                                <button
                                    onClick={handleBooking}
                                    disabled={bookingLoading}
                                    className="w-full py-3 rounded-lg font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95"
                                    style={{
                                        background: bookingLoading ? "#B4B2A9" : "#1A1A18",
                                        color: "#FAFAF8",
                                        cursor: bookingLoading ? "not-allowed" : "pointer"
                                    }}
                                >
                                    {bookingLoading ? "Processing..." : "Reserve Now"}
                                </button>

                                <p className="text-xs text-center" style={{ color: "#B4B2A9" }}>
                                    You won't be charged yet
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {showReviewModal && (
            <ReviewModal
                propertyId={id}
                propertyTitle={property?.title}
                onClose={() => setShowReviewModal(false)}
                onSuccess={() => {
                    fetchReviews();
                    checkCanReview();
                }}
            />
        )}

        {showMessageModal && (
            <MessageHostModal
                host={property?.host}
                propertyId={id}
                onClose={() => setShowMessageModal(false)}
            />
        )}

        {showPayment && (
            <PaymentModal
                bookingId={currentBookingId}
                amount={totalAmount}
                bookingDetails={{
                    propertyTitle: property?.title,
                    propertyImage: property?.images?.[0]?.url,
                    location: `${property?.location?.city || ""}${property?.location?.country ? `, ${property.location.country}` : ""}`,
                    bedrooms: property?.bedrooms,
                    guests,
                    checkIn,
                    checkOut,
                    nights: calculateNights(),
                    totalPrice: totalAmount
                }}
                onClose={() => setShowPayment(false)}
                onSuccess={() => {
                    setShowPayment(false);
                    alert("Booking confirmed! Check your trips.");
                    navigate("/my-trips");
                }}
            />
        )}
        </>
    );
}

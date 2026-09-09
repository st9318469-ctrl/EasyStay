import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import StarRating from "../components/StarRating";
import ReviewModal from "../components/ReviewModal";
import PaymentModal from "../components/PaymentModal";
import MessageHostModal from "../components/MessageHostModal";
import { API_BASE_URL } from "../api/config";

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
  const [reviewEligibility, setReviewEligibility] = useState({
    loggedIn: false,
    hasCompletedBooking: false,
    alreadyReviewed: false,
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Safe date difference calculation avoiding local timezone quirks
  const calculateNights = useCallback(() => {
    if (!checkIn || !checkOut) return 0;
    const [startYear, startMonth, startDay] = checkIn.split("-").map(Number);
    const [endYear, endMonth, endDay] = checkOut.split("-").map(Number);

    const start = Date.UTC(startYear, startMonth - 1, startDay);
    const end = Date.UTC(endYear, endMonth - 1, endDay);
    const diffTime = end - start;
    const nights = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  }, [checkIn, checkOut]);

  const calculateTotal = useCallback(() => {
    const nights = calculateNights();
    return (property?.price || 0) * nights;
  }, [calculateNights, property?.price]);

  const fetchProperty = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/properties/${id}`);
      setProperty(response.data.property);
      setPageError("");
    } catch (err) {
      console.error("Failed to fetch property:", err);
      setPageError("Failed to load property details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reviews/property/${id}`);
      setReviews(response.data.reviews || []);
      setRatingStats(response.data.stats || null);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  }, [id]);

  const checkCanReview = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCanReview(false);
      setReviewEligibility({ loggedIn: false, hasCompletedBooking: false, alreadyReviewed: false });
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/reviews/can-review/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCanReview(Boolean(response.data.canReview));
      setReviewEligibility({
        loggedIn: true,
        hasCompletedBooking: Boolean(response.data.hasCompletedBooking),
        alreadyReviewed: Boolean(response.data.alreadyReviewed),
      });
    } catch (err) {
      console.error("Error checking review eligibility:", err);
      setCanReview(false);
      setReviewEligibility({ loggedIn: true, hasCompletedBooking: false, alreadyReviewed: false });
    }
  }, [id]);

  const checkAvailability = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/properties/${id}/check-availability`, {
        params: { checkIn, checkOut },
      });
      setAvailability(response.data);
    } catch (err) {
      console.error("Failed to check availability:", err);
    }
  }, [id, checkIn, checkOut]);

  useEffect(() => {
    if (id) {
      fetchProperty();
      fetchReviews();
      checkCanReview();
    }
  }, [id, fetchProperty, fetchReviews, checkCanReview]);

  useEffect(() => {
    const nights = calculateNights();
    if (checkIn && checkOut && nights > 0) {
      checkAvailability();
    } else {
      setAvailability(null);
    }
  }, [checkIn, checkOut, calculateNights, checkAvailability]);

  const getReviewHint = () => {
    if (!reviewEligibility.loggedIn) return "Login to write a review.";
    if (reviewEligibility.alreadyReviewed) return "You have already reviewed this property.";
    if (!reviewEligibility.hasCompletedBooking) return "You can review after completing your stay.";
    return "";
  };

  const handleBooking = async () => {
    if (!checkIn || !checkOut || calculateNights() <= 0) {
      setBookingError("Please select valid check-in and check-out dates");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: `/properties/${id}` } });
      return;
    }

    if (availability && !availability.isAvailable) {
      setBookingError("Property is not available for selected dates");
      return;
    }

    setBookingLoading(true);
    setBookingError("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/bookings`,
        { propertyId: id, checkIn, checkOut, guests },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setCurrentBookingId(response.data.bookingId);
        setTotalAmount(response.data.totalPrice || calculateTotal());
        setShowPayment(true);
      } else {
        setBookingError(response.data.message || "Booking failed");
      }
    } catch (err) {
      console.error("Booking error details:", err);
      setBookingError(err.response?.data?.message || "Booking failed. Please try again.");
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
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <>
      <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 transition-colors duration-200 cursor-pointer"
            style={{ color: "#1A1A18" }}
          >
            {"\u2190"} Back to listings
          </button>

          {/* Gallery */}
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
                    key={img._id || idx}
                    onClick={() => setActiveImage(idx)}
                    className={`rounded-lg overflow-hidden h-20 cursor-pointer transition-all duration-200 ${
                      activeImage === idx ? "ring-2 ring-black" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info Column */}
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

              {/* Host Section */}
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
                  className="mb-6 w-full py-2 rounded-lg border transition-all hover:bg-gray-50 cursor-pointer"
                  style={{ borderColor: "#1A1A18", color: "#1A1A18" }}
                >
                  💬 Message Host
                </button>
              )}

              {/* Property Meta */}
              <div className="border-t border-b py-6 mb-6" style={{ borderColor: "rgba(26,26,24,0.12)" }}>
                <h3 className="font-semibold mb-3" style={{ color: "#1A1A18" }}>Description</h3>
                <p className="leading-relaxed" style={{ color: "#5F5E5A" }}>{property.description}</p>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3" style={{ color: "#1A1A18" }}>Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {property.amenities?.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <span style={{ color: "#1A1A18" }}>{"\u2713"}</span>
                      <span className="capitalize" style={{ color: "#5F5E5A" }}>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Details */}
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

              {/* Reviews */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg" style={{ color: "#1A1A18" }}>
                    {ratingStats?.totalReviews || reviews.length} Reviews
                  </h3>
                  <div className="text-right">
                    <button
                      onClick={() => {
                        if (!reviewEligibility.loggedIn) {
                          navigate("/login");
                          return;
                        }
                        if (canReview) setShowReviewModal(true);
                      }}
                      disabled={reviewEligibility.loggedIn && !canReview}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: canReview ? "#1A1A18" : "#B4B2A9",
                        color: "#FAFAF8",
                        cursor: !reviewEligibility.loggedIn || canReview ? "pointer" : "not-allowed",
                      }}
                    >
                      Write a Review
                    </button>
                    {getReviewHint() && (
                      <p className="text-xs mt-1" style={{ color: "#5F5E5A" }}>{getReviewHint()}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b pb-4" style={{ borderColor: "rgba(26,26,24,0.12)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ background: "#1A1A18" }}>
                          {review.user?.name?.charAt(0) || "U"}
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
                  {reviews.length === 0 && <p style={{ color: "#5F5E5A" }}>No reviews yet.</p>}
                </div>
              </div>
            </div>

            {/* Sticky Booking Widget */}
            <div className="lg:col-span-1">
              <div
                className="sticky top-24 p-6 rounded-xl"
                style={{
                  border: "1px solid rgba(26,26,24,0.12)",
                  background: "#FFFFFF",
                  boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
                }}
              >
                <div className="mb-4">
                  <span className="text-3xl font-bold" style={{ color: "#1A1A18" }}>{"\u20B9"}{property.price?.toLocaleString()}</span>
                  <span style={{ color: "#B4B2A9" }}> / night</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>Check-in</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => {
                        const newCheckIn = e.target.value;
                        setCheckIn(newCheckIn);
                        if (checkOut && newCheckIn >= checkOut) {
                          setCheckOut("");
                        }
                      }}
                      min={todayStr}
                      className="w-full p-3 rounded-lg outline-none transition-all duration-200"
                      style={{ border: "1.5px solid rgba(26,26,24,0.2)", background: "#FAFAF8", color: "#1A1A18" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || todayStr}
                      className="w-full p-3 rounded-lg outline-none transition-all duration-200"
                      style={{ border: "1.5px solid rgba(26,26,24,0.2)", background: "#FAFAF8", color: "#1A1A18" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>Guests (max {property.maxGuests})</label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full p-3 rounded-lg outline-none transition-all duration-200"
                      style={{ border: "1.5px solid rgba(26,26,24,0.2)", background: "#FAFAF8", color: "#1A1A18" }}
                    >
                      {Array.from({ length: property.maxGuests || 1 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "guest" : "guests"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {calculateNights() > 0 && (
                    <div className="pt-4 border-t space-y-2" style={{ borderColor: "rgba(26,26,24,0.12)" }}>
                      <div className="flex justify-between text-sm" style={{ color: "#5F5E5A" }}>
                        <span>{"\u20B9"}{property.price} x {calculateNights()} nights</span>
                        <span>{"\u20B9"}{calculateTotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t" style={{ color: "#1A1A18" }}>
                        <span>Total</span>
                        <span>{"\u20B9"}{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {bookingError && <p className="text-red-500 text-sm mt-2">{bookingError}</p>}

                  <button
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    className="w-full py-3 rounded-lg text-white font-medium transition-all duration-200 cursor-pointer"
                    style={{ background: "#1A1A18" }}
                  >
                    {bookingLoading ? "Processing..." : "Reserve Stay"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showReviewModal && (
        <ReviewModal
          propertyId={id}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            fetchReviews();
            checkCanReview();
          }}
        />
      )}

      {showPayment && (
        <PaymentModal
          bookingId={currentBookingId}
          amount={totalAmount}
          onClose={() => setShowPayment(false)}
          onSuccess={() => navigate("/my-trips")}
        />
      )}

      {showMessageModal && (
        <MessageHostModal
          host={property.host}
          propertyId={id}
          onClose={() => setShowMessageModal(false)}
        />
      )}
    </>
  );
}
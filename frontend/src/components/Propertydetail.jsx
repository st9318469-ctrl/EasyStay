import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios"; // Utilizing central Axios instance

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const fetchProperty = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/properties/${id}`);
      setProperty(response.data?.property || response.data);
    } catch (err) {
      console.error("Failed to fetch property:", err);
      setError("Failed to load property details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  // Safely calculate nights without timezone issues
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn + "T00:00:00");
    const end = new Date(checkOut + "T00:00:00");
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [checkIn, checkOut]);

  const totalCost = useMemo(() => {
    return (property?.price || 0) * nights;
  }, [property?.price, nights]);

  // Adjust checkOut if checkIn changes to a date after current checkOut
  const handleCheckInChange = (e) => {
    const val = e.target.value;
    setCheckIn(val);
    if (checkOut && val >= checkOut) {
      setCheckOut("");
    }
  };

  const handleBooking = async () => {
    if (!checkIn || !checkOut) {
      setError("Please select both check-in and check-out dates.");
      return;
    }

    if (nights <= 0) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to reserve this property.");
      navigate("/login");
      return;
    }

    try {
      setBookingLoading(true);
      setError("");

      await api.post("/bookings", {
        propertyId: id,
        checkIn,
        checkOut,
        guests,
      });

      alert("✅ Booking successful! Redirecting to your dashboard...");
      navigate("/my-trips");
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: "#1A1A18" }}>Loading stay details...</p>
        </div>
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#FAFAF8" }}>
        <div className="text-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm max-w-md w-full">
          <p className="text-red-500 mb-4">{error || "Property not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 rounded-lg transition-all font-medium text-sm"
            style={{ background: "#1A1A18", color: "#FAFAF8" }}
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8", padding: "40px 0" }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 font-medium text-sm transition-colors"
          style={{ color: "#1A1A18" }}
        >
          ← Back to listings
        </button>

        {/* Gallery Section */}
        <div className="mb-8">
          <div className="rounded-xl overflow-hidden h-96 mb-4 bg-gray-200">
            <img
              src={property.images?.[activeImage]?.url || "https://via.placeholder.com/800x600?text=No+Image"}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          {property.images?.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`rounded-lg overflow-hidden h-20 border-2 transition-all ${
                    activeImage === idx ? "border-black scale-95" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Property Info */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Georgia, serif", color: "#1A1A18" }}>
              {property.title}
            </h1>
            <p className="mb-4 text-sm" style={{ color: "#5F5E5A" }}>
              📍 {property.location?.city}, {property.location?.country}
            </p>

            <div className="flex items-center gap-3 mb-6 text-sm">
              <span className="flex items-center gap-1 font-semibold" style={{ color: "#1A1A18" }}>
                ★ {property.rating || "4.8"}
              </span>
              <span style={{ color: "#B4B2A9" }}>•</span>
              <span style={{ color: "#5F5E5A" }}>{property.totalReviews || 0} reviews</span>
            </div>

            {/* Host Section */}
            <div className="flex items-center gap-4 p-4 rounded-xl mb-6" style={{ background: "#F1EFE8" }}>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ background: "#1A1A18" }}
              >
                {property.host?.name?.charAt(0).toUpperCase() || "H"}
              </div>
              <div>
                <p className="font-semibold" style={{ color: "#1A1A18" }}>
                  Hosted by {property.host?.name || "EasyStay Host"}
                </p>
                <p className="text-sm" style={{ color: "#5F5E5A" }}>Verified Host</p>
              </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl mb-6" style={{ background: "#F1EFE8" }}>
              <div className="text-center">
                <p className="text-xl font-bold" style={{ color: "#1A1A18" }}>{property.bedrooms || 1}</p>
                <p className="text-xs" style={{ color: "#5F5E5A" }}>Bedrooms</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold" style={{ color: "#1A1A18" }}>{property.bathrooms || 1}</p>
                <p className="text-xs" style={{ color: "#5F5E5A" }}>Bathrooms</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold" style={{ color: "#1A1A18" }}>{property.maxGuests || 2}</p>
                <p className="text-xs" style={{ color: "#5F5E5A" }}>Max Guests</p>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-b py-6 mb-6" style={{ borderColor: "rgba(26,26,24,0.12)" }}>
              <h2 className="font-bold text-lg mb-3" style={{ color: "#1A1A18" }}>Description</h2>
              <p className="leading-relaxed text-sm whitespace-pre-line" style={{ color: "#5F5E5A" }}>
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="mb-6">
                <h2 className="font-bold text-lg mb-3" style={{ color: "#1A1A18" }}>Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-sm">
                      <span style={{ color: "#1A1A18" }}>✓</span>
                      <span className="capitalize" style={{ color: "#5F5E5A" }}>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Reservation Widget */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-24 p-6 rounded-xl bg-white border border-gray-200 shadow-lg"
            >
              <div className="mb-4">
                <span className="text-3xl font-bold" style={{ color: "#1A1A18" }}>
                  ₹{property.price?.toLocaleString()}
                </span>
                <span className="text-sm" style={{ color: "#5F5E5A" }}> / night</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "#1A1A18" }}>
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={handleCheckInChange}
                    min={todayStr}
                    className="w-full p-3 rounded-lg text-sm border outline-none transition-all"
                    style={{ borderColor: "rgba(26,26,24,0.2)", background: "#FAFAF8", color: "#1A1A18" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "#1A1A18" }}>
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || todayStr}
                    disabled={!checkIn}
                    className="w-full p-3 rounded-lg text-sm border outline-none transition-all disabled:opacity-50"
                    style={{ borderColor: "rgba(26,26,24,0.2)", background: "#FAFAF8", color: "#1A1A18" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "#1A1A18" }}>
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full p-3 rounded-lg text-sm border outline-none transition-all"
                    style={{ borderColor: "rgba(26,26,24,0.2)", background: "#FAFAF8", color: "#1A1A18" }}
                  >
                    {[...Array(property.maxGuests || 10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} guest{i === 0 ? "" : "s"}
                      </option>
                    ))}
                  </select>
                </div>

                {nights > 0 && (
                  <div className="border-t pt-4 mt-4 space-y-2" style={{ borderColor: "rgba(26,26,24,0.12)" }}>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "#5F5E5A" }}>
                        ₹{property.price?.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}
                      </span>
                      <span style={{ color: "#1A1A18" }}>₹{totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold" style={{ borderColor: "rgba(26,26,24,0.12)" }}>
                      <span style={{ color: "#1A1A18" }}>Total</span>
                      <span className="text-xl" style={{ color: "#1A1A18" }}>
                        ₹{totalCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-xs text-center p-2 rounded-lg text-red-600 bg-red-50">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className="w-full py-3.5 rounded-lg font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "#1A1A18", color: "#FAFAF8" }}
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
  );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import { addToWishlist, getProperties, getWishlist, removeFromWishlist } from "../api/propertyService";

function StarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="#1A1A18">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24"
      fill={filled ? "#1A1A18" : "none"} stroke="#1A1A18" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function PropertyCard({ property, onWishlist, wishlisted, onBook }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl overflow-hidden flex flex-col cursor-pointer"
      style={{
        background: "#FAFAF8",
        border: "1px solid rgba(26,26,24,0.12)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 12px 32px rgba(26,26,24,0.12)" : "none",
      }}
    >
      {/* Image */}
      <div className="relative" style={{ height: "200px" }}>
        <img
          src={property.images?.[0]?.url || property.img || "/placeholder.jpg"}
          alt={property.title || property.name}
          className="w-full h-full object-cover"
          style={{
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.04)" : "scale(1)",
          }}
        />

        {/* Type badge */}
        <div className="absolute top-3 left-3" style={{
          background: "#FAFAF8", color: "#1A1A18",
          borderRadius: "50px", padding: "3px 10px",
          fontSize: "10px", fontWeight: "700",
          letterSpacing: "0.04em",
        }}>
          {property.type || property.propertyType}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlist(property._id || property.id, wishlisted);
          }}
          className="absolute top-3 right-3 flex items-center justify-center"
          style={{
            width: "30px", height: "30px", borderRadius: "50%",
            background: "rgba(250,250,248,0.92)",
            border: "none", cursor: "pointer",
            transition: "transform 0.2s ease",
            transform: wishlisted ? "scale(1.15)" : "scale(1)",
          }}
        >
          <HeartIcon filled={wishlisted} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1" style={{ padding: "16px 18px" }}>

        {/* Name + Rating */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 style={{
            fontSize: "15px", fontWeight: "700",
            color: "#1A1A18", lineHeight: "1.3",
            fontFamily: "Georgia, serif",
          }}>
            {property.title || property.name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
            <StarIcon />
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#1A1A18" }}>
              {property.rating || 4.5}
            </span>
          </div>
        </div>

        {/* Location */}
        <p style={{ fontSize: "12px", color: "#5F5E5A", marginBottom: "10px" }}>
          {property.location?.city || property.location}, {property.location?.country || ""}
        </p>

        {/* Info row */}
        <div className="flex gap-2 flex-wrap mb-3">
          {[
            `${property.maxGuests || property.guests} guests`,
            `${property.bedrooms || property.beds} beds`,
            `${property.bathrooms || property.baths} baths`,
          ].map(info => (
            <span key={info} style={{
              fontSize: "11px", color: "#5F5E5A",
              background: "rgba(26,26,24,0.05)",
              borderRadius: "6px", padding: "2px 8px",
            }}>
              {info}
            </span>
          ))}
        </div>

        {/* Amenities */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {(property.amenities || []).slice(0, 3).map(a => (
            <span key={a} style={{
              fontSize: "10px", color: "#1A1A18",
              border: "1px solid rgba(26,26,24,0.18)",
              borderRadius: "50px", padding: "2px 8px",
            }}>
              {a}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div style={{
          borderTop: "1px solid rgba(26,26,24,0.08)",
          marginBottom: "14px",
        }} />

        {/* Price + Book */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p style={{
              fontSize: "18px", fontWeight: "800",
              color: "#1A1A18", fontFamily: "Georgia, serif",
            }}>
              ₹{property.price.toLocaleString()}
            </p>
            <p style={{ fontSize: "10px", color: "#B4B2A9" }}>per night</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onBook(property._id || property.id);
            }}
            style={{
              background: "#1A1A18", color: "#FAFAF8",
              borderRadius: "10px", padding: "9px 18px",
              fontSize: "12px", fontWeight: "700",
              border: "none", cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#5F5E5A"; e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#1A1A18"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PropertyListings() {
  const navigate = useNavigate(); // Add this hook
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  const filters = ["All", "hotel", "villa", "apartment", "cabin", "resort"];

  // Fetch properties from backend
  useEffect(() => {
    fetchProperties();
    loadWishlist();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await getProperties();
      setProperties(response.properties);
      setError("");
    } catch (err) {
      console.error("Failed to fetch properties:", err);
      setError("Failed to load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setWishlist([]);
      return;
    }

    try {
      const response = await getWishlist();
      const ids = (response?.wishlist || [])
        .map((item) => item?.property?._id || item?.property)
        .filter(Boolean)
        .map((id) => String(id));
      setWishlist(ids);
    } catch (err) {
      setWishlist([]);
    }
  };

  const toggleWishlist = async (id, currentlyWishlisted) => {
    const propertyId = String(id);
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // Optimistic UI update
    setWishlist((prev) => {
      const exists = prev.includes(propertyId);
      if (currentlyWishlisted || exists) return prev.filter((w) => w !== propertyId);
      return [...prev, propertyId];
    });

    try {
      if (currentlyWishlisted) {
        await removeFromWishlist(propertyId);
      } else {
        await addToWishlist(propertyId);
      }
    } catch (err) {
      const status = err?.response?.status;
      const message = String(err?.response?.data?.message || "").toLowerCase();

      // Treat idempotent wishlist errors as success to keep UI in sync.
      if (!currentlyWishlisted && status === 400 && message.includes("already")) return;
      if (currentlyWishlisted && (status === 404 || (status === 400 && message.includes("not")))) return;

      // Rollback on error
      setWishlist((prev) => {
        const exists = prev.includes(propertyId);
        if (currentlyWishlisted) return exists ? prev : [...prev, propertyId];
        return prev.filter((w) => w !== propertyId);
      });
    }
  };

  // Updated handleBook function - navigates to property detail page
  const handleBook = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  // Filter and sort properties
  const filtered = properties
    .filter(p => filter === "All" || p.type?.toLowerCase() === filter.toLowerCase())
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: "#5F5E5A" }}>Loading amazing stays...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
        <div className="text-center">
          <p style={{ color: "#E24B4A", marginBottom: "16px" }}>{error}</p>
          <button
            onClick={fetchProperties}
            style={{
              background: "#1A1A18", color: "#FAFAF8",
              borderRadius: "10px", padding: "10px 24px",
              border: "none", cursor: "pointer"
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section style={{ background: "#FAFAF8", padding: "56px 0" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p style={{
              fontSize: "11px", fontWeight: "700",
              letterSpacing: "0.15em", textTransform: "uppercase",
              color: "#B4B2A9", marginBottom: "6px",
            }}>
              Handpicked for you
            </p>
            <h2 style={{
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: "800", color: "#1A1A18",
              fontFamily: "Georgia, serif", lineHeight: "1.2",
            }}>
              Featured Stays
            </h2>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                fontSize: "12px", color: "#1A1A18",
                border: "1.5px solid #1A1A18", borderRadius: "50px",
                padding: "7px 14px", background: "#FAFAF8",
                cursor: "pointer", outline: "none",
              }}
            >
              <option value="default">Sort by</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>

            <button
              onClick={() => window.location.href = "/properties"}
              style={{
                fontSize: "13px", fontWeight: "600", color: "#1A1A18",
                border: "1.5px solid #1A1A18", borderRadius: "50px",
                padding: "8px 20px", background: "transparent",
                cursor: "pointer", transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; e.currentTarget.style.color = "#FAFAF8"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A18"; }}
            >
              View all →
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "7px 16px", borderRadius: "50px",
                fontSize: "12px", fontWeight: "600", cursor: "pointer",
                background: filter === f ? "#1A1A18" : "transparent",
                color: filter === f ? "#FAFAF8" : "#1A1A18",
                border: "1.5px solid #1A1A18",
                transition: "all 0.2s ease",
              }}
            >
              {f === "All" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p style={{
          fontSize: "12px", color: "#B4B2A9",
          marginBottom: "20px",
        }}>
          {filtered.length} {filtered.length === 1 ? "property" : "properties"} found
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p style={{ fontSize: "16px", color: "#B4B2A9" }}>
              No properties found for this filter.
            </p>
            <button
              onClick={() => setFilter("All")}
              style={{
                marginTop: "12px", fontSize: "13px", fontWeight: "600",
                color: "#1A1A18", border: "1.5px solid #1A1A18",
                borderRadius: "50px", padding: "8px 20px",
                background: "transparent", cursor: "pointer",
              }}
            >
              Clear filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(property => (
              <PropertyCard
                key={property._id || property.id}
                property={property}
                onWishlist={toggleWishlist}
                wishlisted={wishlist.includes(String(property._id || property.id))}
                onBook={handleBook}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

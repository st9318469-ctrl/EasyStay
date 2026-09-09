import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getProperties } from "../api/propertyService";
import { API_BASE_URL } from "../api/config";

const allAmenities = ["wifi", "pool", "ac", "kitchen", "parking", "tv", "fireplace", "bbq", "breakfast", "gym"];
const propertyTypes = ["villa", "cabin", "apartment", "cottage", "hotel", "resort"];
const GEOCODE_CACHE_KEY = "easystay_geocode_cache_v1";

const propertyPinIcon = L.divIcon({
  className: "property-pin",
  html: '<span class="property-pin-dot"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function StarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="#1A1A18">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24"
      fill={filled ? "#1A1A18" : "none"} stroke="#1A1A18" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function getLocationQuery(location = {}) {
  return [location.address, location.city, location.state, location.country]
    .filter(Boolean)
    .join(", ");
}

function MapPreview({ properties }) {
  const [mapPins, setMapPins] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const geocodeAddress = async (query) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`
        );
        if (!response.ok) return null;
        const data = await response.json();
        if (!data?.length) return null;
        return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
      } catch {
        return null;
      }
    };

    const buildPins = async () => {
      const rawPins = [];
      const cache = JSON.parse(localStorage.getItem(GEOCODE_CACHE_KEY) || "{}");

      for (const property of properties.slice(0, 40)) {
        const lat = Number(property?.location?.coordinates?.lat);
        const lng = Number(property?.location?.coordinates?.lng);
        const legacyLat = Number(property?.location?.lat);
        const legacyLng = Number(property?.location?.lng);

        const resolvedLat = Number.isFinite(lat) ? lat : legacyLat;
        const resolvedLng = Number.isFinite(lng) ? lng : legacyLng;

        if (Number.isFinite(resolvedLat) && Number.isFinite(resolvedLng)) {
          rawPins.push({
            id: property._id,
            title: property.title,
            price: property.price,
            city: property?.location?.city,
            country: property?.location?.country,
            lat: resolvedLat,
            lng: resolvedLng,
          });
          continue;
        }

        const query = getLocationQuery(property.location);
        if (!query) continue;

        const cached = cache[query];
        if (cached && Number.isFinite(cached.lat) && Number.isFinite(cached.lng)) {
          rawPins.push({
            id: property._id,
            title: property.title,
            price: property.price,
            city: property?.location?.city,
            country: property?.location?.country,
            lat: cached.lat,
            lng: cached.lng,
          });
          continue;
        }

        const point = await geocodeAddress(query);
        if (!point) continue;

        cache[query] = point;
        rawPins.push({
          id: property._id,
          title: property.title,
          price: property.price,
          city: property?.location?.city,
          country: property?.location?.country,
          lat: point.lat,
          lng: point.lng,
        });
      }

      localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));

      if (!cancelled) {
        setMapPins(rawPins);
      }
    };

    buildPins();
    return () => { cancelled = true; };
  }, [properties]);

  const mapCenter = useMemo(() => {
    if (!mapPins.length) return [20.5937, 78.9629];
    const avgLat = mapPins.reduce((sum, pin) => sum + pin.lat, 0) / mapPins.length;
    const avgLng = mapPins.reduce((sum, pin) => sum + pin.lng, 0) / mapPins.length;
    return [avgLat, avgLng];
  }, [mapPins]);

  if (!mapPins.length) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center"
        style={{ background: "#E0DDD6", borderRadius: "14px", minHeight: "260px" }}>
        <p style={{ fontSize: "13px", fontWeight: "600", color: "#5F5E5A" }}>
          Map preview unavailable
        </p>
        <p style={{ fontSize: "11px", color: "#B4B2A9", marginTop: "4px" }}>
          Add property coordinates/address to show location pins
        </p>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(26,26,24,0.1)" }}>
      <MapContainer
        center={mapCenter}
        zoom={mapPins.length > 1 ? 6 : 11}
        scrollWheelZoom={true}
        style={{ minHeight: "320px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mapPins.map((pin) => (
          <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={propertyPinIcon}>
            <Popup>
              <div style={{ minWidth: "140px" }}>
                <p style={{ fontWeight: "700", marginBottom: "4px" }}>{pin.title}</p>
                <p style={{ fontSize: "12px", color: "#5F5E5A", marginBottom: "4px" }}>
                  {[pin.city, pin.country].filter(Boolean).join(", ")}
                </p>
                <p style={{ fontSize: "12px", fontWeight: "700" }}>₹{Number(pin.price || 0).toLocaleString()} / night</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="flex items-center justify-between px-4 py-2" style={{ background: "#F1EFE8" }}>
        <p style={{ fontSize: "11px", color: "#5F5E5A" }}>Map pins for filtered properties</p>
        <p style={{ fontSize: "11px", fontWeight: "700", color: "#1A1A18" }}>
          {mapPins.length} {mapPins.length === 1 ? "location" : "locations"}
        </p>
      </div>
      <style>{`
        .property-pin {
          background: transparent;
          border: none;
        }
        .property-pin-dot {
          display: block;
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          background: #1A1A18;
          border: 2px solid #FAFAF8;
          box-shadow: 0 2px 8px rgba(0,0,0,0.28);
        }
      `}</style>
    </div>
  );
}

function PropertyCard({ property, onWishlist, wishlisted }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/property/${property._id}`)}
      className="rounded-xl overflow-hidden flex flex-col cursor-pointer"
      style={{
        background: "#FAFAF8",
        border: "1px solid rgba(26,26,24,0.12)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? "0 8px 24px rgba(26,26,24,0.1)" : "none",
      }}
    >
      {/* Image */}
      <div className="relative" style={{ height: "160px" }}>
        <img 
          src={property.images?.[0]?.url || "https://via.placeholder.com/300x200"} 
          alt={property.title}
          className="w-full h-full object-cover"
          style={{
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.04)" : "scale(1)",
          }}
        />
        <div className="absolute top-2 left-2" style={{
          background: "#FAFAF8", color: "#1A1A18",
          borderRadius: "50px", padding: "2px 8px",
          fontSize: "9px", fontWeight: "700",
        }}>
          {property.type?.charAt(0).toUpperCase() + property.type?.slice(1)}
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onWishlist(property._id);
          }}
          className="absolute top-2 right-2 flex items-center justify-center"
          style={{
            width: "26px", height: "26px", borderRadius: "50%",
            background: "rgba(250,250,248,0.92)",
            border: "none", cursor: "pointer",
          }}>
          <HeartIcon filled={wishlisted} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "12px 14px" }}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <p style={{ fontSize: "13px", fontWeight: "700", color: "#1A1A18", fontFamily: "Georgia,serif" }}>
            {property.title}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <StarIcon />
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#1A1A18" }}>
              {property.rating || 4.5}
            </span>
          </div>
        </div>
        <p style={{ fontSize: "11px", color: "#5F5E5A", marginBottom: "8px" }}>
          {property.location?.city}, {property.location?.country} {"\u00B7"} {property.maxGuests || property.guests} guests {"\u00B7"} {property.bedrooms || 0} beds
        </p>
        <div className="flex items-center justify-between">
          <p style={{ fontSize: "14px", fontWeight: "800", color: "#1A1A18", fontFamily: "Georgia,serif" }}>
            {"\u20B9"}{property.price?.toLocaleString()}
            <span style={{ fontSize: "10px", fontWeight: "400", color: "#B4B2A9" }}> /night</span>
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/property/${property._id}`);
            }}
            style={{
              background: "#1A1A18", color: "#FAFAF8",
              borderRadius: "8px", padding: "5px 12px",
              fontSize: "11px", fontWeight: "700",
              border: "none", cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#5F5E5A"}
            onMouseLeave={e => e.currentTarget.style.background = "#1A1A18"}
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [priceRange, setPriceRange] = useState(15000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [guests, setGuests] = useState(1);

  // Fetch properties from backend
  useEffect(() => {
    fetchProperties();
    fetchWishlist();
  }, []);

  // Initialize filters from URL (e.g. /search?q=goa&guests=3)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") ?? params.get("search") ?? "";
    const guestsParam = params.get("guests");

    setSearch(q);

    if (guestsParam !== null) {
      const parsedGuests = Number.parseInt(guestsParam, 10);
      if (Number.isFinite(parsedGuests) && parsedGuests > 0) {
        setGuests(parsedGuests);
      }
    }
  }, [location.search]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setFetchError("");
      const response = await getProperties();
      const list = Array.isArray(response?.properties)
        ? response.properties
        : Array.isArray(response?.data?.properties)
          ? response.data.properties
          : Array.isArray(response)
            ? response
            : [];
      setProperties(list);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
      setFetchError("Could not load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const wishlistIds = response.data.wishlist.map(item => item.property._id);
      setWishlist(wishlistIds);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const toggleWishlist = async (propertyId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    try {
      if (wishlist.includes(propertyId)) {
        await axios.delete(`${API_BASE_URL}/api/wishlist/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlist(wishlist.filter(id => id !== propertyId));
      } else {
        await axios.post(`${API_BASE_URL}/api/wishlist`, 
          { propertyId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlist([...wishlist, propertyId]);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  const toggleType = (type) =>
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);

  const toggleAmenity = (a) =>
    setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  // Filter and sort properties
  const filtered = properties
    .filter(p => {
      // Search filter
      if (search && !p.title?.toLowerCase().includes(search.toLowerCase()) &&
          !p.location?.city?.toLowerCase().includes(search.toLowerCase()) &&
          !p.location?.country?.toLowerCase().includes(search.toLowerCase())) return false;
      
      // Type filter
      if (selectedTypes.length && !selectedTypes.includes(p.type)) return false;
      
      // Price filter
      if (p.price > priceRange) return false;
      
      // Rating filter
      if (p.rating < minRating) return false;
      
      // Guests filter
      if (p.maxGuests < guests) return false;
      
      // Amenities filter
      if (selectedAmenities.length &&
          !selectedAmenities.every(a => p.amenities?.includes(a))) return false;
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-low")  return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating")     return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const clearAll = () => {
    setSelectedTypes([]);
    setSelectedAmenities([]);
    setPriceRange(15000);
    setMinRating(0);
    setGuests(1);
    setSearch("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: "#5F5E5A" }}>Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#FAFAF8", minHeight: "100vh", padding: "32px 0" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-6">
          <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.15em", textTransform: "uppercase", color: "#B4B2A9", marginBottom: "4px" }}>
            Search Results
          </p>
          <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: "800", color: "#1A1A18", fontFamily: "Georgia,serif" }}>
            Find Your Stay
          </h1>
          {fetchError && (
            <p style={{ marginTop: "8px", fontSize: "12px", color: "#E24B4A" }}>
              {fetchError}
            </p>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center flex-1 gap-2 rounded-full px-4 py-2.5"
            style={{ border: "1.5px solid #1A1A18", background: "#FAFAF8" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A1A18" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input type="text" placeholder="Search by city, country, or property name..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="outline-none bg-transparent flex-1 text-sm"
              style={{ color: "#1A1A18" }}
            />
          </div>

          <div className="flex gap-2">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{
                fontSize: "12px", color: "#1A1A18",
                border: "1.5px solid #1A1A18", borderRadius: "50px",
                padding: "8px 16px", background: "#FAFAF8", outline: "none", cursor: "pointer",
              }}>
              <option value="default">Sort by</option>
              <option value="price-low">Price: Low {"\u2192"} High</option>
              <option value="price-high">Price: High {"\u2192"} Low</option>
              <option value="rating">Top Rated</option>
            </select>

            <button onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
              style={{
                fontSize: "12px", fontWeight: "700", color: showFilters ? "#FAFAF8" : "#1A1A18",
                border: "1.5px solid #1A1A18", borderRadius: "50px",
                padding: "8px 16px", background: showFilters ? "#1A1A18" : "transparent",
                cursor: "pointer", transition: "all 0.2s ease",
              }}>
              Filters {selectedTypes.length + selectedAmenities.length > 0
                ? `(${selectedTypes.length + selectedAmenities.length})` : ""}
            </button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Filters */}
          <div className={`lg:block ${showFilters ? "block" : "hidden"}`}>
            <div style={{
              background: "#F1EFE8", borderRadius: "16px",
              padding: "20px", border: "1px solid rgba(26,26,24,0.08)",
            }}>
              {/* Filter header */}
              <div className="flex items-center justify-between mb-4">
                <p style={{ fontSize: "14px", fontWeight: "700", color: "#1A1A18" }}>Filters</p>
                <button onClick={clearAll}
                  style={{ fontSize: "11px", color: "#5F5E5A", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  Clear all
                </button>
              </div>

              {/* Guests */}
              <div className="mb-5">
                <p style={{ fontSize: "11px", fontWeight: "700", color: "#1A1A18", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
                  Guests
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setGuests(Math.max(1, guests - 1))}
                    style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1.5px solid #1A1A18", background: "transparent", cursor: "pointer", fontSize: "14px", color: "#1A1A18" }}>
                    -
                  </button>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#1A1A18" }}>{guests}</span>
                  <button onClick={() => setGuests(guests + 1)}
                    style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1.5px solid #1A1A18", background: "transparent", cursor: "pointer", fontSize: "14px", color: "#1A1A18" }}>
                    +
                  </button>
                </div>
              </div>

              {/* Property Type */}
              <div className="mb-5">
                <p style={{ fontSize: "11px", fontWeight: "700", color: "#1A1A18", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
                  Property Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map(type => (
                    <button key={type} onClick={() => toggleType(type)}
                      style={{
                        padding: "5px 12px", borderRadius: "50px",
                        fontSize: "11px", fontWeight: "600", cursor: "pointer",
                        background: selectedTypes.includes(type) ? "#1A1A18" : "transparent",
                        color: selectedTypes.includes(type) ? "#FAFAF8" : "#1A1A18",
                        border: "1.5px solid #1A1A18",
                        transition: "all 0.2s ease",
                      }}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p style={{ fontSize: "11px", fontWeight: "700", color: "#1A1A18", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Max Price / Night
                  </p>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#1A1A18" }}>
                    {"\u20B9"}{priceRange.toLocaleString()}
                  </span>
                </div>
                <input type="range" min="1000" max="20000" step="500"
                  value={priceRange} onChange={e => setPriceRange(Number(e.target.value))}
                  className="w-full" style={{ accentColor: "#1A1A18" }}
                />
                <div className="flex justify-between mt-1">
                  <span style={{ fontSize: "10px", color: "#B4B2A9" }}>{"\u20B9"}1,000</span>
                  <span style={{ fontSize: "10px", color: "#B4B2A9" }}>{"\u20B9"}20,000</span>
                </div>
              </div>

              {/* Min Rating */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p style={{ fontSize: "11px", fontWeight: "700", color: "#1A1A18", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Min Rating
                  </p>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#1A1A18" }}>
                    {minRating > 0 ? `${minRating}+` : "Any"}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[0, 4.0, 4.5, 4.8].map(r => (
                    <button key={r} onClick={() => setMinRating(r)}
                      style={{
                        padding: "4px 10px", borderRadius: "50px",
                        fontSize: "11px", fontWeight: "600", cursor: "pointer",
                        background: minRating === r ? "#1A1A18" : "transparent",
                        color: minRating === r ? "#FAFAF8" : "#1A1A18",
                        border: "1.5px solid #1A1A18",
                        transition: "all 0.2s ease",
                      }}>
                      {r === 0 ? "Any" : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <p style={{ fontSize: "11px", fontWeight: "700", color: "#1A1A18", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
                  Amenities
                </p>
                <div className="flex flex-wrap gap-2">
                  {allAmenities.map(a => (
                    <button key={a} onClick={() => toggleAmenity(a)}
                      style={{
                        padding: "4px 10px", borderRadius: "50px",
                        fontSize: "11px", fontWeight: "500", cursor: "pointer",
                        background: selectedAmenities.includes(a) ? "#1A1A18" : "transparent",
                        color: selectedAmenities.includes(a) ? "#FAFAF8" : "#1A1A18",
                        border: "1px solid rgba(26,26,24,0.3)",
                        transition: "all 0.2s ease",
                      }}>
                      {a.charAt(0).toUpperCase() + a.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Map + Cards */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Map */}
            <MapPreview properties={filtered} />

            {/* Results count */}
            <div className="flex items-center justify-between">
              <p style={{ fontSize: "13px", color: "#5F5E5A" }}>
                <span style={{ fontWeight: "700", color: "#1A1A18" }}>{filtered.length}</span>
                {" "}{filtered.length === 1 ? "property" : "properties"} found
              </p>
              {(selectedTypes.length + selectedAmenities.length > 0 || minRating > 0 || priceRange < 15000 || guests > 1) && (
                <button onClick={clearAll}
                  style={{ fontSize: "12px", color: "#1A1A18", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  Clear filters
                </button>
              )}
            </div>

            {/* Cards Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <p style={{ fontSize: "16px", color: "#B4B2A9", marginBottom: "12px" }}>
                  No properties match your filters.
                </p>
                <button onClick={clearAll}
                  style={{
                    fontSize: "13px", fontWeight: "700", color: "#1A1A18",
                    border: "1.5px solid #1A1A18", borderRadius: "50px",
                    padding: "9px 22px", background: "transparent", cursor: "pointer",
                  }}>
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(property => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    onWishlist={toggleWishlist}
                    wishlisted={wishlist.includes(property._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

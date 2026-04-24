import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../api/propertyService";

export default function Wishlist() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await getWishlist();
      setItems(response?.wishlist || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (propertyId) => {
    try {
      await removeFromWishlist(propertyId);
      setItems((prev) => prev.filter((it) => String(it.property?._id || it.property) !== String(propertyId)));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to remove from wishlist");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: "#5F5E5A" }}>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "Georgia, serif", color: "#1A1A18" }}
            >
              Wishlist
            </h1>
            <p style={{ color: "#5F5E5A", marginTop: 6 }}>
              Saved stays you want to book later.
            </p>
          </div>
          <button
            onClick={() => navigate("/properties")}
            style={{
              background: "#1A1A18",
              color: "#FAFAF8",
              borderRadius: "10px",
              padding: "10px 16px",
              fontSize: "13px",
              fontWeight: "700",
              border: "none",
              cursor: "pointer",
            }}
          >
            Browse stays
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#FEE2E2", color: "#E24B4A" }}>
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center" style={{ border: "1px solid rgba(26,26,24,0.12)" }}>
            <p style={{ color: "#5F5E5A" }}>Your wishlist is empty.</p>
            <button
              onClick={() => navigate("/properties")}
              style={{
                marginTop: 14,
                background: "#1A1A18",
                color: "#FAFAF8",
                borderRadius: "10px",
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: "700",
                border: "none",
                cursor: "pointer",
              }}
            >
              Find stays
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const property = item.property && typeof item.property === "object" ? item.property : null;
              const propertyId = property?._id || item.property;
              return (
                <div
                  key={String(item._id || propertyId)}
                  className="rounded-2xl overflow-hidden bg-white"
                  style={{ border: "1px solid rgba(26,26,24,0.12)" }}
                >
                  <div
                    className="relative cursor-pointer"
                    style={{ height: 200 }}
                    onClick={() => navigate(`/property/${propertyId}`)}
                  >
                    <img
                      src={property?.images?.[0]?.url || "/placeholder.jpg"}
                      alt={property?.title || "Property"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div style={{ padding: 16 }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 style={{ fontWeight: 800, color: "#1A1A18", fontFamily: "Georgia, serif" }}>
                          {property?.title || "Saved property"}
                        </h3>
                        <p style={{ fontSize: 12, color: "#5F5E5A", marginTop: 4 }}>
                          {property?.location?.city || ""}{property?.location?.country ? `, ${property.location.country}` : ""}
                        </p>
                      </div>
                      {typeof property?.price === "number" && (
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontWeight: 900, color: "#1A1A18" }}>₹{property.price.toLocaleString()}</p>
                          <p style={{ fontSize: 10, color: "#B4B2A9" }}>per night</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => navigate(`/property/${propertyId}`)}
                        style={{
                          flex: 1,
                          background: "#1A1A18",
                          color: "#FAFAF8",
                          borderRadius: "10px",
                          padding: "10px 12px",
                          fontSize: "12px",
                          fontWeight: "800",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleRemove(propertyId)}
                        style={{
                          background: "transparent",
                          color: "#E24B4A",
                          borderRadius: "10px",
                          padding: "10px 12px",
                          fontSize: "12px",
                          fontWeight: "800",
                          border: "1.5px solid #E24B4A",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


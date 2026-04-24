import { useState } from "react";
import axios from "axios";
import StarRating from "./StarRating";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ReviewModal({ propertyId, propertyTitle, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to write a review.");
      return;
    }

    if (!propertyId) {
      setError("Missing property id.");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a short review.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_URL}/api/reviews`,
        { propertyId, rating, comment: comment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        onSuccess?.();
        onClose?.();
        return;
      }

      setError(response.data?.message || "Failed to submit review.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(26,26,24,0.8)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-4 rounded-2xl overflow-hidden"
        style={{ background: "#FAFAF8" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid rgba(26,26,24,0.12)" }}>
          <div>
            <p style={{ fontWeight: 900, color: "#1A1A18" }}>Write a review</p>
            <p style={{ fontSize: 12, color: "#5F5E5A", marginTop: 2 }}>{propertyTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: "none", background: "transparent", fontSize: 22, cursor: "pointer", color: "#B4B2A9" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#FEE2E2", color: "#E24B4A" }}>
              {error}
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm font-medium mb-2" style={{ color: "#1A1A18" }}>Your rating</p>
            <StarRating rating={rating} onChange={setRating} readonly={submitting} size={18} />
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium mb-2" style={{ color: "#1A1A18" }}>Your review</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl outline-none"
              style={{
                border: "1.5px solid rgba(26,26,24,0.2)",
                background: "#FFFFFF",
                color: "#1A1A18",
              }}
              placeholder="Share what you liked (or didn’t like)…"
              disabled={submitting}
              maxLength={500}
            />
            <p className="text-xs mt-1" style={{ color: "#B4B2A9" }}>
              {comment.length}/500
            </p>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="w-full py-3 rounded-xl font-bold"
            style={{
              background: submitting ? "#B4B2A9" : "#1A1A18",
              color: "#FAFAF8",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </div>
      </div>
    </div>
  );
}


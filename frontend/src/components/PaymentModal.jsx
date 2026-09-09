import { useState } from "react";
import axios from "axios";
import BookingSuccessModal from "./BookingSuccessModal";
import { API_BASE_URL } from "../api/config";

export default function PaymentModal({ bookingId, amount, bookingDetails, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const confirmWithMethod = async (payload) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${API_BASE_URL}/api/bookings/${bookingId}/payment`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  const buildConfirmedBooking = (booking) => ({
    bookingId: booking?._id,
    propertyTitle: bookingDetails?.propertyTitle,
    propertyImage: bookingDetails?.propertyImage,
    location: bookingDetails?.location,
    bedrooms: bookingDetails?.bedrooms,
    guests: bookingDetails?.guests,
    checkIn: bookingDetails?.checkIn,
    checkOut: bookingDetails?.checkOut,
    nights: bookingDetails?.nights,
    totalPrice: bookingDetails?.totalPrice ?? booking?.totalPrice ?? amount,
  });

  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again to complete payment.");
        return;
      }

      const ok = await loadRazorpayScript();
      if (!ok) {
        alert("Failed to load payment gateway. Please try again.");
        return;
      }

      const orderRes = await axios.post(
        `${API_BASE_URL}/api/payments/create-order`,
        { bookingId, paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!orderRes.data?.success) {
        throw new Error(orderRes.data?.message || "Failed to create payment order");
      }

      const { orderId, amount: orderAmount, keyId } = orderRes.data;

      const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

      const options = {
        key: keyId,
        amount: orderAmount,
        currency: "INR",
        name: "EasyStay",
        description: "Booking Payment",
        order_id: orderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#1A1A18" },
        method: paymentMethod === "card" ? { card: true } : paymentMethod === "upi" ? { upi: true } : undefined,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `${API_BASE_URL}/api/payments/verify`,
              {
                bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!verifyRes.data?.success) {
              throw new Error(verifyRes.data?.message || "Payment verification failed");
            }

            setConfirmedBooking(buildConfirmedBooking(verifyRes.data.booking));
            setShowSuccess(true);
            onSuccess?.();
          } catch (err) {
            console.error("Verify payment error:", err);
            alert(err.response?.data?.message || err.message || "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", {
        apiUrl: API_BASE_URL,
        bookingId,
        status: error?.response?.status,
        message: error?.response?.data?.message || error.message,
      });
      alert(error.response?.data?.message || error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (paymentMethod === "upi" || paymentMethod === "card") {
      await handleRazorpayPayment();
      return;
    }

    setLoading(true);

    try {
      const payload =
        { paymentMethod, status: "confirmed" };

      const data = await confirmWithMethod(payload);
      if (!data?.success) throw new Error(data?.message || "Failed to confirm booking");

      setConfirmedBooking(buildConfirmedBooking(data.booking));
      setShowSuccess(true);
      onSuccess?.();
    } catch (error) {
      console.error("Booking confirmation error:", error);
      alert(error.response?.data?.message || error.message || "Failed to confirm booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">{"\u{1F4B0}"}</span>
            </div>
            <h2 className="text-xl font-bold" style={{ color: "#1A1A18" }}>
              Complete Payment
            </h2>
            <p className="text-sm mt-2" style={{ color: "#5F5E5A" }}>
              Total Amount:{" "}
              <span className="font-bold text-lg">
                {"\u20B9"}
                {amount?.toLocaleString?.() ?? amount}
              </span>
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: "#1A1A18" }}>
              Select Payment Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 accent-black"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{"\u{1F4F1}"}</span>
                  <p className="font-medium">UPI</p>
                </div>
                  <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm, BHIM</p>
                </div>
                <span className="text-xs text-green-600">Instant</span>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 accent-black"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{"\u{1F4B3}"}</span>
                  <p className="font-medium">Card</p>
                  </div>
                  <p className="text-xs text-gray-500">Visa, MasterCard, RuPay</p>
                </div>
                <span className="text-xs text-green-600">Instant</span>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 accent-black"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{"\u{1F3E0}"}</span>
                    <p className="font-medium">Pay at Property</p>
                  </div>
                  <p className="text-xs text-gray-500">Cash, card, or UPI at check-in</p>
                </div>
                <span className="text-xs text-blue-600">No payment now</span>
              </label>
            </div>
          </div>

          {paymentMethod === "cash" && (
            <div className="mb-6 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-2">
                <span className="text-green-600 text-lg">{"\u{1F4A1}"}</span>
                <div>
                  <p className="text-xs font-medium text-green-800">No payment required now!</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Your booking is confirmed. Pay directly at the property during check-in.
                  </p>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "upi" && (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 text-lg">{"\u{1F4F1}"}</span>
                <div>
                  <p className="text-xs font-medium text-blue-800">Pay securely via UPI</p>
                  <p className="text-xs text-gray-600 mt-1">
                    You will be redirected to the payment gateway. Booking confirms automatically after payment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "card" && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg border" style={{ borderColor: "rgba(26,26,24,0.12)" }}>
              <p className="text-xs text-center" style={{ color: "#5F5E5A" }}>
                Enter your card details in the payment gateway. Booking confirms automatically after payment.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleConfirmBooking}
              disabled={loading}
              className="flex-1 py-3 rounded-lg font-bold transition-all hover:scale-[1.02] active:scale-95"
              style={{
                background: loading ? "#B4B2A9" : "#1A1A18",
                color: "#FAFAF8",
              }}
            >
              {loading
                ? "Processing..."
                : paymentMethod === "upi" || paymentMethod === "card"
                  ? "Proceed to Pay"
                  : "Confirm Booking"}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-lg font-medium border transition-all hover:bg-gray-50"
              style={{ borderColor: "#1A1A18", color: "#1A1A18" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <BookingSuccessModal
          bookingDetails={confirmedBooking}
          onClose={() => {
            setShowSuccess(false);
            onClose?.();
          }}
        />
      )}
    </>
  );
}

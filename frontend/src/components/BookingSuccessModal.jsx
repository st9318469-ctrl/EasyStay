import { useNavigate } from "react-router-dom";

export default function BookingSuccessModal({ bookingDetails, onClose }) {
  const navigate = useNavigate();

  const goToTrips = () => {
    onClose?.();
    navigate("/my-trips");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[70]">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="text-center mb-5">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">{"\u2705"}</span>
          </div>
          <h2 className="text-xl font-bold" style={{ color: "#1A1A18" }}>
            Booking Confirmed
          </h2>
          <p className="text-sm mt-1" style={{ color: "#5F5E5A" }}>
            Your booking is confirmed successfully.
          </p>
        </div>

        <div className="flex items-center gap-3 mb-5">
          {bookingDetails?.propertyImage ? (
            <img
              src={bookingDetails.propertyImage}
              alt={bookingDetails.propertyTitle || "Property"}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-100" />
          )}
          <div className="flex-1">
            <p className="font-bold" style={{ color: "#1A1A18" }}>
              {bookingDetails?.propertyTitle || "Your stay"}
            </p>
            <p className="text-xs" style={{ color: "#5F5E5A" }}>
              {bookingDetails?.location || ""}
            </p>
            <p className="text-xs mt-1" style={{ color: "#B4B2A9" }}>
              Booking ID: {bookingDetails?.bookingId || ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-[10px] uppercase font-bold" style={{ color: "#B4B2A9" }}>
              Check-in
            </p>
            <p className="text-sm font-semibold" style={{ color: "#1A1A18" }}>
              {bookingDetails?.checkIn || "-"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-[10px] uppercase font-bold" style={{ color: "#B4B2A9" }}>
              Check-out
            </p>
            <p className="text-sm font-semibold" style={{ color: "#1A1A18" }}>
              {bookingDetails?.checkOut || "-"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-[10px] uppercase font-bold" style={{ color: "#B4B2A9" }}>
              Guests
            </p>
            <p className="text-sm font-semibold" style={{ color: "#1A1A18" }}>
              {bookingDetails?.guests ?? "-"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-[10px] uppercase font-bold" style={{ color: "#B4B2A9" }}>
              Total
            </p>
            <p className="text-sm font-semibold" style={{ color: "#1A1A18" }}>
              {"\u20B9"}
              {(bookingDetails?.totalPrice ?? bookingDetails?.totalAmount ?? 0).toLocaleString?.() ??
                bookingDetails?.totalPrice}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={goToTrips}
            className="flex-1 py-3 rounded-lg font-bold transition-all"
            style={{ background: "#1A1A18", color: "#FAFAF8" }}
          >
            View My Trips
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-medium border transition-all"
            style={{ borderColor: "#1A1A18", color: "#1A1A18" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


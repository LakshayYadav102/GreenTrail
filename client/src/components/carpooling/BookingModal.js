// components/carpooling/BookingModal.jsx
import React, { useState } from "react";
import api from "../../services/api";
import "./BookingModal.css";


function BookingModal({ ride, onClose, onBookingSuccess }) {
  const [seats, setSeats] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBook = async () => {
    if (seats < 1 || seats > ride.seatsAvailable) {
      setError("Invalid number of seats");
      return;
    }



    setLoading(true);
    setError(null);
    try {
      const res = await api.post(
        `/rides/book/${ride._id}`,
        { seatsBooked: Number(seats), paymentMethod }
      );
      if (paymentMethod === "online") {
        // Dummy payment simulation
        alert("Payment processed (dummy). Booking pending confirmation.");
      } else {
        alert("Booking request sent! Awaiting driver confirmation.");
      }
      onBookingSuccess(res.data.booking);
      onClose();
    } catch (err) {
      console.error("Error booking ride:", err.message, err.response?.data);
      setError(err.response?.data?.error || "Error booking ride");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Book Ride</h3>
        <p className="mb-4">Seats Available: {ride.seatsAvailable}</p>
        <input
          type="number"
          min="1"
          max={ride.seatsAvailable}
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
          className="w-full p-2 border rounded-lg mb-4"
        />
        <label className="block text-sm font-medium text-gray-600 mb-2">Payment Method</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full p-2 border rounded-lg mb-4"
        >
          <option value="cash">Cash on Travel Day</option>
          <option value="online">Pay Now (UPI/Card)</option>
        </select>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleBook}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? "Booking..." : "Send Booking Request"}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;



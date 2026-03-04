import React from "react";
import { useNavigate } from "react-router-dom";
import "./RideCard.css";

function RideCard({ ride }) {
  const navigate = useNavigate();

  // Fallback if ride or driver is undefined
  if (!ride || !ride._id) {
    return <div className="ride-card bg-white p-4 rounded-xl shadow-md">Invalid ride data</div>;
  }

  const driverName = ride.driver?.name || "Unknown Driver";
  const driverEmail = ride.driver?.email || "N/A";

  return (
    <div
      className="ride-card bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition cursor-pointer"
      onClick={() => navigate(`/ride/${ride._id}`)}
    >
      <h3 className="text-lg font-semibold">🚗 {ride.from || "Unknown"} → {ride.to || "Unknown"}</h3>
      <p className="text-gray-600">Driver: {driverName} ({driverEmail})</p>
      <p className="text-gray-600">
        Date: {ride.date ? new Date(ride.date).toLocaleDateString() : "N/A"} | Time: {ride.time || "N/A"}
      </p>
      <p className="text-gray-600">Seats Available: {ride.seatsAvailable ?? "N/A"}</p>
      <p className="text-gray-600">Price per Seat: ${ride.pricePerSeat ?? 0}</p>
    </div>
  );
}

export default RideCard;
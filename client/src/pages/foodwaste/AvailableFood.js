import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GreenverseNavbar from "../../components/GreenverseNavbar";
import api from "../../services/api";
import "./AvailableFood.css";

function AvailableFood() {
  const navigate = useNavigate();
  const [availableFood, setAvailableFood] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAvailableFood = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      alert("Please log in to view available food.");
      navigate("/login");
      return;
    }

    try {
      const res = await api.get("/food-donations/available", {  // ← FIXED HERE
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableFood(res.data);
    } catch (error) {
      console.error("Fetch error:", error);
      let msg = "Failed to load available food.";
      if (error.response?.status === 401) {
        msg = "Session expired. Please log in again.";
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 1500);
      } else if (error.response?.status === 404) {
        msg = "No available food route found on server.";
      }
      setErrorMsg(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableFood();
  }, []);

  const handleAcceptFood = async (foodId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to accept food.");
      navigate("/login");
      return;
    }

    try {
      await api.patch(`/food-donations/${foodId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Food accepted successfully!");
      fetchAvailableFood(); // refresh list
    } catch (error) {
      console.error("Accept error:", error);
      let msg = "Could not accept food.";
      if (error.response?.status === 401) {
        msg = "Session expired. Please log in again.";
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 1500);
      } else if (error.response?.status === 400) {
        msg = error.response.data.message || msg;
      } else if (error.response?.status === 404) {
        msg = "Donation not found.";
      }
      alert(msg);
    }
  };

  return (
    <>
      <GreenverseNavbar />
      <div className="available-food-page">
        <h1>Available Food Donations</h1>
        <p>Browse and accept surplus food before it expires.</p>

        {errorMsg && <div className="error-msg">{errorMsg}</div>}

        {loading ? (
          <div className="loading">Loading available donations...</div>
        ) : availableFood.length === 0 ? (
          <div className="no-food">
            <p>No food available at the moment.</p>
          </div>
        ) : (
          <div className="food-grid">
            {availableFood.map((food) => (
              <div key={food._id} className="food-card">
                <div className="card-header">
                  <span className="food-type">{food.foodType || "Unknown"}</span>
                  {food.donationSource === "EVENT" && (
                    <span className="event-tag">Event</span>
                  )}
                </div>

                <div className="donor-info">
                  From: {food.donor?.username || "Anonymous"}
                </div>

                <div className="food-detail">
                  <strong>Category:</strong> {food.foodCategory || "N/A"}
                </div>
                <div className="food-detail">
                  <strong>Quantity:</strong> {food.quantity} {food.unit}
                </div>
                <div className="food-detail">
                  <strong>Expires:</strong>{" "}
                  {new Date(food.expiryTime).toLocaleString()}
                </div>
                <div className="food-detail">
                  <strong>Location:</strong> {food.location || "Not specified"}
                </div>

                {food.notes && (
                  <div className="food-notes">
                    <strong>Notes:</strong> {food.notes}
                  </div>
                )}

                <button
                  className="accept-button"
                  onClick={() => handleAcceptFood(food._id)}
                >
                  Accept This Donation
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="sustainability-note">
          <p>
            Donations not accepted in time are responsibly redirected for composting or animal feed.
          </p>
        </div>
      </div>
    </>
  );
}

export default AvailableFood;
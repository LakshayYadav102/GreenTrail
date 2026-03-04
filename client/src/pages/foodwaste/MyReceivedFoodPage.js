import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GreenverseNavbar from "../../components/foodwaste/FoodWasteNavbar";
import api from "../../services/api"; // Centralized API
import "./MyReceivedFoodPage.css";

function MyReceivedFoodPage() {
  const navigate = useNavigate();
  const [received, setReceived] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const calculateCarbon = (quantity, unit) => {
    let kg = quantity;
    if (unit === "grams") kg /= 1000;
    if (unit === "plates") kg *= 0.4;
    return Number((kg * 2.5).toFixed(2));
  };

  const fetchReceivedFood = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      alert("Please log in to view your received food history.");
      navigate("/login");
      return;
    }

    try {
      // CLEANED FOR HOSTING: Removed manual headers
      const res = await api.get("/food-donations/received");

      // Apply fallback carbon to each item for display
      const fixedReceived = (res.data.received || []).map(item => ({
        ...item,
        displayCarbon: item.carbonSaved && item.carbonSaved > 0 
          ? item.carbonSaved 
          : calculateCarbon(item.quantity, item.unit)
      }));

      setReceived(fixedReceived);
      setSummary(res.data.summary || null);
    } catch (error) {
      console.error("Fetch Received Food Error:", error);

      let msg = "Failed to load received food history.";
      if (error.response?.status === 401) {
        msg = "Session expired. Please log in again.";
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 1500);
      } else if (error.response?.status === 404) {
        msg = "Received food endpoint not found on server (404). Check backend mounting.";
      } else if (error.response?.status === 500) {
        msg = "Server error while fetching received donations.";
      }

      setErrorMsg(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivedFood();
  }, []);

  return (
    <>
      <GreenverseNavbar />
      <div className="my-received-page">
        <h1>My Received Food</h1>
        <p>Track donations you've accepted and your environmental impact.</p>

        {errorMsg && <div className="error-msg">{errorMsg}</div>}

        {loading ? (
          <div className="loading">Loading your received donations...</div>
        ) : (
          <>
            {summary && (
              <div className="summary-card">
                <h2>Your Impact as Receiver</h2>
                <p>Total Donations Received: <strong>{summary.totalReceived}</strong></p>
                <p>Total Food Received: <strong>{summary.totalFoodReceivedKg} kg</strong></p>
                <p>Waste Prevented (CO₂ saved): <strong>{summary.totalCarbonImpact} kg CO₂</strong></p>
              </div>
            )}

            <div className="received-list">
              {received.length === 0 ? (
                <div className="no-food">
                  <p>You haven't accepted any donations yet.</p>
                </div>
              ) : (
                received.map((item) => (
                  <div key={item._id} className="received-card">
                    <div className="received-header">
                      <strong>{item.foodCategory?.toUpperCase() || "Unknown"}</strong>
                      {item.donationSource === "EVENT" && (
                        <span className="event-tag">Event</span>
                      )}
                    </div>

                    <p>
                      <strong>{item.quantity} {item.unit}</strong> | {item.foodType}
                    </p>

                    <p>
                      From: <strong>{item.donor?.username || "Anonymous"}</strong>
                    </p>

                    <p>
                      Received: {new Date(item.updatedAt).toLocaleString()}
                    </p>

                    <p>
                      Carbon Impact: <strong>{item.displayCarbon} kg CO₂</strong>
                    </p>

                    {item.notes && (
                      <p className="notes">
                        <strong>Notes:</strong> {item.notes}
                      </p>
                    )}

                    <button
                      className="request-again-btn"
                      onClick={() => navigate(`/food-waste/chat/${item._id}`)}
                    >
                      Message Donor
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <div className="sustainability-note">
          <p>
            Every accepted donation helps reduce food waste and supports the community.
          </p>
        </div>
      </div>
    </>
  );
}

export default MyReceivedFoodPage;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FoodWasteNavbar from "../../components/foodwaste/FoodWasteNavbar"; // Correct Navbar
import api from "../../services/api"; 
import "./MyReceivedFoodPage.css";

function MyReceivedFoodPage() {
  const navigate = useNavigate();
  const [received, setReceived] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

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
      const res = await api.get("/food-donations/received");

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
        msg = "Received food endpoint not found on server.";
      }

      setErrorMsg(msg);
    } finally {
      setLoading(false);
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchReceivedFood();
    // eslint-disable-next-line
  }, []);

  const getCategoryIcon = (category) => {
    if (category === "cooked") return "🍲";
    if (category === "raw") return "🥬";
    if (category === "packaged") return "🥫";
    return "🍽️";
  };

  return (
    <div className="fw-rec-page-wrapper">
      <FoodWasteNavbar />
      
      {/* Background matches the Food Rescue Homepage */}
      <div className="fw-rec-background"></div>

      <div className={`fw-rec-container ${isLoaded ? 'loaded' : ''}`}>
        
        <div className="fw-rec-header">
          <div className="fw-hero-badge">Retrieval History</div>
          <h1>My Received <span className="fw-gradient-text-pink">Food</span></h1>
          <p className="fw-subtitle">Track the donations you've accepted and see your positive environmental impact.</p>
        </div>

        {errorMsg && (
          <div className="fw-error-message">
            <span className="fw-error-icon">⚠️</span>
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="fw-loading-state">
            <div className="fw-spinner-pink"></div>
            <p>Loading your retrieval history...</p>
          </div>
        ) : (
          <>
            {summary && (
              <div className="fw-summary-grid">
                <div className="fw-summary-card">
                  <div className="fw-summary-icon">🤝</div>
                  <h3>{summary.totalReceived}</h3>
                  <p>Total Retrievals</p>
                </div>
                <div className="fw-summary-card">
                  <div className="fw-summary-icon">⚖️</div>
                  <h3>{summary.totalFoodReceivedKg} <span className="fw-unit">kg</span></h3>
                  <p>Total Food Rescued</p>
                </div>
                <div className="fw-summary-card eco">
                  <div className="fw-summary-icon">🌍</div>
                  <h3>{summary.totalCarbonImpact} <span className="fw-unit">kg CO₂</span></h3>
                  <p>Waste Prevented</p>
                </div>
              </div>
            )}

            <div className="fw-rec-list">
              {received.length === 0 ? (
                <div className="fw-empty-state">
                  <div className="fw-empty-icon">🍽️</div>
                  <h2>No Received Donations</h2>
                  <p>You haven't accepted any food donations yet. Browse available food to start making an impact.</p>
                  <button 
                    className="fw-btn fw-primary-btn"
                    onClick={() => navigate("/food-waste/available")}
                  >
                    Find Available Food →
                  </button>
                </div>
              ) : (
                received.map((item, index) => (
                  <div 
                    key={item._id} 
                    className="fw-rec-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="fw-card-glow"></div>
                    <div className="fw-card-inner">
                      
                      <div className="fw-card-header">
                        <div className="fw-category-badge">
                          <span className="fw-cat-icon">{getCategoryIcon(item.foodCategory)}</span>
                          {item.foodCategory?.toUpperCase() || "UNKNOWN"}
                        </div>
                        {item.donationSource === "EVENT" && (
                          <span className="fw-event-tag">🎊 Event</span>
                        )}
                      </div>

                      <div className="fw-card-body">
                        <div className="fw-donor-info">
                          <span className="fw-label">Donated By:</span>
                          <span className="fw-donor-name">{item.donor?.username || "Anonymous"}</span>
                        </div>

                        <div className="fw-detail-row main-detail">
                          <div className="fw-quantity-box">
                            <span className="fw-qty-val">{item.quantity}</span>
                            <span className="fw-qty-unit">{item.unit}</span>
                          </div>
                          <div className="fw-category-box">
                            <span className="fw-label">Food Type</span>
                            <span className="fw-cat-val">{item.foodType}</span>
                          </div>
                        </div>

                        <div className="fw-detail-list">
                          <div className="fw-list-item">
                            <span className="fw-list-icon">📅</span>
                            <div className="fw-list-text">
                              <span className="fw-label">Received On:</span>
                              <span className="fw-value">{new Date(item.updatedAt).toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div className="fw-list-item eco-impact">
                            <span className="fw-list-icon">🌱</span>
                            <div className="fw-list-text">
                              <span className="fw-label">Carbon Impact:</span>
                              <span className="fw-value highlight">{item.displayCarbon} kg CO₂</span>
                            </div>
                          </div>
                        </div>

                        {item.notes && (
                          <div className="fw-food-notes">
                            <span className="fw-notes-icon">📝</span>
                            <p>{item.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="fw-card-footer">
                        <button
                          className="fw-btn fw-message-btn"
                          onClick={() => navigate(`/food-waste/chat/${item._id}`)}
                        >
                          <span className="fw-btn-icon">💬</span> Message Donor
                        </button>
                      </div>

                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <div className="fw-eco-footer">
          <div className="fw-footer-icon">💚</div>
          <div className="fw-footer-text">
            <h4>Community Impact</h4>
            <p>Every accepted donation directly reduces food waste, lowers greenhouse gas emissions, and strengthens your local community.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MyReceivedFoodPage;
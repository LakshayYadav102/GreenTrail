import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FoodWasteNavbar from "../../components/foodwaste/FoodWasteNavbar"; // Correct Navbar
import api from "../../services/api"; 
import "./MyDonationsPage.css";

function MyDonationsPage() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const calculateCarbon = (quantity, unit) => {
    let kg = quantity;
    if (unit === "grams") kg /= 1000;
    if (unit === "plates") kg *= 0.4;
    return Number((kg * 2.5).toFixed(2));
  };

  const fetchMyDonations = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const res = await api.get("/food-donations/my");

      const fixedDonations = (res.data.donations || []).map(d => ({
        ...d,
        displayCarbon: d.carbonSaved && d.carbonSaved > 0 
          ? d.carbonSaved 
          : calculateCarbon(d.quantity, d.unit)
      }));

      setDonations(fixedDonations);
      setSummary(res.data.summary);
    } catch (error) {
      console.error(error);
      // Removed alert for better UX, could set an error state here instead
    } finally {
      setLoading(false);
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchMyDonations();
    // eslint-disable-next-line
  }, []);

  const getStatusClass = (status) => {
    if (status === "AVAILABLE") return "fw-status-badge available";
    if (status === "ACCEPTED") return "fw-status-badge accepted";
    if (status === "EXPIRED") return "fw-status-badge expired";
    return "fw-status-badge";
  };

  const getCategoryIcon = (category) => {
    if (category === "cooked") return "🍲";
    if (category === "raw") return "🥬";
    if (category === "packaged") return "🥫";
    return "🍽️";
  };

  return (
    <div className="fw-donations-page-wrapper">
      <FoodWasteNavbar />
      
      {/* Background matches the Food Rescue Homepage */}
      <div className="fw-donations-background"></div>

      <div className={`fw-donations-container ${isLoaded ? 'loaded' : ''}`}>
        
        <div className="fw-donations-header">
          <div className="fw-hero-badge">Your Contribution</div>
          <h1>My <span className="fw-gradient-text">Donations</span></h1>
          <p className="fw-subtitle">Track your past donations and measure your direct environmental impact.</p>
        </div>

        {loading ? (
          <div className="fw-loading-state">
            <div className="fw-spinner"></div>
            <p>Loading your impact...</p>
          </div>
        ) : (
          <>
            {summary && (
              <div className="fw-summary-grid">
                <div className="fw-summary-card">
                  <div className="fw-summary-icon">📦</div>
                  <h3>{summary.totalDonations}</h3>
                  <p>Total Donations</p>
                </div>
                <div className="fw-summary-card">
                  <div className="fw-summary-icon">⚖️</div>
                  <h3>{summary.totalFoodDonatedKg} <span className="fw-unit">kg</span></h3>
                  <p>Total Food Donated</p>
                </div>
                <div className="fw-summary-card eco">
                  <div className="fw-summary-icon">🌱</div>
                  <h3>{summary.totalCarbonSaved} <span className="fw-unit">kg CO₂</span></h3>
                  <p>Total Carbon Saved</p>
                </div>
              </div>
            )}

            <div className="fw-donation-list">
              {donations.length === 0 ? (
                <div className="fw-empty-state">
                  <div className="fw-empty-icon">🍲</div>
                  <h2>No Donations Yet</h2>
                  <p>You haven't made any food donations yet. Start sharing surplus food to see your impact here.</p>
                  <button 
                    className="fw-btn fw-primary-btn"
                    onClick={() => navigate("/food-waste/donate")}
                  >
                    Make a Donation →
                  </button>
                </div>
              ) : (
                donations.map((donation, index) => (
                  <div 
                    key={donation._id} 
                    className="fw-donation-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="fw-card-header">
                      <div className="fw-category-badge">
                        <span className="fw-cat-icon">{getCategoryIcon(donation.foodCategory)}</span>
                        {donation.foodCategory.toUpperCase()}
                      </div>
                      <span className={getStatusClass(donation.status)}>
                        {donation.status}
                      </span>
                    </div>

                    <div className="fw-card-body">
                      <div className="fw-detail-row main">
                        <span className="fw-quantity">{donation.quantity} {donation.unit}</span>
                        <span className="fw-type">• {donation.foodType}</span>
                      </div>
                      
                      <div className="fw-detail-row">
                        <span className="fw-label">Expires:</span>
                        <span className="fw-value">{new Date(donation.expiryTime).toLocaleString()}</span>
                      </div>

                      <div className="fw-detail-row eco">
                        <span className="fw-label">Carbon Saved:</span>
                        <span className="fw-value highlight">{donation.displayCarbon} kg CO₂</span>
                      </div>

                      {donation.status === "EXPIRED" && donation.expiredHandling && (
                        <div className="fw-detail-row expired-note">
                          <span className="fw-label">Redirected To:</span>
                          <span className="fw-value">{donation.expiredHandling}</span>
                        </div>
                      )}
                    </div>

                    {donation.status === "ACCEPTED" && donation.acceptedBy && (
                      <div className="fw-card-footer">
                        <button
                          className="fw-btn fw-message-btn"
                          onClick={() => navigate(`/food-waste/chat/${donation._id}`)}
                        >
                          <span className="fw-btn-icon">💬</span> Message Receiver
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyDonationsPage;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FoodWasteNavbar from "../../components/foodwaste/FoodWasteNavbar"; // Correct Navbar
import api from "../../services/api";
import "./AvailableFood.css";

const quotes = [
  "Claim a meal, reduce global waste.",
  "Fresh food available in your community.",
  "Your pickup saves perfectly good food.",
  "Nourish your organization, help the planet.",
  "Be the bridge between surplus and necessity."
];

function AvailableFood() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [availableFood, setAvailableFood] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Typing Effect States
  const [quoteText, setQuoteText] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // GLITCH-FREE TYPING ANIMATION LOGIC
  useEffect(() => {
    let typingTimer;
    
    const handleTyping = () => {
      const fullQuote = quotes[quoteIndex];

      if (!isDeleting) {
        setQuoteText(fullQuote.substring(0, quoteText.length + 1));
        
        if (quoteText === fullQuote) {
          typingTimer = setTimeout(() => setIsDeleting(true), 2000);
        } else {
          typingTimer = setTimeout(handleTyping, 80);
        }
      } else {
        setQuoteText(fullQuote.substring(0, quoteText.length - 1));
        
        if (quoteText === '') {
          setIsDeleting(false);
          setQuoteIndex((prev) => (prev + 1) % quotes.length);
        } else {
          typingTimer = setTimeout(handleTyping, 40);
        }
      }
    };

    typingTimer = setTimeout(handleTyping, isDeleting ? 40 : 80);
    return () => clearTimeout(typingTimer);
  }, [quoteText, isDeleting, quoteIndex]);

  const fetchAvailableFood = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      alert("Please log in to view available food.");
      navigate("/login");
      return;
    }

    try {
      const res = await api.get("/food-donations/available");
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableFood();
    // eslint-disable-next-line
  }, []);

  const handleAcceptFood = async (foodId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to accept food.");
      navigate("/login");
      return;
    }

    try {
      await api.patch(`/food-donations/${foodId}/accept`);
      alert("Food accepted successfully!");
      fetchAvailableFood(); 
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

  // Helper to assign icons based on food type
  const getFoodIcon = (type) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("veg") && !t.includes("non")) return "🥗";
    if (t.includes("non-veg") || t.includes("meat")) return "🍗";
    if (t.includes("mixed")) return "🥘";
    return "🍱";
  };

  return (
    <div className="fw-avail-page-wrapper">
      <FoodWasteNavbar />
      
      {/* Background matches the Food Rescue Homepage */}
      <div className="fw-avail-background"></div>

      <div className={`fw-avail-container ${isLoaded ? 'loaded' : ''}`}>
        
        <div className="fw-avail-header">
          <div className="fw-hero-badge">Live Directory</div>
          <h1>Available <span className="fw-gradient-text-blue">Donations</span></h1>
          
          <div className="fw-animated-quote-container">
            <p className="fw-animated-quote">
              {quoteText}
              <span className="fw-typing-cursor-blue">|</span>
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="fw-error-message">
            <span className="fw-error-icon">⚠️</span>
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="fw-loading-state">
            <div className="fw-spinner-blue"></div>
            <p>Scanning local network for available food...</p>
          </div>
        ) : availableFood.length === 0 ? (
          <div className="fw-empty-state">
            <div className="fw-empty-icon">🍽️</div>
            <h2>No Food Available Right Now</h2>
            <p>There are currently no active donations in your area. Please check back later, or locate nearby NGOs to connect with them directly.</p>
            <button 
              className="fw-btn fw-secondary-btn"
              onClick={() => navigate("/food-waste/ngos")}
            >
              Locate NGOs Instead
            </button>
          </div>
        ) : (
          <div className="fw-avail-grid">
            {availableFood.map((food, index) => (
              <div 
                key={food._id} 
                className="fw-avail-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="fw-card-glow"></div>
                <div className="fw-card-inner">
                  
                  <div className="fw-card-header">
                    <div className="fw-food-type-badge">
                      <span className="fw-badge-icon">{getFoodIcon(food.foodType)}</span>
                      {food.foodType || "Unknown"}
                    </div>
                    {food.donationSource === "EVENT" && (
                      <span className="fw-event-tag">🎊 Event</span>
                    )}
                  </div>

                  <div className="fw-card-body">
                    <div className="fw-donor-info">
                      <span className="fw-label">Donated By:</span>
                      <span className="fw-donor-name">{food.donor?.username || "Anonymous"}</span>
                    </div>

                    <div className="fw-detail-row main-detail">
                      <div className="fw-quantity-box">
                        <span className="fw-qty-val">{food.quantity}</span>
                        <span className="fw-qty-unit">{food.unit}</span>
                      </div>
                      <div className="fw-category-box">
                        <span className="fw-label">Category</span>
                        <span className="fw-cat-val">{food.foodCategory || "N/A"}</span>
                      </div>
                    </div>

                    {food.foodImage && (
  <div className="fw-food-image-wrapper">
    <img
      src={food.foodImage}
      alt="Donated Food"
      className="fw-food-image"
    />
  </div>
)}

                    <div className="fw-detail-list">

                      <div className="fw-list-item">
                        <span className="fw-list-icon">⏳</span>
                        <div className="fw-list-text">
                          <span className="fw-label">Expires:</span>
                          <span className="fw-value alert">{new Date(food.expiryTime).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="fw-list-item">
                        <span className="fw-list-icon">📍</span>
                        <div className="fw-list-text">
                          <span className="fw-label">Location:</span>
                          <span className="fw-value">{food.location || "Not specified"}</span>
                        </div>
                      </div>
                    </div>

                    {food.notes && (
                      <div className="fw-food-notes">
                        <span className="fw-notes-icon">📝</span>
                        <p>{food.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="fw-card-footer">
                    <button
                      className="fw-btn fw-accept-btn"
                      onClick={() => handleAcceptFood(food._id)}
                    >
                      <span className="fw-btn-icon">✓</span> Claim Donation
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        <div className="fw-eco-footer">
          <div className="fw-footer-icon">🔄</div>
          <div className="fw-footer-text">
            <h4>Zero-Waste Guarantee</h4>
            <p>Donations not accepted before their expiry time are automatically redirected to local composting facilities or animal feed networks.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AvailableFood;
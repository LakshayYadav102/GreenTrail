import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FoodWasteNavbar from "../../components/foodwaste/FoodWasteNavbar"; // Correct Navbar
import api from "../../services/api"; 
import "./EventDonationForm.css";

const quotes = [
  "Big events, zero waste.",
  "Turn banquet surplus into a blessing.",
  "Celebrate responsibly, donate abundantly.",
  "Let your celebration feed the community.",
  "Don't let the feast end in the bin."
];

function EventDonationForm() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  const [formData, setFormData] = useState({
    eventType: "",
    eventName: "",
    foodType: "",
    estimatedQuantity: "",
    unit: "plates",
    servingWindowStart: "",
    servingWindowEnd: "",
    location: "",
    contactPerson: "",
    contactNumber: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      alert("Please log in to submit an event donation.");
      navigate("/login");
      return;
    }

    const start = new Date(formData.servingWindowStart);
    const end = new Date(formData.servingWindowEnd);

    if (start >= end) {
      setLoading(false);
      setErrorMsg("Serving end time must be after start time.");
      return;
    }

    try {
      const payload = {
        donationSource: "EVENT",
        eventType: formData.eventType,
        eventName: formData.eventName,
        foodCategory: "cooked", 
        foodType: formData.foodType,
        quantity: Number(formData.estimatedQuantity),
        unit: formData.unit,
        expiryTime: formData.servingWindowEnd, 
        location: formData.location,
        notes: formData.notes,
        contactPerson: formData.contactPerson,
        contactNumber: formData.contactNumber,
      };

      await api.post("/food-donations", payload);

      alert("Event food donation created successfully!");
      
      setTimeout(() => {
        navigate("/food-waste/donate");
      }, 1500);

    } catch (error) {
      console.error("Event Donation Error:", error);
      let message = "Failed to submit event donation. Please try again.";

      if (error.response?.status === 401) {
        message = "Session expired or unauthorized. Please log in again.";
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      } else if (error.response?.status === 400) {
        message = error.response.data.message || "Invalid data provided.";
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().slice(0, 16);

  return (
    <div className="fw-ev-page-wrapper">
      <FoodWasteNavbar />

      {/* Background matches the Food Rescue Homepage */}
      <div className="fw-ev-background"></div>

      <div className={`fw-ev-container ${isLoaded ? 'loaded' : ''}`}>
        
        <div className="fw-ev-header">
          <div className="fw-ev-badge">Bulk / Event Contribution</div>
          <h1>Donate <span className="fw-ev-gradient-text">Event Food</span></h1>
          <div className="fw-ev-animated-quote-container">
            <p className="fw-ev-animated-quote">
              {quoteText}
              <span className="fw-ev-typing-cursor">|</span>
            </p>
          </div>
        </div>

        <div className="fw-ev-form-glass">
          {errorMsg && (
            <div className="fw-ev-error-message">
              <span className="fw-ev-error-icon">⚠️</span>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="fw-ev-form">
            
            {/* Section 1: Event Details */}
            <div className="fw-ev-form-section">
              <h3 className="fw-ev-section-title">🎉 Event Details</h3>
              <div className="fw-ev-form-grid">
                
                <div className="fw-ev-input-group">
                  <label>
                    <span className="fw-ev-label-icon">🏷️</span>
                    Event Type <span className="fw-ev-required">*</span>
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="fw-ev-glass-input"
                  >
                    <option value="" disabled>Select Event Type</option>
                    <option value="marriage">Marriage / Wedding</option>
                    <option value="party">Birthday / Party</option>
                    <option value="religious">Religious Function</option>
                    <option value="corporate">Corporate / Office Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="fw-ev-input-group">
                  <label>
                    <span className="fw-ev-label-icon">📝</span>
                    Event Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleChange}
                    placeholder="e.g., Priya & Rohan Wedding"
                    disabled={loading}
                    className="fw-ev-glass-input"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Food & Timing */}
            <div className="fw-ev-form-section">
              <h3 className="fw-ev-section-title">🍲 Food & Timing</h3>
              <div className="fw-ev-form-grid">
                
                <div className="fw-ev-input-group">
                  <label>
                    <span className="fw-ev-label-icon">🥗</span>
                    Food Type <span className="fw-ev-required">*</span>
                  </label>
                  <select
                    name="foodType"
                    value={formData.foodType}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="fw-ev-glass-input"
                  >
                    <option value="" disabled>Select Food Type</option>
                    <option value="veg">Pure Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="mixed">Mixed (Veg + Non-Veg)</option>
                  </select>
                </div>

                <div className="fw-ev-input-group">
                  <label>
                    <span className="fw-ev-label-icon">⚖️</span>
                    Estimated Quantity <span className="fw-ev-required">*</span>
                  </label>
                  <div className="fw-ev-quantity-row">
                    <input
                      type="number"
                      name="estimatedQuantity"
                      value={formData.estimatedQuantity}
                      onChange={handleChange}
                      placeholder="e.g., 50"
                      required
                      disabled={loading}
                      min="1"
                      step="1"
                      className="fw-ev-glass-input"
                    />
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      disabled={loading}
                      className="fw-ev-glass-input fw-ev-unit-select"
                    >
                      <option value="plates">Plates</option>
                      <option value="kg">Kg</option>
                    </select>
                  </div>
                </div>

                <div className="fw-ev-input-group">
                  <label>
                    <span className="fw-ev-label-icon">⏳</span>
                    Pickup Start Time <span className="fw-ev-required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="servingWindowStart"
                    value={formData.servingWindowStart}
                    onChange={handleChange}
                    min={minDate}
                    required
                    disabled={loading}
                    className="fw-ev-glass-input"
                  />
                </div>

                <div className="fw-ev-input-group">
                  <label>
                    <span className="fw-ev-label-icon">⌛</span>
                    Pickup End Time <span className="fw-ev-required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="servingWindowEnd"
                    value={formData.servingWindowEnd}
                    onChange={handleChange}
                    min={formData.servingWindowStart || minDate}
                    required
                    disabled={loading}
                    className="fw-ev-glass-input"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Logistics */}
            <div className="fw-ev-form-section">
              <h3 className="fw-ev-section-title">📍 Logistics & Contact</h3>
              
              <div className="fw-ev-form-grid">
                <div className="fw-ev-input-group fw-ev-full-width">
                  <label>
                    <span className="fw-ev-label-icon">📍</span>
                    Event Location <span className="fw-ev-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Full venue address (with landmark if possible)"
                    required
                    disabled={loading}
                    className="fw-ev-glass-input"
                  />
                </div>

                <div className="fw-ev-input-group">
                  <label>
                    <span className="fw-ev-label-icon">👤</span>
                    Contact Person <span className="fw-ev-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="Name of organizer"
                    required
                    disabled={loading}
                    className="fw-ev-glass-input"
                  />
                </div>

                <div className="fw-ev-input-group">
                  <label>
                    <span className="fw-ev-label-icon">📞</span>
                    Contact Number <span className="fw-ev-required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    pattern="[0-9]{10}"
                    title="Please enter 10-digit mobile number"
                    required
                    disabled={loading}
                    className="fw-ev-glass-input"
                  />
                </div>

                <div className="fw-ev-input-group fw-ev-full-width">
                  <label>
                    <span className="fw-ev-label-icon">📝</span>
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions for NGO pickup..."
                    disabled={loading}
                    className="fw-ev-glass-input fw-ev-textarea"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="fw-ev-form-actions">
              <button 
                type="button" 
                onClick={() => navigate("/food-waste/donate")}
                className="fw-ev-action-btn secondary"
                disabled={loading}
              >
                ← Back
              </button>
              
              <button 
                type="submit" 
                className={`fw-ev-submit-btn ${loading ? 'loading' : ''}`} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="fw-ev-btn-spinner"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Event Donation →'
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default EventDonationForm;
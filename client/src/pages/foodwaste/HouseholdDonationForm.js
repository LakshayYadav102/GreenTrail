import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FoodWasteNavbar from "../../components/foodwaste/FoodWasteNavbar";
import api from "../../services/api";
import "./HouseholdDonationForm.css";

const quotes = [
  "Small portions, massive impact.",
  "Every meal saved is a step toward zero-waste.",
  "Share your leftovers, nourish a neighbor.",
  "Don't let good food go bad.",
  "Your kitchen can be a source of hope."
];

function HouseholdDonationForm() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  const [formData, setFormData] = useState({
    foodCategory: "",
    foodType: "",
    quantity: "",
    unit: "kg",
    expiryTime: "",
    location: "",
    notes: "",
  });

  // NEW STATE FOR IMAGE
  const [proofImage, setProofImage] = useState(null);

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

        if (quoteText === "") {
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

    if (!proofImage) {
      setErrorMsg("Please upload a proof image.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      alert("Please log in to submit donation.");
      navigate("/login");
      return;
    }

    try {
      // CREATE MULTIPART FORMDATA
      const payload = new FormData();

      payload.append("donationSource", "HOUSEHOLD");
      payload.append("foodCategory", formData.foodCategory);
      payload.append("foodType", formData.foodType);
      payload.append("quantity", Number(formData.quantity));
      payload.append("unit", formData.unit);
      payload.append("expiryTime", formData.expiryTime);
      payload.append("location", formData.location);
      payload.append("notes", formData.notes);

      // IMAGE FIELD
      payload.append("foodImage", proofImage);

      await api.post("/food-donations", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Donation submitted successfully!");
      navigate("/food-waste/donate");

      // RESET FORM
      setFormData({
        foodCategory: "",
        foodType: "",
        quantity: "",
        unit: "kg",
        expiryTime: "",
        location: "",
        notes: "",
      });

      setProofImage(null);

    } catch (error) {
      console.error("Error:", error);

      let message = "Failed to submit donation.";

      if (error.response?.status === 401) {
        message = "Session expired. Please log in.";
        localStorage.removeItem("token");

        setTimeout(() => navigate("/login"), 1500);

      } else if (error.response?.status === 400) {
        message = error.response.data.message || message;
      }

      setErrorMsg(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fw-hh-page-wrapper">
      <FoodWasteNavbar />

      {/* Background matches the Food Rescue Homepage */}
      <div className="fw-hh-background"></div>

      <div className={`fw-hh-container ${isLoaded ? "loaded" : ""}`}>

        <div className="fw-hh-header">
          <div className="fw-hh-badge">Household Contribution</div>

          <h1>
            Donate <span className="fw-gradient-text">From Home</span>
          </h1>

          <div className="fw-animated-quote-container">
            <p className="fw-animated-quote">
              {quoteText}
              <span className="fw-typing-cursor">|</span>
            </p>
          </div>
        </div>

        <div className="fw-hh-form-glass">

          {errorMsg && (
            <div className="fw-error-message">
              <span className="fw-error-icon">⚠️</span>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="fw-hh-form">

            <div className="fw-form-section">
              <h3 className="fw-section-title">🍲 Food Details</h3>

              <div className="fw-form-grid">

                <div className="fw-input-group">
                  <label>
                    <span className="fw-label-icon">📂</span>
                    Food Category
                  </label>

                  <select
                    name="foodCategory"
                    value={formData.foodCategory}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="fw-glass-input"
                  >
                    <option value="" disabled>Select Category</option>
                    <option value="cooked">Cooked Food</option>
                    <option value="raw">Raw Ingredients</option>
                    <option value="packaged">Packaged Food</option>
                  </select>
                </div>

                <div className="fw-input-group">
                  <label>
                    <span className="fw-label-icon">🥗</span>
                    Food Type
                  </label>

                  <select
                    name="foodType"
                    value={formData.foodType}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="fw-glass-input"
                  >
                    <option value="" disabled>Select Type</option>
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div className="fw-input-group">
                  <label>
                    <span className="fw-label-icon">⚖️</span>
                    Quantity
                  </label>

                  <div className="fw-quantity-row">

                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="e.g., 2.5"
                      required
                      disabled={loading}
                      min="0.1"
                      step="0.1"
                      className="fw-glass-input"
                    />

                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      disabled={loading}
                      className="fw-glass-input fw-unit-select"
                    >
                      <option value="kg">Kg</option>
                      <option value="grams">Grams</option>
                      <option value="plates">Plates</option>
                    </select>

                  </div>
                </div>

                <div className="fw-input-group">
                  <label>
                    <span className="fw-label-icon">⏳</span>
                    Expiry Date & Time
                  </label>

                  <input
                    type="datetime-local"
                    name="expiryTime"
                    value={formData.expiryTime}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="fw-glass-input"
                  />
                </div>

              </div>
            </div>

            <div className="fw-form-section">
              <h3 className="fw-section-title">📍 Logistics & Notes</h3>

              <div className="fw-form-grid">

                <div className="fw-input-group fw-full-width">
                  <label>
                    <span className="fw-label-icon">📍</span>
                    Pickup Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter full pickup address"
                    required
                    disabled={loading}
                    className="fw-glass-input"
                  />
                </div>

                <div className="fw-input-group fw-full-width">
                  <label>
                    <span className="fw-label-icon">📝</span>
                    Additional Notes (Optional)
                  </label>

                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions for pickup, packaging details, or allergens..."
                    disabled={loading}
                    className="fw-glass-input fw-textarea"
                    rows="4"
                  />
                </div>

                {/* NEW IMAGE UPLOAD SECTION */}
                <div className="fw-input-group fw-full-width">
                  <label>
                    <span className="fw-label-icon">📸</span>
                    Upload Proof of Donation
                  </label>

                  <p className="text-white-50 small">
                    Upload an image of the food package (with expiry date)
                    or the prepared meal. This is required for your ICT reward.
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofImage(e.target.files[0])}
                    required
                    disabled={loading}
                    className="fw-glass-input"
                  />
                </div>

              </div>
            </div>

            <div className="fw-form-actions">

              <button
                type="button"
                onClick={() => navigate("/food-waste/donate")}
                className="fw-action-btn secondary"
                disabled={loading}
              >
                ← Back
              </button>

              <button
                type="submit"
                className={`fw-submit-btn ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="fw-btn-spinner"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit Household Donation →"
                )}
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default HouseholdDonationForm;
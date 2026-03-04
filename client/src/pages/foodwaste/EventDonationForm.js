import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GreenverseNavbar from "../../components/GreenverseNavbar";
import api from "../../services/api";
import "./EventDonationForm.css";

function EventDonationForm() {
  const navigate = useNavigate();

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

    // Basic client-side validation
    const start = new Date(formData.servingWindowStart);
    const end = new Date(formData.servingWindowEnd);

    if (start >= end) {
      setLoading(false);
      setErrorMsg("Serving end time must be after start time.");
      alert("Serving end time must be after start time.");
      return;
    }

    try {
      const payload = {
        donationSource: "EVENT",
        eventType: formData.eventType,
        eventName: formData.eventName,
        foodCategory: "cooked", // fixed for events
        foodType: formData.foodType,
        quantity: Number(formData.estimatedQuantity),
        unit: formData.unit,
        expiryTime: formData.servingWindowEnd, // logical expiry
        location: formData.location,
        notes: formData.notes,
        // Now sending contact info (model supports it)
        contactPerson: formData.contactPerson,
        contactNumber: formData.contactNumber,
      };

      await api.post("/food-donations", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Event food donation created successfully!");
      
      // Small delay before redirect for user to see success
      setTimeout(() => {
        navigate("/food-waste/donate");
      }, 1500);

      // Reset form
      setFormData({
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
    } catch (error) {
      console.error("Event Donation Error:", error);

      let message = "Failed to submit event donation. Please try again.";

      if (error.response?.status === 401) {
        message = "Session expired or unauthorized. Please log in again.";
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      } else if (error.response?.status === 400) {
        message = error.response.data.message || "Invalid data provided.";
      } else if (error.response) {
        message = error.response.data?.message || "Server error occurred.";
      } else if (error.request) {
        message = "Cannot connect to server. Check your internet connection.";
      }

      setErrorMsg(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // Prevent selecting past dates
  const minDate = new Date().toISOString().slice(0, 16);

  return (
    <>
      <GreenverseNavbar />

      <div className="event-donation-form-container">
        <h1>Event / Function Food Donation</h1>
        <p>
          Donate surplus food from marriages, parties, or large gatherings to
          reduce waste and help the community.
        </p>

        {errorMsg && (
          <div className="error-message">{errorMsg}</div>
        )}

        <form className="event-donation-form" onSubmit={handleSubmit}>
          {/* Event Type */}
          <label>Event Type <span className="required">*</span></label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select Event Type</option>
            <option value="marriage">Marriage / Wedding</option>
            <option value="party">Birthday / Party</option>
            <option value="religious">Religious Function</option>
            <option value="corporate">Corporate / Office Event</option>
            <option value="other">Other</option>
          </select>

          {/* Event Name */}
          <label>Event Name (Optional)</label>
          <input
            type="text"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
            placeholder="e.g., Priya & Rohan Wedding Reception"
            disabled={loading}
          />

          {/* Food Type */}
          <label>Food Type <span className="required">*</span></label>
          <select
            name="foodType"
            value={formData.foodType}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select Food Type</option>
            <option value="veg">Pure Vegetarian</option>
            <option value="non-veg">Non-Vegetarian</option>
            <option value="mixed">Mixed (Veg + Non-Veg)</option>
          </select>

          {/* Quantity */}
          <label>Estimated Quantity <span className="required">*</span></label>
          <div className="quantity-row">
            <input
              type="number"
              name="estimatedQuantity"
              value={formData.estimatedQuantity}
              onChange={handleChange}
              placeholder="Approx quantity"
              required
              disabled={loading}
              min="1"
              step="1"
            />
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="plates">Plates</option>
              <option value="kg">Kg</option>
            </select>
          </div>

          {/* Serving Window */}
          <label>Serving / Pickup Window <span className="required">*</span></label>
          <div className="time-row">
            <input
              type="datetime-local"
              name="servingWindowStart"
              value={formData.servingWindowStart}
              onChange={handleChange}
              min={minDate}
              required
              disabled={loading}
            />
            <input
              type="datetime-local"
              name="servingWindowEnd"
              value={formData.servingWindowEnd}
              onChange={handleChange}
              min={formData.servingWindowStart || minDate}
              required
              disabled={loading}
            />
          </div>

          {/* Location */}
          <label>Event Location <span className="required">*</span></label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Full venue address (with landmark if possible)"
            required
            disabled={loading}
          />

          {/* Contact */}
          <label>Contact Person <span className="required">*</span></label>
          <input
            type="text"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            placeholder="Name of coordinator / organizer"
            required
            disabled={loading}
          />

          <label>Contact Number <span className="required">*</span></label>
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
          />

          {/* Notes */}
          <label>Additional Notes (Optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any special instructions, allergies, packaging details, etc..."
            disabled={loading}
          />

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Event Donation"}
          </button>
        </form>
      </div>
    </>
  );
}

export default EventDonationForm;
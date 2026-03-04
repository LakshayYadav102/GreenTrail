import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GreenverseNavbar from "../../components/GreenverseNavbar";
import api from "../../services/api"; // Centralized API
import "./HouseholdDonationForm.css";

function HouseholdDonationForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    foodCategory: "",
    foodType: "",
    quantity: "",
    unit: "kg",
    expiryTime: "",
    location: "",
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
      alert("Please log in to submit donation.");
      navigate("/login");
      return;
    }

    try {
      const payload = {
        donationSource: "HOUSEHOLD",
        foodCategory: formData.foodCategory,
        foodType: formData.foodType,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        expiryTime: formData.expiryTime,
        location: formData.location,
        notes: formData.notes,
      };

      // CLEANED FOR HOSTING: Removed manual headers
      await api.post("/food-donations", payload);

      alert("Donation submitted successfully!");
      navigate("/food-waste/donate");

      setFormData({
        foodCategory: "",
        foodType: "",
        quantity: "",
        unit: "kg",
        expiryTime: "",
        location: "",
        notes: "",
      });
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
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GreenverseNavbar />
      <div className="household-donation-form-container">
        <h1>Household Food Donation</h1>
        <p>Donate surplus food from your home before it goes to waste.</p>

        {errorMsg && <div className="error-message">{errorMsg}</div>}

        <form className="household-donation-form" onSubmit={handleSubmit}>
          <label>Food Category</label>
          <select
            name="foodCategory"
            value={formData.foodCategory}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select Category</option>
            <option value="cooked">Cooked Food</option>
            <option value="raw">Raw Ingredients</option>
            <option value="packaged">Packaged Food</option>
          </select>

          <label>Food Type</label>
          <select
            name="foodType"
            value={formData.foodType}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select Type</option>
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-Vegetarian</option>
            <option value="mixed">Mixed</option>
          </select>

          <label>Quantity</label>
          <div className="quantity-row">
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
              required
              disabled={loading}
              min="0.1"
              step="0.1"
            />
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="kg">Kg</option>
              <option value="grams">Grams</option>
              <option value="plates">Plates</option>
            </select>
          </div>

          <label>Expiry Date & Time</label>
          <input
            type="datetime-local"
            name="expiryTime"
            value={formData.expiryTime}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <label>Pickup Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter full address"
            required
            disabled={loading}
          />

          <label>Additional Notes (Optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any special instructions, allergies, etc..."
            disabled={loading}
          />

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit Donation"}
          </button>
        </form>
      </div>
    </>
  );
}

export default HouseholdDonationForm;
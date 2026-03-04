import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./FoodWasteProfilePage.css";

function FoodWasteProfilePage() {
  const [user, setUser] = useState(null);
  const [donationSummary, setDonationSummary] = useState(null);
  const [receivedSummary, setReceivedSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const [donationRes, receivedRes] = await Promise.all([
        api.get("/food-donations/my", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/food-donations/received", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Extract user info returned from the updated /my endpoint
      setUser(donationRes.data.user);
      setDonationSummary(donationRes.data.summary);
      setReceivedSummary(receivedRes.data.summary);
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      alert("Failed to load food profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="profile-loading">
      <div className="spinner"></div>
      <p>Loading your impact...</p>
    </div>
  );

  const totalCarbonImpact =
    (donationSummary?.totalCarbonSaved || 0) +
    (receivedSummary?.totalCarbonImpact || 0);

  // Determine a fun "Eco Title" based on donations
  let ecoTitle = "Food Saver";
  if (donationSummary?.totalFoodDonatedKg > 50) ecoTitle = "Zero Waste Hero 🌍";
  else if (donationSummary?.totalFoodDonatedKg > 20) ecoTitle = "Hunger Fighter 🦸‍♂️";
  else if (donationSummary?.totalFoodDonatedKg > 5) ecoTitle = "Community Feeder 🍲";

  return (
    <div className="food-profile-page">
      
      {/* NEW PROFILE HEADER */}
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.profilePic ? (
            <img src={user.profilePic} alt="Profile" />
          ) : (
            <div className="avatar-placeholder">
              {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h2>{user?.username || "Eco Warrior"}</h2>
          <p className="user-email">{user?.email || "No email provided"}</p>
          <span className="eco-badge">{ecoTitle}</span>
        </div>
      </div>

      <div className="impact-section-title">
        <h3>Your Lifetime Impact</h3>
        <p>See how your actions are saving food and the planet.</p>
      </div>

      {/* UPGRADED STAT CARDS */}
      <div className="profile-cards">
        <div className="profile-card donate">
          <div className="card-icon">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
            </svg>
          </div>
          <h3>Total Donated</h3>
          <p>{donationSummary?.totalFoodDonatedKg || 0} kg</p>
          <small>{donationSummary?.totalDonations || 0} individual donations</small>
        </div>

        <div className="profile-card receive">
          <div className="card-icon">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3>Food Rescued</h3>
          <p>{receivedSummary?.totalFoodReceivedKg || 0} kg</p>
          <small>{receivedSummary?.totalReceived || 0} claims accepted</small>
        </div>

        <div className="profile-card carbon">
          <div className="card-icon">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3>Carbon Offset</h3>
          <p>{totalCarbonImpact.toFixed(2)} kg CO₂</p>
          <small>Greenhouse gases prevented</small>
        </div>
      </div>
    </div>
  );
}

export default FoodWasteProfilePage;
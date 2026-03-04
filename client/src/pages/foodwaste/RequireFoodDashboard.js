import React from "react";
import { useNavigate } from "react-router-dom";
import GreenverseNavbar from "../../components/foodwaste/FoodWasteNavbar";
import "./RequireFoodDashboard.css";

function RequireFoodDashboard() {
  const navigate = useNavigate();

  return (
    <>
      <GreenverseNavbar />
      <div className="require-food-dashboard">
        <div className="require-header">
          <h1>Require Food</h1>
          <p>
            Find available surplus food or connect with NGOs for support.
          </p>
        </div>

        <div className="require-options">
          <div className="require-option-card available">
            <div className="option-icon">🍽️</div>
            <h2>Available Food</h2>
            <p>Browse current donations ready for pickup or delivery.</p>
            <ul>
              <li>Household & event surplus</li>
              <li>Time-sensitive availability</li>
              <li>Verified listings</li>
            </ul>
            <button 
              className="require-btn"
              onClick={() => navigate("/food-waste/available")}
            >
              View Available Food
            </button>
          </div>

          <div className="require-option-card ngo">
            <div className="option-icon">📍</div>
            <h2>Nearby NGOs & Community Kitchens</h2>
            <p>Find trusted organizations that provide food support.</p>
            <ul>
              <li>Community kitchens</li>
              <li>Charity food centers</li>
              <li>Local shelters</li>
            </ul>
            <button
              className="require-btn"
              onClick={() => navigate("/food-waste/ngos")}
            >
              Locate NGOs
            </button>
          </div>

          <div className="require-option-card history">
            <div className="option-icon">📜</div>
            <h2>My Received Food</h2>
            <p>Track food you’ve received and view your impact.</p>
            <ul>
              <li>Past accepted donations</li>
              <li>Carbon impact tracking</li>
              <li>Request from same donor again</li>
            </ul>
            <button
              className="require-btn"
              onClick={() => navigate("/food-waste/received")}
            >
              View History
            </button>
          </div>
        </div>

        <div className="require-info-note">
          <p>
            All food coordination is handled through verified partners for safety and transparency.
          </p>
        </div>
      </div>
    </>
  );
}

export default RequireFoodDashboard;
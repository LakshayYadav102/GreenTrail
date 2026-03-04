import React from "react";
import { useNavigate } from "react-router-dom";
import GreenverseNavbar from "../../components/foodwaste/FoodWasteNavbar";
import "./DonateFoodDashboard.css";

function DonateFoodDashboard() {
  const navigate = useNavigate();

  return (
    <>
      <GreenverseNavbar />
      <div className="donate-food-dashboard">
        <div className="donate-header">
          <h1>Donate Food</h1>
          <p>
            Help reduce food waste by donating surplus food from your home or large events.
          </p>
        </div>

        <div className="donate-options">
          <div className="donate-option-card household">
            <div className="option-icon">🏠</div>
            <h2>Household Donation</h2>
            <p>Donate leftover food from your home before it spoils.</p>
            <ul>
              <li>Cooked or raw food</li>
              <li>Packaged items</li>
              <li>Daily surplus</li>
            </ul>
            <button 
              className="donate-btn"
              onClick={() => navigate("/food-waste/donate/household")}
            >
              Donate from Home
            </button>
          </div>

          <div className="donate-option-card event">
            <div className="option-icon">🎉</div>
            <h2>Event / Marriage Donation</h2>
            <p>Donate bulk surplus from functions, weddings, parties.</p>
            <ul>
              <li>Large quantities</li>
              <li>Time-sensitive</li>
              <li>High community impact</li>
            </ul>
            <button 
              className="donate-btn"
              onClick={() => navigate("/food-waste/donate/event")}
            >
              Donate Event Food
            </button>
          </div>

          <div className="donate-option-card status">
            <div className="option-icon">📊</div>
            <h2>My Donation Status</h2>
            <p>Track your past donations and see your environmental impact.</p>
            <ul>
              <li>View accepted & expired donations</li>
              <li>See total carbon saved</li>
              <li>Monitor your food impact</li>
            </ul>
            <button
              className="donate-btn"
              onClick={() => navigate("/food-waste/my-donations")}
            >
              View My Donations
            </button>
          </div>

          <div className="donate-option-card ngo">
            <div className="option-icon">📍</div>
            <h2>Donate Directly to NGO</h2>
            <p>
              Find nearby NGOs and community kitchens to donate food directly.
            </p>
            <ul>
              <li>Verified community centers</li>
              <li>Local shelters & kitchens</li>
              <li>Direct coordination</li>
            </ul>
            <button
              className="donate-btn"
              onClick={() => navigate("/food-waste/ngos")}
            >
              Find NGOs Near Me
            </button>
          </div>
        </div>

        <div className="donate-info-note">
          <p>
            Food not accepted before expiry will be redirected responsibly for composting or animal feed.
          </p>
        </div>
      </div>
    </>
  );
}

export default DonateFoodDashboard;
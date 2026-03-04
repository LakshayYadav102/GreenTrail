import React from "react";
import { useNavigate } from "react-router-dom";
import FoodWasteNavbar from "../../components/foodwaste/FoodWasteNavbar";
import "./FoodWasteHomePage.css";

function FoodWasteHomePage() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <>
      <FoodWasteNavbar />

      <div className="food-waste-landing">
        <div className="hero">
          <h1>Food Waste Rescue</h1>
          <p>Connect surplus food with those in need — before it becomes waste.</p>
        </div>

        <div className="cards">
          <div className="card donate">
            <div className="icon">🍲</div>
            <h2>Donate Food</h2>
            <p>Share extra food from home or events.</p>
            <button 
              onClick={() => navigate(isLoggedIn ? "/food-waste/donate" : "/login")}
            >
              Donate Now
            </button>
          </div>

          <div className="card receive">
            <div className="icon">🤝</div>
            <h2>Need Food?</h2>
            <p>Find available donations nearby.</p>
            <button 
              onClick={() => navigate(isLoggedIn ? "/food-waste/require" : "/login")}
            >
              Find Food
            </button>
          </div>
        </div>

        <div className="eco-footer">
          <p>Unclaimed food is responsibly redirected to composting or animal feed.</p>
        </div>
      </div>
    </>
  );
}

export default FoodWasteHomePage;
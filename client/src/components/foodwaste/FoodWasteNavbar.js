import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./FoodWasteNavbar.css";

function FoodWasteNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <nav className="food-navbar">
      <div 
        className={`nav-item ${isActive("/food-waste") || isActive("/food-waste/")}`}
        onClick={() => navigate("/food-waste")}
      >
        Home
      </div>
      <div 
        className={`nav-item ${isActive("/food-waste/donate")}`}
        onClick={() => navigate("/food-waste/donate")}
      >
        Donate
      </div>
      <div 
        className={`nav-item ${isActive("/food-waste/require") || isActive("/food-waste/available") || isActive("/food-waste/received")}`}
        onClick={() => navigate("/food-waste/require")}
      >
        Need Food
      </div>
      <div 
        className={`nav-item ${isActive("/food-waste/my-donations")}`}
        onClick={() => navigate("/food-waste/my-donations")}
      >
        My Donations
      </div>
      <div 
        className={`nav-item ${isActive("/food-waste/profile")}`}
        onClick={() => navigate("/food-waste/profile")}
      >
        Profile
      </div>
    </nav>
  );
}

export default FoodWasteNavbar;
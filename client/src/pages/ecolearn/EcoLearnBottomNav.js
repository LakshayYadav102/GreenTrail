import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./EcoLearnBottomNav.css";

function EcoLearnBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Determine which tab is currently active
  const isFeed = location.pathname.includes("/feed");
  const isExplore = location.pathname.includes("/explore");
  const isProfile = location.pathname.includes("/creator/");

  const handleProfileClick = () => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.userId) {
          navigate(`/ecolearn/creator/${payload.userId}`);
        }
      } catch (e) {
        console.error("Token decoding failed", e);
        alert("Session invalid. Please log in again.");
      }
    } else {
      alert("Please log in to view your profile");
    }
  };

  return (
    <nav className="eco-bottom-nav">
      <button 
        className={`eco-nav-btn ${isFeed ? "eco-active" : ""}`} 
        onClick={() => navigate("/ecolearn/feed")}
      >
        <span className="eco-icon">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </span>
        <span>Home</span>
      </button>

      <button 
        className={`eco-nav-btn ${isExplore ? "eco-active" : ""}`} 
        onClick={() => navigate("/ecolearn/explore")}
      >
        <span className="eco-icon">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <span>Explore</span>
      </button>

      {/* Highlighted Upload Button */}
      <div className="eco-nav-upload-wrapper">
        <button 
          className="eco-upload-btn" 
          onClick={() => navigate("/ecolearn/upload")}
        >
          <span className="eco-icon">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </span>
        </button>
      </div>

      <button 
        className={`eco-nav-btn ${isProfile ? "eco-active" : ""}`} 
        onClick={handleProfileClick}
      >
        <span className="eco-icon">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </span>
        <span>Profile</span>
      </button>
    </nav>
  );
}

export default EcoLearnBottomNav;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardCarpool.css";

function DashboardCarpool() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeHover, setActiveHover] = useState(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const buttons = [
    {
      id: "offer",
      label: "Offer a Ride",
      path: "/ride/offer",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      icon: "🚗",
      description: "Share your journey and save costs"
    },
    {
      id: "find",
      label: "Find a Ride",
      path: "/ride/find",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      icon: "🔍",
      description: "Join others going your way"
    },
    {
      id: "ev",
      label: "EV Charging Stations",
      path: "/ev-stations",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      icon: "⚡",
      description: "Locate charging points nearby"
    },
    {
      id: "mytrips",
      label: "My Trips",
      path: "/my-trips",
      color: "linear-gradient(135deg, #ffd452 0%, #ff9500 100%)",
      icon: "📅",
      description: "View your offered and booked rides"
    },
    {
      id: "request",
      label: "Request a Ride",
      path: "/ride/request",
      color: "linear-gradient(135deg, #34e89e 0%, #0f3443 100%)",
      icon: "🙋",
      description: "Post a request for drivers to find you"
    }
  ];

  return (
    <>
      {/* NO NAVBAR HERE. App.js renders it dynamically! */}
      
      {/* Animated Background Elements */}
      <div className="animated-background">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>

      <div className={`carpool-dashboard-container ${isLoaded ? 'loaded' : ''}`}>
        <div className="dashboard-glass">
          {/* Header Section */}
          <div className="dashboard-header">
            <div className="title-wrapper">
              <h1 className="main-title">
                <span className="title-gradient">🚗 Carpooling Hub</span>
                <div className="title-underline"></div>
              </h1>
              <p className="subtitle">
                Share rides, find rides, and explore EV charging stations nearby
                <span className="typing-cursor">|</span>
              </p>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="carpool-actions-grid">
            {buttons.map((button, index) => (
              <div
                key={button.id}
                className={`action-card ${activeHover === button.id ? 'active' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setActiveHover(button.id)}
                onMouseLeave={() => setActiveHover(null)}
              >
                <div 
                  className="card-background"
                  style={{ background: button.color }}
                ></div>
                
                <div className="card-content">
                  <div className="card-icon">{button.icon}</div>
                  <h3 className="card-title">{button.label}</h3>
                  <p className="card-description">{button.description}</p>
                  
                  <button
                    onClick={() => navigate(button.path)}
                    className="card-button"
                  >
                    <span className="button-text">Get Started</span>
                    <div className="button-arrow">→</div>
                  </button>
                </div>

                {/* Hover Effect Elements */}
                <div className="card-glow"></div>
                <div className="card-particles">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="particle"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardCarpool;
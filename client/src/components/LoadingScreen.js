import React from "react";
import "./LoadingScreen.css"; // Ensure you create this CSS file

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="leaves">
        <span className="leaf"></span>
        <span className="leaf"></span>
        <span className="leaf"></span>
      </div>
      <h1 className="loading-text">GreenTrail</h1>
      <p className="sub-text">Calculating Your Carbon Footprint...</p>
    </div>
  );
};

export default LoadingScreen;

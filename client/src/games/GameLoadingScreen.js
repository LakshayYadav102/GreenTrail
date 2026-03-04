import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GameLoadingScreen.css"; 

const GameLoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => navigate("/games"), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="gt-loading-wrapper">
      <div className="gt-scanner"></div>
      <div className="gt-loading-content">
        <div className="gt-logo-glitch" data-text="GREENTRAIL">GREENTRAIL</div>
        <div className="gt-arcade-title">ARCADE SUBSYSTEM</div>
        
        <div className="gt-progress-container">
          <div className="gt-progress-bar" style={{ width: `${progress}%` }}></div>
          <div className="gt-progress-glow" style={{ width: `${progress}%` }}></div>
        </div>
        
        <div className="gt-status-text">
          {progress < 40 ? "CONNECTING TO ECO-SERVER..." : 
           progress < 80 ? "INITIALIZING SUSTAINABILITY ENGINE..." : "SYNCING PLAYER DATA..."}
          <span className="gt-percent">{progress}%</span>
        </div>
      </div>
      
      <div className="gt-grid-bg"></div>
    </div>
  );
};

export default GameLoadingScreen;
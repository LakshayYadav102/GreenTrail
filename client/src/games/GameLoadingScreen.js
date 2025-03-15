import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GameLoadingScreen.css"; 

const GameLoadingScreen = () => {
  const [dots, setDots] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);

    // Redirect to the Fun Games page after 3 seconds
    const timer = setTimeout(() => {
      navigate("/games");
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(dotInterval);
    };
  }, [navigate]);

  return (
    <div className="game-loading-screen">
      <h2>🎮 GreenTrail Fun Hub</h2>
      <p>Loading games{dots}</p>
      <div className="game-spinner"></div>
    </div>
  );
};

export default GameLoadingScreen;

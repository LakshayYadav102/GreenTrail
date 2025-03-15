import React from "react";
import { useNavigate } from "react-router-dom";
import "./FunGamesPage.css";

const FunGamesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="games-page">
      <h2>🎮 Fun Games Hub</h2>
      <p>Choose a game and have fun while learning about sustainability!</p>

      <div className="games-container">
        <div className="game-card" onClick={() => navigate("/games/recycle-rush")}>
          <h3>♻️ Recycle Rush</h3>
          <p>Sort waste into the correct bins!</p>
        </div>

        <div className="game-card" onClick={() => navigate("/games/eco-quiz")}>
          <h3>🌱 Eco Quiz Challenge</h3>
          <p>Test your sustainability knowledge!</p>
        </div>

        <div className="game-card" onClick={() => navigate("/games/eco-runner")}>
          <h3>🏃‍♂️ Eco Runner</h3>
          <p>Avoid pollution, collect green items!</p>
        </div>

        <div className="game-card">
          <h3>🌎 More Games Coming Soon...</h3>
          <p>Stay tuned for more interactive fun!</p>
        </div>
      </div>
    </div>
  );
};

export default FunGamesPage;

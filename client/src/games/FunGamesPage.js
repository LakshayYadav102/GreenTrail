import React from "react";
import { useNavigate } from "react-router-dom";
import "./FunGamesPage.css";

const games = [
  { id: 'recycle', title: 'Recycle Rush', desc: 'Precision sorting challenge', path: '/games/recycle-rush', icon: '♻️', color: '#00ff88' },
  { id: 'quiz', title: 'Eco Master', desc: 'Test your green IQ', path: '/games/eco-quiz', icon: '🌱', color: '#00d1ff' },
  { id: 'runner', title: 'Eco Runner', desc: 'Infinite sustainability race', path: '/games/eco-runner', icon: '🏃‍♂️', color: '#ff0055' }
];

const FunGamesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="gt-hub-wrapper">
      <div className="gt-hub-container">
        <header className="gt-hub-header">
          <div className="gt-hub-badge">ARCADE MODE</div>
          <h1>CHOOSE YOUR <span className="gt-highlight">MISSION</span></h1>
        </header>

        <div className="gt-games-grid">
          {games.map((game) => (
            <div 
              key={game.id} 
              className="gt-game-card-premium" 
              onClick={() => navigate(game.path)}
              style={{"--game-color": game.color}}
            >
              <div className="gt-card-glow"></div>
              <div className="gt-card-inner">
                <div className="gt-game-icon">{game.icon}</div>
                <h3>{game.title}</h3>
                <p>{game.desc}</p>
                <div className="gt-play-btn">START MISSION</div>
              </div>
            </div>
          ))}
          
          <div className="gt-game-card-premium disabled">
             <div className="gt-card-inner">
                <div className="gt-game-icon">🔒</div>
                <h3>Ocean Cleanup</h3>
                <p>Coming in next update</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunGamesPage;
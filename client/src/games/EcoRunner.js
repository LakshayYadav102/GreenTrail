import React, { useState, useEffect, useRef, useCallback } from "react";
import { Howl } from "howler";
import { useNavigate } from "react-router-dom";
import "./EcoRunner.css";

const sounds = {
  collect: new Howl({ src: ["/sounds/collect.mp3"], html5: true }),
  hit: new Howl({ src: ["/sounds/hit.mp3"], html5: true }),
  bgm: new Howl({
    src: ["/sounds/background.mp3"],
    loop: true,
    volume: 0.3,
    html5: true
  }),
};

const EcoRunner = () => {
  const [playerPos, setPlayerPos] = useState(50);
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [particles, setParticles] = useState([]);
  const gameAreaRef = useRef(null);
  const navigate = useNavigate();

  // Game constants
  const PLAYER_HEIGHT = 60;
  const ITEM_SIZE = 40;

  useEffect(() => {
    sounds.bgm.play();
    return () => sounds.bgm.stop();
  }, []);

  // Keyboard controls
  const moveLeft = useCallback(() => {
    if (!gameOver) setPlayerPos((prev) => Math.max(0, prev - 5));
  }, [gameOver]);

  const moveRight = useCallback(() => {
    if (!gameOver) setPlayerPos((prev) => Math.min(95, prev + 5));
  }, [gameOver]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") moveLeft();
      if (e.key === "ArrowRight") moveRight();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveLeft, moveRight]);

  // Collision detection
  const checkCollision = (item) => {
    if (!gameAreaRef.current) return false;
    const gameRect = gameAreaRef.current.getBoundingClientRect();
    
    const playerLeft = (gameRect.width * playerPos) / 100;
    const playerRight = playerLeft + PLAYER_HEIGHT;
    const playerBottom = gameRect.height - 80;
    const playerTop = playerBottom - PLAYER_HEIGHT;

    const itemLeft = (gameRect.width * item.left) / 100;
    const itemRight = itemLeft + ITEM_SIZE;
    const itemBottom = (gameRect.height * item.top) / 100 + ITEM_SIZE;
    const itemTop = (gameRect.height * item.top) / 100;

    return (
      playerLeft < itemRight &&
      playerRight > itemLeft &&
      playerTop < itemBottom &&
      playerBottom > itemTop
    );
  };

  // Item generation
  useEffect(() => {
    const carbonItems = [
      { type: "good", icon: "🚲", score: 20 },
      { type: "good", icon: "🌳", score: 15 },
      { type: "bad", icon: "🚗", score: -30 },
      { type: "bad", icon: "🏭", score: -50 },
    ];

    const gameInterval = setInterval(() => {
      if (!gameOver) {
        setItems((prev) => [
          ...prev,
          {
            id: Date.now(),
            left: Math.random() * 90,
            type: carbonItems[Math.floor(Math.random() * carbonItems.length)],
            top: -10,
          },
        ]);
      }
    }, 1200);

    return () => clearInterval(gameInterval);
  }, [gameOver]);

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (!gameOver) {
        setItems((prev) => 
          prev.filter(item => item.top < 100)
            .map(item => ({ ...item, top: item.top + 1.5 }))
        );

        items.forEach((item) => {
          if (checkCollision(item)) {
            setScore((prev) => {
              const newScore = prev + item.type.score;
              if (newScore <= 0) setGameOver(true);
              return Math.max(0, newScore);
            });

            if (item.type.score > 0) {
              sounds.collect.play();
              createParticles(item.left, item.top, "#00ff88");
            } else {
              sounds.hit.play();
              createParticles(item.left, item.top, "#ff0055");
            }

            setItems((prev) => prev.filter((i) => i.id !== item.id));
          }
        });
      }
    }, 40);

    return () => clearInterval(gameLoop);
  }, [items, gameOver, playerPos]);

  // Particle cleanup
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => setParticles([]), 1000);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  const createParticles = (x, y, color) => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      color,
      tx: (Math.random() - 0.5) * 100,
      ty: (Math.random() - 0.5) * 100,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
  };

  return (
    <div className="gt-er-wrapper">
      <div className="gt-er-hud">
        <div className="gt-er-score-group">
          <span className="gt-er-label">CARBON SYNC</span>
          <div className="gt-er-score">{score}kg</div>
        </div>
        <div className="gt-er-life-container">
          <span className="gt-er-label">ATMOSPHERE STATUS</span>
          <div className="gt-er-life-bar">
            <div 
              className="gt-er-life-fill" 
              style={{ 
                width: `${Math.min(score, 100)}%`,
                backgroundColor: score < 40 ? "#ff0055" : "#00ff88"
              }}
            ></div>
          </div>
        </div>
      </div>

      {gameOver ? (
        <div className="gt-er-overlay">
          <div className="gt-er-modal">
            <div className="gt-er-badge-alert">CRITICAL ERROR</div>
            <h1>EMISSIONS OVERLOAD</h1>
            <p>The local ecosystem has reached its saturation limit.</p>
            <div className="gt-er-final-stats">FINAL SCORE: {score}kg</div>
            <div className="gt-er-btn-group">
                <button className="gt-er-btn primary" onClick={() => window.location.reload()}>REINITIATE</button>
                <button className="gt-er-btn secondary" onClick={() => navigate("/games")}>EXIT HUB</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="gt-er-game-container">
          <div className="gt-er-world" ref={gameAreaRef}>
            <div className="gt-er-sky-gradient"></div>
            <div className="gt-er-grid-lines"></div>
            <div className="gt-er-ground"></div>
            
            <div className="gt-er-player" style={{ left: `${playerPos}%` }}>
              <div className="player-sprite">🚶‍♂️</div>
              <div className="player-glow"></div>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className={`gt-er-item ${item.type.type}`}
                style={{ left: `${item.left}%`, top: `${item.top}%` }}
              >
                <span className="item-icon">{item.type.icon}</span>
              </div>
            ))}

            {particles.map((p) => (
              <div
                key={p.id}
                className="gt-er-particle"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  backgroundColor: p.color,
                  "--tx": `${p.tx}px`,
                  "--ty": `${p.ty}px`,
                }}
              ></div>
            ))}
          </div>

          <div className="gt-er-controls">
            <button className="gt-er-ctrl-btn" onMouseDown={moveLeft} onTouchStart={moveLeft}>
              <span className="ctrl-icon">◀</span> MOVE LEFT
            </button>
            <button className="gt-er-ctrl-btn" onMouseDown={moveRight} onTouchStart={moveRight}>
              MOVE RIGHT <span className="ctrl-icon">▶</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EcoRunner;
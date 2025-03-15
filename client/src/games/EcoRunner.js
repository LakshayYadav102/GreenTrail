import React, { useState, useEffect, useRef, useCallback } from "react";
import { Howl } from "howler";
import "./EcoRunner.css";

const sounds = {
  collect: new Howl({ src: ["/sounds/collect.mp3"] }),
  hit: new Howl({ src: ["/sounds/hit.mp3"] }),
  bgm: new Howl({
    src: ["/sounds/background.mp3"],
    loop: true,
    volume: 0.3,
  }),
};

const EcoRunner = () => {
  const [playerPos, setPlayerPos] = useState(50);
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [particles, setParticles] = useState([]);
  const gameAreaRef = useRef(null);

  // Game constants
  const PLAYER_HEIGHT = 60;
  const ITEM_SIZE = 40;

  useEffect(() => {
    sounds.bgm.play();
    return () => sounds.bgm.stop();
  }, []);

  // Keyboard controls
  const moveLeft = useCallback(() => {
    if (!gameOver) setPlayerPos((prev) => Math.max(0, prev - 3));
  }, [gameOver]);

  const moveRight = useCallback(() => {
    if (!gameOver) setPlayerPos((prev) => Math.min(97, prev + 3));
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
    const playerBottom = gameRect.height - 100;
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
    }, 1500);

    return () => clearInterval(gameInterval);
  }, [gameOver]);

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (!gameOver) {
        setItems((prev) => 
          prev.filter(item => item.top < 100)
            .map(item => ({ ...item, top: item.top + 1 }))
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
              createParticles(item.left, item.top, "#2ecc71");
            } else {
              sounds.hit.play();
              createParticles(item.left, item.top, "#e74c3c");
            }

            setItems((prev) => prev.filter((i) => i.id !== item.id));
          }
        });
      }
    }, 50);

    return () => clearInterval(gameLoop);
  }, [items, gameOver]);

  // Particle effects
  const createParticles = (x, y, color) => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      color,
      tx: (Math.random() - 0.5) * 50,
      ty: (Math.random() - 0.5) * 50,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
  };

  return (
    <div className="eco-runner">
      <div className="score-board">
        <div className="score-text">🌍 Carbon Score: {score}kg</div>
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(score, 100)}%` }}
            ></div>
          </div>
          <div className="progress-label">
            {score >= 100 ? "🌱 Sustainable!" : "⚠️ Keep Going!"}
          </div>
        </div>
      </div>

      {gameOver ? (
        <div className="game-over">
          <h2>Carbon Footprint Alert! ⚠️</h2>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="game-area" ref={gameAreaRef}>
            <div className="ground"></div>
            <div 
              className="player"
              style={{ left: `${playerPos}%` }}
            >
              🚶♂️
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className={`game-item ${item.type.type}`}
                style={{
                  left: `${item.left}%`,
                  top: `${item.top}%`,
                }}
              >
                {item.type.icon}
              </div>
            ))}

            {particles.map((p) => (
              <div
                key={p.id}
                className="particle"
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

          <div className="controls">
            <button className="control-btn" onMouseDown={moveLeft}>
              ◀️ Left
            </button>
            <button className="control-btn" onMouseDown={moveRight}>
              Right ▶️
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EcoRunner;
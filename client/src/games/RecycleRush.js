import React, { useState } from "react";
import "./RecycleRush.css";

const trashItems = [
  { id: 1, name: "Plastic Bottle", type: "recycle", img: "/images/plastic-bottle.png" },
  { id: 2, name: "Banana Peel", type: "compost", img: "/images/banana-peel.png" },
  { id: 3, name: "Glass Bottle", type: "recycle", img: "/images/glass-bottle.png" },
  { id: 4, name: "Tin Can", type: "recycle", img: "/images/tin-can.png" },
  { id: 5, name: "Newspaper", type: "recycle", img: "/images/newspaper.png" },
  { id: 6, name: "Food Waste", type: "compost", img: "/images/food-waste.png" },
  { id: 7, name: "Plastic Bag", type: "waste", img: "/images/plastic-bag.png" },
  { id: 8, name: "Styrofoam Cup", type: "waste", img: "/images/styrofoam-cup.png" }
];

const RecycleRush = () => {
  const [score, setScore] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const maxAttempts = 5;
  const [attempts, setAttempts] = useState(0);

  const handleDragStart = (event, item) => {
    setDraggedItem(item);
  };

  const handleDrop = (event, binType) => {
    event.preventDefault();
    if (!draggedItem) return;

    if (draggedItem.type === binType) {
      setScore(score + 10);
    } else {
      setAttempts(attempts + 1);
    }

    // Check if game over
    if (attempts + 1 >= maxAttempts) {
      setGameOver(true);
    }

    setDraggedItem(null);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const restartGame = () => {
    setScore(0);
    setAttempts(0);
    setGameOver(false);
  };

  return (
    <div className="recycle-rush">
      <h2>♻️ Recycle Rush - Sort the Waste!</h2>
      <p>Drag and drop the items into the correct bins.</p>

      <div className="game-container">
        {/* Trash Items */}
        <div className="trash-container">
          {trashItems.map((item) => (
            <img
              key={item.id}
              src={item.img}
              alt={item.name}
              draggable
              onDragStart={(event) => handleDragStart(event, item)}
              className="trash-item"
            />
          ))}
        </div>

        {/* Bins */}
        <div className="bins">
          <div className="bin recycle" onDragOver={handleDragOver} onDrop={(event) => handleDrop(event, "recycle")}>
            ♻️ Recyclable
          </div>
          <div className="bin compost" onDragOver={handleDragOver} onDrop={(event) => handleDrop(event, "compost")}>
            🌱 Compost
          </div>
          <div className="bin waste" onDragOver={handleDragOver} onDrop={(event) => handleDrop(event, "waste")}>
            🗑️ Waste
          </div>
        </div>
      </div>

      <div className="scoreboard">
        <p>Score: {score}</p>
        <p>Attempts Left: {maxAttempts - attempts}</p>
      </div>

      {gameOver && (
        <div className="game-over">
          <h3>Game Over!</h3>
          <p>Your Final Score: {score}</p>
          <button onClick={restartGame}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default RecycleRush;

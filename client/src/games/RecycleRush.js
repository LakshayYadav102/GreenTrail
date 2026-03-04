import React, { useState } from "react";
import "./RecycleRush.css";

// Assuming your assets are in the correct path
import plasticBottle from '../assets/plastic-bottle.png';
import bananaPeel from '../assets/banana-peel.png';
import glassBottle from '../assets/glass-bottle.png';
import tinCan from '../assets/tin-can.png';
import newspaper from '../assets/newspaper.png';
import foodWaste from '../assets/food-waste.png';
import plasticBag from '../assets/plastic-bag.png';
import styrofoamCup from '../assets/styrofoam-cup.png';

const trashItems = [
  { id: 1, name: "Plastic Bottle", type: "recycle", img: plasticBottle },
  { id: 2, name: "Banana Peel", type: "compost", img: bananaPeel },
  { id: 3, name: "Glass Bottle", type: "recycle", img: glassBottle },
  { id: 4, name: "Tin Can", type: "recycle", img: tinCan },
  { id: 5, name: "Newspaper", type: "recycle", img: newspaper },
  { id: 6, name: "Food Waste", type: "compost", img: foodWaste },
  { id: 7, name: "Plastic Bag", type: "waste", img: plasticBag },
  { id: 8, name: "Styrofoam Cup", type: "waste", img: styrofoamCup }
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
      setScore(score + 15);
    } else {
      setAttempts(attempts + 1);
      if (attempts + 1 >= maxAttempts) setGameOver(true);
    }
    setDraggedItem(null);
  };

  return (
    <div className="gt-rr-wrapper">
      <div className="gt-rr-header">
        <div className="gt-rr-badge">FACILITY ID: #ECO-99</div>
        <h1>RECYCLE <span className="gt-rr-highlight">RUSH</span></h1>
      </div>

      <div className="gt-rr-stats-bar">
        <div className="gt-rr-stat">
          <label>EFFICIENCY</label>
          <div className="gt-rr-value">{score}</div>
        </div>
        <div className="gt-rr-stat">
          <label>INTEGRITY</label>
          <div className="gt-rr-attempts">
            {[...Array(maxAttempts)].map((_, i) => (
              <div key={i} className={`gt-rr-heart ${i < maxAttempts - attempts ? 'active' : ''}`}></div>
            ))}
          </div>
        </div>
      </div>

      <div className="gt-rr-conveyor">
        <div className="gt-rr-item-belt">
          {trashItems.map((item) => (
            <div 
              key={item.id} 
              className="gt-rr-item-box"
              onDragStart={(e) => handleDragStart(e, item)}
              draggable
            >
              <img src={item.img} alt={item.name} />
              <span className="gt-rr-item-label">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="gt-rr-bins">
        <div className="gt-rr-bin recycle" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "recycle")}>
          <div className="bin-icon">♻️</div>
          <div className="bin-label">RECYCLABLES</div>
        </div>
        <div className="gt-rr-bin compost" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "compost")}>
          <div className="bin-icon">🌱</div>
          <div className="bin-label">COMPOST</div>
        </div>
        <div className="gt-rr-bin waste" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "waste")}>
          <div className="bin-icon">🗑️</div>
          <div className="bin-label">GENERAL WASTE</div>
        </div>
      </div>

      {gameOver && (
        <div className="gt-rr-overlay">
          <div className="gt-rr-modal">
            <h2>FACILITY SHUTDOWN</h2>
            <p>Critical sorting errors detected.</p>
            <div className="gt-rr-final-score">SCORE: {score}</div>
            <button onClick={() => window.location.reload()} className="gt-rr-btn">REBOOT SYSTEM</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecycleRush;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spinner, Alert } from "react-bootstrap";
import Leaderboard from "./Leaderboard";
import "./Challenges.css";

const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/challenges/`);
        setChallenges(response.data);
        // Automatically select the first challenge if available
        if (response.data.length > 0) {
          setSelectedChallengeId(response.data[0]._id);
        }
      } catch (error) {
        console.error("Error fetching challenges:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const joinChallenge = async (challengeId) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/api/challenges/join`, {
        userId,
        challengeId,
      });
      setMessage({ type: "success", text: response.data.message });
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to join challenge.";
      setMessage({ type: "danger", text: errorMsg });
    }
  };

  if (loading) return (
    <div className="gt-challenges-loader">
      <Spinner animation="border" variant="success" />
      <p>Loading Active Challenges...</p>
    </div>
  );

  return (
    <div className="gt-challenges-wrapper">
      <div className="gt-challenges-header">
        <span className="gt-badge">Community Spirit</span>
        <h1>Eco <span className="gt-gradient-text">Challenges</span></h1>
        <p>Compete with the community to achieve the lowest carbon footprint this week.</p>
      </div>

      <div className="gt-challenges-container">
        {message.text && (
          <Alert variant={message.type} className="gt-alert-float">
            {message.text}
          </Alert>
        )}

        {challenges.length > 0 ? (
          <div className="gt-challenge-main-card">
            <div className="gt-challenge-info">
              <div className="gt-challenge-tag">Active Mission</div>
              <h2>{challenges[0].title}</h2>
              <p>{challenges[0].description}</p>
              
              <div className="gt-challenge-stats">
                <div className="gt-stat">
                  <span className="gt-stat-icon">🎯</span>
                  <div>
                    <label>Goal</label>
                    <strong>{challenges[0].goal} kg CO₂</strong>
                  </div>
                </div>
                <div className="gt-stat">
                  <span className="gt-stat-icon">⏳</span>
                  <div>
                    <label>Duration</label>
                    <strong>{challenges[0].duration} Days</strong>
                  </div>
                </div>
              </div>

              <div className="gt-challenge-actions">
                <button 
                  className="gt-btn-join" 
                  onClick={() => joinChallenge(challenges[0]._id)}
                >
                  Join Challenge
                </button>
              </div>
            </div>
            
            <div className="gt-challenge-illustration">
               {/* Professional Vector Visual */}
               <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" fill="#2ecc71" opacity="0.1" r="90" />
                  <path d="M100 30L120 70H80L100 30Z" fill="#2ecc71" />
                  <rect fill="#27ae60" height="60" width="10" x="95" y="70" />
               </svg>
            </div>
          </div>
        ) : (
          <div className="gt-no-challenges">
            <p>No active challenges at the moment. Stay tuned!</p>
          </div>
        )}

        {selectedChallengeId && (
          <div className="gt-leaderboard-section">
            <Leaderboard challengeId={selectedChallengeId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenges;
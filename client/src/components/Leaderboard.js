import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import "./Leaderboard.css";

const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Leaderboard = ({ challengeId }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/challenges/leaderboard/${challengeId}`);
        setLeaderboard(response.data);
      } catch (err) {
        setError("Failed to load leaderboard.");
      } finally {
        setLoading(false);
      }
    };
    if (challengeId) fetchLeaderboard();
  }, [challengeId]);

  if (loading) return (
    <div className="gt-lb-status-container">
      <Spinner animation="grow" variant="success" />
      <p>Calculating Eco Scores...</p>
    </div>
  );

  if (error) return <div className="gt-lb-error-alert">⚠️ {error}</div>;

  const maxCO2 = leaderboard.length > 0 ? Math.max(...leaderboard.map(e => e.totalCO2)) : 100;

  return (
    <div className="gt-lb-main-container">
      <div className="gt-lb-header-premium">
        <div className="gt-lb-title-group">
          <span className="gt-lb-badge-count">{leaderboard.length} Participants</span>
          <h3>🏆 Community Hall of Fame</h3>
          <p>Active participants ranked by lowest emissions this week.</p>
        </div>
      </div>

      <div className="gt-lb-table-container">
        {leaderboard.length > 0 ? (
          <table className="gt-lb-custom-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Eco Warrior</th>
                <th className="gt-text-right">CO₂ Footprint</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => {
                const isEligible = entry.totalCO2 > 0;
                const rank = index + 1;
                const percentage = (entry.totalCO2 / maxCO2) * 100;
                
                return (
                  <tr key={index} className={`gt-lb-row-premium ${isEligible ? `gt-rank-bg-${rank}` : 'gt-no-data-row'}`}>
                    <td className="gt-lb-rank-col">
                      <div className={`gt-lb-medal ${isEligible ? `medal-${rank}` : 'medal-none'}`}>
                        {isEligible ? (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank) : "—"}
                      </div>
                    </td>
                    <td className="gt-lb-user-col">
                      <div className="gt-lb-user-info">
                        <div className="gt-lb-avatar-circle" style={{ opacity: isEligible ? 1 : 0.5 }}>
                          {entry.username ? entry.username[0].toUpperCase() : "E"}
                        </div>
                        <div className="gt-lb-user-details">
                            <span className="gt-lb-username">{entry.username}</span>
                            {!isEligible && <small className="gt-lb-hint">No data calculated this week</small>}
                        </div>
                        {isEligible && rank === 1 && <span className="gt-lb-crown">👑</span>}
                      </div>
                    </td>
                    <td className="gt-lb-stats-col">
                      <div className="gt-lb-progress-wrapper">
                        <div className="gt-lb-progress-text" style={{ color: isEligible ? '#334155' : '#94a3b8' }}>
                          {isEligible ? `${entry.totalCO2.toFixed(2)} kg` : "Pending Data"}
                        </div>
                        {isEligible && (
                            <div className="gt-lb-progress-track">
                                <div className="gt-lb-progress-bar" style={{ width: `${Math.max(percentage, 5)}%` }}></div>
                            </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="gt-lb-empty">
            <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="Empty" />
            <h4>The podium is empty!</h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
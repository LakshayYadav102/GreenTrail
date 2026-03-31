import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; 
import "./RideRequest.css";

function RideRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
    seatsNeeded: 1,
    additionalNotes: ""
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!form.from || !form.to || !form.date || !form.time) {
      setError("All trip details are required");
      setLoading(false);
      return;
    }
    if (form.seatsNeeded < 1) {
      setError("At least one seat is required");
      setLoading(false);
      return;
    }

    try {
      await api.post("/rides/request", form);
      alert("Ride request posted successfully!");
      navigate("/ride/find"); 
    } catch (err) {
      console.error("Error posting ride request:", err.message);
      setError(err.response?.data?.error || "Error posting ride request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Animated Background */}
      <div className="ride-request-background">
        <div className="floating-request">🙋</div>
        <div className="floating-location">📍</div>
        <div className="energy-orb orb-1"></div>
        <div className="energy-orb orb-2"></div>
      </div>

      <div className={`ride-request-container ${isLoaded ? 'loaded' : ''}`}>
        <div className="ride-request-glass">
          {/* Header */}
          <div className="request-header">
            <h1 className="main-title">Request a <span className="gradient-text">Ride</span></h1>
            <p className="subtitle">Let drivers know you're looking for a ride and find your perfect travel match</p>
          </div>

          {/* Stats */}
          <div className="request-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="stat-content">
                <h3>15 min</h3>
                <p>Avg. Response Time</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25" /></svg>
              </div>
              <div className="stat-content">
                <h3>95%</h3>
                <p>Request Success Rate</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C7.387 11.812 11.543 9.262 14.46 5.751C14.46 5.751 14.46 5.751 14.46 5.751C14.46 11.512 18.062 16.524 21 19.393M14.46 5.751C11.543 9.262 14.46 16.524 14.46 16.524M14.46 5.751C14.46 5.751 14.46 5.751 14.46 5.751ZM3 19.5h18" /></svg>
              </div>
              <div className="stat-content">
                <h3>2.1kg</h3>
                <p>Avg. CO2 Saved</p>
              </div>
            </div>
          </div>

          {/* Request Form */}
          <form onSubmit={handleSubmit} className="request-form-glass">
            <div className="form-section">
              <h3 className="section-title">📍 Trip Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="input-label">
                    <span className="label-icon">📍</span>
                    From
                  </label>
                  <input
                    name="from"
                    placeholder="e.g., New York"
                    value={form.from}
                    onChange={handleChange}
                    className="glass-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="input-label">
                    <span className="label-icon">🎯</span>
                    To
                  </label>
                  <input
                    name="to"
                    placeholder="e.g., Boston"
                    value={form.to}
                    onChange={handleChange}
                    className="glass-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="input-label">
                    <span className="label-icon">📅</span>
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="glass-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="input-label">
                    <span className="label-icon">⏰</span>
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    className="glass-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="input-label">
                    <span className="label-icon">👥</span>
                    Seats Needed
                  </label>
                  <input
                    type="number"
                    name="seatsNeeded"
                    placeholder="e.g., 2"
                    value={form.seatsNeeded}
                    onChange={handleChange}
                    min="1"
                    className="glass-input"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">💬 Additional Information</h3>
              <div className="form-group full-width">
                <label className="input-label">
                  <span className="label-icon">📝</span>
                  Special Requirements
                </label>
                <textarea
                  name="additionalNotes"
                  placeholder="e.g., Need pet-friendly ride, have luggage, prefer non-smoking driver..."
                  value={form.additionalNotes}
                  onChange={handleChange}
                  className="glass-input textarea"
                  rows="4"
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/ride/find')}
                className="action-btn secondary"
              >
                ← Back to Search
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`submit-btn ${loading ? 'loading' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Posting Request...
                  </>
                ) : (
                  '🚀 Post Ride Request'
                )}
              </button>
            </div>
          </form>

          {/* Tips Section */}
          <div className="tips-section">
            <h3>💡 Tips for Better Matches</h3>
            <div className="tips-grid">
              <div className="tip-card">
                <div className="tip-icon">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                </div>
                <h4>Be Specific</h4>
                <p>Include exact locations and landmarks for better matching</p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h4>Flexible Timing</h4>
                <p>Consider flexible departure times for more options</p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                </div>
                <h4>Clear Requirements</h4>
                <p>Mention any special needs in the notes section</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RideRequest;
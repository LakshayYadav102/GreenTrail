// pages/carpooling/RideRequest.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GreenverseNavbar from "../../components/GreenverseNavbar";
import axios from "../../services/api";
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
      await axios.post("/rides/request", form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      alert("Ride request posted successfully!");
      navigate("/ride/find"); // Changed to navigate to FindRide
    } catch (err) {
      console.error("Error posting ride request:", err.message, err.response?.data);
      setError(err.response?.data?.error || "Error posting ride request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GreenverseNavbar />
      
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
              <div className="stat-icon">🚗</div>
              <div className="stat-content">
                <h3>15 min</h3>
                <p>Avg. Response Time</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👍</div>
              <div className="stat-content">
                <h3>95%</h3>
                <p>Request Success Rate</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🌱</div>
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
                <div className="tip-icon">📍</div>
                <h4>Be Specific</h4>
                <p>Include exact locations and landmarks for better matching</p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">⏰</div>
                <h4>Flexible Timing</h4>
                <p>Consider flexible departure times for more options</p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">💬</div>
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
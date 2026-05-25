import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import GraphComponent from './GraphComponent';
import './UserActivity.css';

const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const UserActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    const fetchUserActivities = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/activities/user/${userId}`);
        setActivities(response.data);
      } catch (err) {
        setError('Error fetching activities');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserActivities();
  }, []);

  if (loading) {
    return (
      <div className="gt-activity-loader-wrapper">
        <div className="gt-activity-spinner"></div>
        <p>Loading your activity history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gt-activity-loader-wrapper">
        <div className="gt-activity-error-box">
          <h4>⚠️ Error</h4>
          <p>{error}</p>
          <Link to="/dashboard" className="gt-activity-btn-back">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="gt-activity-page-wrapper">
      <div className="gt-activity-bg-overlay"></div>
      
      <div className="gt-activity-container">
        <div className="gt-activity-header">
          <span className="gt-activity-badge">Eco Ledger</span>
          <h1 className="gt-activity-title">ACTIVITY <span className="gt-activity-highlight">HISTORY</span></h1>
          <p className="gt-activity-subtitle">Track your past emissions and monitor your journey towards sustainability.</p>
        </div>

        {/* GRAPH SECTION */}
        <div className="gt-activity-graph-section">
          <div className="gt-activity-glass-card">
            <h3 className="gt-activity-card-title">📈 Emission Trends</h3>
            <GraphComponent userId={localStorage.getItem('userId')} />
          </div>
        </div>

        {/* ACTIVITIES GRID */}
        <div className="gt-activity-list-section">
          <h3 className="gt-activity-section-title">Detailed Records</h3>
          
          {activities.length > 0 ? (
            <div className="gt-activity-grid">
              {activities.map((activity) => (
                <div key={activity._id} className="gt-activity-glass-card gt-record-card">
                  <div className="gt-record-header">
                    <span className="gt-record-date">
                      {new Date(activity.fromDate).toLocaleDateString()} - {new Date(activity.toDate).toLocaleDateString()}
                    </span>
                    <span className="gt-record-total">{activity.totalEmission} <small>kg CO₂</small></span>
                  </div>
                  
                  <div className="gt-record-body">
                    <div className="gt-record-item">
                      <div className="gt-record-icon">🚗</div>
                      <div className="gt-record-info">
                        <label>Transport</label>
                        <strong>
  {activity.transportation > 0 
    ? `${activity.transportation} km` 
    : 'Not recorded'}
</strong>
                      </div>
                    </div>

                    <div className="gt-record-item">
                      <div className="gt-record-icon">💡</div>
                      <div className="gt-record-info">
                        <label>Energy</label>
                        <strong>{activity.energy} kWh</strong>
                      </div>
                    </div>

                    <div className="gt-record-item">
                      <div className="gt-record-icon">🍽️</div>
                      <div className="gt-record-info">
                        <label>Diet</label>
                        <strong style={{ textTransform: 'capitalize' }}>{activity.diet}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="gt-activity-empty-state">
              <div className="gt-empty-icon">🍃</div>
              <p>No activities recorded yet. Start tracking to see your history!</p>
            </div>
          )}
        </div>

        <div className="gt-activity-footer">
          <Link to="/dashboard" className="gt-activity-btn-back">
            ← Back to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
};

export default UserActivity;
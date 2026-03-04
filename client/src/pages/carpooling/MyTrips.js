// pages/carpooling/MyTrips.jsx
import React, { useEffect, useState } from "react";
// NAVBAR IMPORT REMOVED - Handled by App.js
import axios from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./MyTrips.css";

function MyTrips() {
  const [ridesOffered, setRidesOffered] = useState([]);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("offered");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      console.log("Sending token:", token);
      if (!token) {
        throw new Error("No token found in localStorage");
      }
      const res = await axios.get("/rides/mytrips", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Response data:", res.data);
      setRidesOffered(Array.isArray(res.data.ridesOffered) ? res.data.ridesOffered : []);
      setBookings(Array.isArray(res.data.bookings) ? res.data.bookings : []);
    } catch (err) {
      console.error("Error fetching trips:", err.message, err.response?.data);
      setError(`Error fetching your trips: ${err.response?.data?.error || err.message}`);
      setRidesOffered([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    // eslint-disable-next-line
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '#43e97b';
      case 'pending': return '#f093fb';
      case 'rejected': return '#ff6b6b';
      case 'cancelled': return '#ff6b6b';
      case 'completed': return '#4facfe';
      default: return '#6c757d';
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner-large"></div>
      <p>Loading your trips...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <div className="error-icon-large">⚠️</div>
      <h3>Something went wrong</h3>
      <p className="error-message">{error}</p>
      <button onClick={fetchTrips} className="retry-btn-large">
        Try Again
      </button>
    </div>
  );

  return (
    <>
      {/* NO NAVBAR COMPONENT HERE. App.js handles the routing! */}
      
      {/* Animated Background */}
      <div className="my-trips-background">
        <div className="floating-suitcase">🧳</div>
        <div className="floating-route">🛣️</div>
        <div className="energy-orb orb-1"></div>
        <div className="energy-orb orb-2"></div>
      </div>

      <div className={`my-trips-container ${isLoaded ? 'loaded' : ''}`}>
        <div className="my-trips-glass">
          {/* Header */}
          <div className="my-trips-header">
            <h1 className="main-title">My Travel <span className="gradient-text">Journey</span></h1>
            <p className="subtitle">Manage your rides and bookings in one place</p>
          </div>

          {/* Stats Overview */}
          <div className="trips-stats">
            <div className="stat-card">
              <div className="stat-icon">🚗</div>
              <div className="stat-content">
                <h3>{ridesOffered.length}</h3>
                <p>Rides Offered</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎫</div>
              <div className="stat-content">
                <h3>{bookings.length}</h3>
                <p>Bookings Made</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🌱</div>
              <div className="stat-content">
                <h3>{(ridesOffered.length + bookings.length) * 2.5}kg</h3>
                <p>CO2 Saved</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tabs-navigation">
            <button 
              className={`tab-btn ${activeTab === 'offered' ? 'active' : ''}`}
              onClick={() => setActiveTab('offered')}
            >
              <span className="tab-icon">🚗</span>
              Rides I Offered
              <span className="tab-count">{ridesOffered.length}</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'booked' ? 'active' : ''}`}
              onClick={() => setActiveTab('booked')}
            >
              <span className="tab-icon">🎫</span>
              Rides I Booked
              <span className="tab-count">{bookings.length}</span>
            </button>
          </div>

          {/* Content */}
          <div className="tabs-content">
            {activeTab === 'offered' && (
              <div className="tab-panel active">
                {ridesOffered.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🚗</div>
                    <h3>No Rides Offered Yet</h3>
                    <p>Start sharing your journey and help reduce carbon emissions</p>
                    <button 
                      onClick={() => navigate('/ride/offer')}
                      className="cta-btn"
                    >
                      Offer Your First Ride
                    </button>
                  </div>
                ) : (
                  <div className="rides-grid">
                    {ridesOffered.map((ride) =>
                      ride && ride._id ? (
                        <div
                          key={ride._id}
                          className="trip-card"
                          onClick={() => navigate(`/ride/${ride._id}`)}
                        >
                          <div className="trip-header">
                            <div className="route-info">
                              <span className="from">{ride.from || "Unknown"}</span>
                              <div className="route-arrow">→</div>
                              <span className="to">{ride.to || "Unknown"}</span>
                            </div>
                            <div className="trip-badge driver">Driver</div>
                          </div>
                          
                          <div className="trip-details">
                            <div className="detail-item">
                              <span className="detail-icon">📅</span>
                              <span>{ride.date ? new Date(ride.date).toLocaleDateString() : "N/A"}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">⏰</span>
                              <span>{ride.time || "N/A"}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">💺</span>
                              <span>{ride.seatsAvailable ?? "N/A"} seats available</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">👥</span>
                              <span>{ride.passengers?.length || 0} confirmed passengers</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">🎫</span>
                              <span>{ride.bookings?.filter(b => b.status === 'pending').length || 0} pending bookings</span>
                            </div>
                          </div>

                          <div className="trip-footer">
                            <div className="price">${ride.pricePerSeat ?? 0}/seat</div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/ride/${ride._id}`);
                              }}
                              className="action-btn edit"
                            >
                              Manage Ride
                            </button>
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'booked' && (
              <div className="tab-panel active">
                {bookings.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🎫</div>
                    <h3>No Bookings Yet</h3>
                    <p>Find your perfect ride and start your eco-friendly journey</p>
                    <button 
                      onClick={() => navigate('/ride/find')}
                      className="cta-btn"
                    >
                      Find a Ride
                    </button>
                  </div>
                ) : (
                  <div className="rides-grid">
                    {bookings.map((booking) =>
                      booking && booking.ride && booking.ride._id ? (
                        <div
                          key={booking._id}
                          className="trip-card"
                          onClick={() => navigate(`/ride/${booking.ride._id}`)}
                        >
                          <div className="trip-header">
                            <div className="route-info">
                              <span className="from">{booking.ride.from || "Unknown"}</span>
                              <div className="route-arrow">→</div>
                              <span className="to">{booking.ride.to || "Unknown"}</span>
                            </div>
                            <div 
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(booking.status) }}
                            >
                              {booking.status || "Unknown"}
                            </div>
                          </div>
                          
                          <div className="trip-details">
                            <div className="detail-item">
                              <span className="detail-icon">📅</span>
                              <span>{booking.ride.date ? new Date(booking.ride.date).toLocaleDateString() : "N/A"}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">⏰</span>
                              <span>{booking.ride.time || "N/A"}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">💺</span>
                              <span>{booking.seatsBooked ?? "N/A"} seats booked</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">👤</span>
                              <span>{booking.ride.driver?.name || "Unknown"}</span>
                            </div>
                          </div>

                          <div className="trip-footer">
                            <div className="price">${booking.ride.pricePerSeat ?? 0}/seat</div>
                            <div className="booking-actions">
                              {booking.status === 'pending' && (
                                <div className="pending-notice">Awaiting driver confirmation</div>
                              )}
                              {booking.status === 'confirmed' && (
                                <div className="confirmed-notice">Confirmed! Check ride details</div>
                              )}
                              {booking.status === 'rejected' && (
                                <div className="rejected-notice">Rejected by driver</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default MyTrips;
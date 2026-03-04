import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RideCard from "../../components/carpooling/RideCard";
import api from "../../services/api"; // Changed from axios to our custom api service
import "./FindRide.css";

function FindRide() {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [openRequests, setOpenRequests] = useState([]);
  const [search, setSearch] = useState({ from: "", to: "", date: "" });
  const [loadingRides, setLoadingRides] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingOpen, setLoadingOpen] = useState(true);
  const [errorRides, setErrorRides] = useState(null);
  const [errorRequests, setErrorRequests] = useState(null);
  const [errorOpen, setErrorOpen] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    setIsLoaded(true);
    const token = localStorage.getItem("token");
    if (token) {
      fetchRides();
      fetchMyRequests();
      fetchOpenRequests();
    } else {
      setErrorRides("Please log in to view rides.");
      setErrorRequests("Please log in to view your ride requests.");
      setErrorOpen("Please log in to view open ride requests.");
      setLoadingRides(false);
      setLoadingRequests(false);
      setLoadingOpen(false);
    }
  }, []);

  const fetchRides = async () => {
    setLoadingRides(true);
    setErrorRides(null);
    try {
      const params = {};
      if (search.from) params.from = search.from;
      if (search.to) params.to = search.to;
      if (search.date) params.date = search.date;

      // Token is now automatically handled by the api interceptor
      const res = await api.get("/rides/find", { params });
      setRides(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setErrorRides(err.response?.data?.error || "Failed to fetch available rides");
    } finally {
      setLoadingRides(false);
    }
  };

  const fetchMyRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await api.get("/rides/requests", {
        params: { myRequests: true }
      });
      setMyRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setErrorRequests("Failed to fetch your ride requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchOpenRequests = async () => {
    setLoadingOpen(true);
    try {
      const res = await api.get("/rides/requests");
      setOpenRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setErrorOpen("Failed to fetch open ride requests");
    } finally {
      setLoadingOpen(false);
    }
  };

  const cancelRequest = async (requestId) => {
    try {
      await api.post(`/rides/request/${requestId}/cancel`);
      alert("Ride request cancelled successfully!");
      fetchMyRequests();
    } catch (err) {
      setErrorRequests("Error cancelling ride request");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRides();
  };

  const handleChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  return (
    <div className="fr-page-wrapper">
      <div className="fr-background">
        <div className="fr-floating-car">🚗</div>
        <div className="fr-floating-map">🗺️</div>
        <div className="fr-orb fr-orb-1"></div>
        <div className="fr-orb fr-orb-2"></div>
      </div>

      <div className={`fr-container ${isLoaded ? 'fr-loaded' : ''}`}>
        <div className="fr-glass-card">
          <div className="fr-header">
            <h1 className="fr-main-title">
              Find Your Perfect <span className="fr-gradient-text">Ride</span>
            </h1>
            <p className="fr-subtitle">Discover sustainable travel options and join fellow eco-conscious travelers</p>
          </div>

          <div className="fr-search-section">
            <form onSubmit={handleSearch} className="fr-search-form">
              <div className="fr-search-grid">
                <div className="fr-search-group">
                  <span className="fr-input-icon">📍</span>
                  <input 
                    name="from" 
                    placeholder="From (e.g., New York)" 
                    value={search.from} 
                    onChange={handleChange} 
                    className="fr-search-input"
                  />
                </div>
                
                <div className="fr-search-group">
                  <span className="fr-input-icon">🎯</span>
                  <input 
                    name="to" 
                    placeholder="To (e.g., Boston)" 
                    value={search.to} 
                    onChange={handleChange} 
                    className="fr-search-input"
                  />
                </div>
                
                <div className="fr-search-group">
                  <span className="fr-input-icon">📅</span>
                  <input 
                    type="date" 
                    name="date" 
                    value={search.date} 
                    onChange={handleChange} 
                    className="fr-search-input"
                  />
                </div>
                
                <button type="submit" className="fr-search-btn">
                  🔍 Search Rides
                </button>
              </div>
            </form>
          </div>

          {/* MY REQUESTS SECTION */}
          <div className="fr-section">
            <h2 className="fr-section-title">My Ride Requests <span className="fr-count">({myRequests.length})</span></h2>
            {loadingRequests ? (
              <div className="fr-loading"><div className="fr-spinner"></div></div>
            ) : (
              <div className="fr-grid">
                {myRequests.map((request, index) => (
                  <div key={request._id} className="fr-card-item" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="fr-request-card">
                      <div className="fr-card-header">
                        <h3>Ride Request</h3>
                        <span className={`fr-badge fr-badge-${request.status}`}>{request.status}</span>
                      </div>
                      <div className="fr-card-body">
                        <p><strong>From:</strong> {request.from}</p>
                        <p><strong>To:</strong> {request.to}</p>
                        <p><strong>Date:</strong> {new Date(request.date).toLocaleDateString()}</p>
                      </div>
                      <div className="fr-card-footer">
                        {request.status === "open" && (
                          <button onClick={() => cancelRequest(request._id)} className="fr-btn-secondary">Cancel</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OPEN REQUESTS SECTION */}
          <div className="fr-section">
            <h2 className="fr-section-title">Open Community Requests</h2>
            {loadingOpen ? (
              <div className="fr-loading"><div className="fr-spinner"></div></div>
            ) : (
              <div className="fr-grid">
                {openRequests.map((request, index) => (
                  <div key={request._id} className="fr-card-item" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="fr-request-card">
                      <div className="fr-card-header">
                        <h3>Community Request</h3>
                      </div>
                      <div className="fr-card-body">
                        <p><strong>From:</strong> {request.from}</p>
                        <p><strong>To:</strong> {request.to}</p>
                        <p><strong>Requester:</strong> {request.requester?.username || "Member"}</p>
                      </div>
                      <div className="fr-card-footer">
                        <button 
                          onClick={() => navigate("/ride/offer", { state: { prefill: request } })}
                          className="fr-btn-primary"
                          disabled={request.requester?._id === userId}
                        >Offer Ride</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AVAILABLE RIDES SECTION */}
          <div className="fr-section">
            <h2 className="fr-section-title">Available Eco Rides</h2>
            {loadingRides ? (
              <div className="fr-loading"><div className="fr-spinner"></div></div>
            ) : rides.length === 0 ? (
              <div className="fr-empty">No rides found. Try another search.</div>
            ) : (
              <div className="fr-grid">
                {rides.map((ride, index) => (
                  <div key={ride._id} className="fr-card-item" style={{ animationDelay: `${index * 0.1}s` }}>
                    <RideCard ride={ride} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="fr-quick-stats">
            <div className="fr-stat-card">🌱 <h3>2.5k+</h3><p>CO2 Saved</p></div>
            <div className="fr-stat-card">👥 <h3>1.2k+</h3><p>Active Riders</p></div>
            <div className="fr-stat-card">💰 <h3>65%</h3><p>Cost Savings</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindRide;
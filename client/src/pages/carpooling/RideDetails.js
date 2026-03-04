import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
// NAVBAR IMPORT REMOVED - Handled by App.js
import BookingModal from "../../components/carpooling/BookingModal";
import Chat from "../../components/carpooling/Chat";
import axios from "../../services/api";
import io from "socket.io-client";
import "./RideDetails.css";

function RideDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [activeSection, setActiveSection] = useState("details");
  const [isLoaded, setIsLoaded] = useState(false);
  const userId = localStorage.getItem("userId");
  const socket = useRef(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const fetchRide = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found in localStorage");
      console.log(`Fetching ride details for ride ${id}`);
      const res = await axios.get(`/rides/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Ride details response:", res.data);
      setRide(res.data);
      setEditForm({
        vehicle: res.data.vehicle || {},
        from: res.data.from || "",
        to: res.data.to || "",
        date: res.data.date?.split("T")[0] || "",
        time: res.data.time || "",
        seatsAvailable: res.data.seatsAvailable || "",
        pricePerSeat: res.data.pricePerSeat || "",
        distance: res.data.distance || "",
        estimatedDuration: res.data.estimatedDuration || "",
        stops: res.data.stops || [],
        luggageSpace: res.data.luggageSpace || "None",
        smokingAllowed: res.data.smokingAllowed || false,
        petsAllowed: res.data.petsAllowed || false,
        additionalNotes: res.data.additionalNotes || "",
        carbonOffset: res.data.carbonOffset || false
      });
      // Set initial messages
      setMessages(res.data.messages || []);
      console.log("Initial messages loaded:", res.data.messages || []);

      // Fetch bookings for this ride (for driver)
      if (res.data.driverId === userId) {
        console.log(`Fetching bookings for ride ${id}`);
        const bookingsRes = await axios.get(`/rides/${id}/bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Bookings response:", bookingsRes.data);
        setBookings(bookingsRes.data);
      }
    } catch (err) {
      console.error("Error fetching ride details:", err.message, err.response?.data);
      setError(err.response?.data?.error || "Error fetching ride details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRide();
    // Initialize Socket.io
    socket.current = io("http://localhost:5000", {
      auth: { token: localStorage.getItem("token") }
    });
    socket.current.on("connect", () => {
      console.log(`Socket connected: ${socket.current.id}`);
      socket.current.emit("joinRide", id);
      console.log(`Emitted joinRide for ride ${id}`);
    });
    socket.current.on("newMessage", (message) => {
      console.log(`Received new message for ride ${id}:`, message);
      setMessages((prev) => [...prev, message]);
    });
    socket.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
    return () => {
      console.log(`Disconnecting socket for ride ${id}`);
      socket.current.disconnect();
    };
    // eslint-disable-next-line
  }, [id]);

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("vehicle.")) {
      setEditForm({
        ...editForm,
        vehicle: { ...editForm.vehicle, [name.split(".")[1]]: value }
      });
    } else if (type === "checkbox") {
      setEditForm({ ...editForm, [name]: checked });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const handleStopChange = (index, value) => {
    const newStops = [...editForm.stops];
    newStops[index] = value;
    setEditForm({ ...editForm, stops: newStops });
  };

  const addStop = () => {
    setEditForm({ ...editForm, stops: [...editForm.stops, ""] });
  };

  const removeStop = (index) => {
    setEditForm({ ...editForm, stops: editForm.stops.filter((_, i) => i !== index) });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!editForm.vehicle.make || !editForm.vehicle.model || !editForm.vehicle.licensePlate) {
      setError("All vehicle fields are required");
      return;
    }
    if (!editForm.vehicle.carType || !editForm.vehicle.totalSeats || !editForm.vehicle.fuelType) {
      setError("Car type, total seats, and fuel type are required");
      return;
    }
    if (!editForm.from || !editForm.to || !editForm.date || !editForm.time) {
      setError("All trip details are required");
      return;
    }
    if (!editForm.seatsAvailable || editForm.seatsAvailable < 1) {
      setError("Seats available must be at least 1");
      return;
    }
    if (editForm.seatsAvailable > editForm.vehicle.totalSeats) {
      setError("Seats available cannot exceed total seats");
      return;
    }
    if (editForm.pricePerSeat === "" || editForm.pricePerSeat < 0) {
      setError("Price per seat must be non-negative");
      return;
    }
    if (editForm.distance && editForm.distance < 0) {
      setError("Distance must be non-negative");
      return;
    }
    try {
      await axios.patch(`/rides/${id}`, editForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      alert("Ride updated successfully!");
      setEditing(false);
      fetchRide();
    } catch (err) {
      console.error("Error updating ride:", err.message, err.response?.data);
      setError(err.response?.data?.error || "Error updating ride");
    }
  };

  const handleBookingAction = async (bookingId, status) => {
    try {
      await axios.post(`/rides/book/${bookingId}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      alert(`Booking ${status} successfully!`);
      fetchRide();
    } catch (err) {
      console.error(`Error ${status} booking:`, err.message);
      setError(`Error ${status} booking`);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const reason = prompt("Reason for cancellation:");
    if (!reason) return;
    try {
      await axios.post(`/rides/book/${bookingId}/cancel`, { reason }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      alert("Booking cancelled successfully!");
      fetchRide();
    } catch (err) {
      console.error("Error cancelling booking:", err.message);
      setError("Error cancelling booking");
    }
  };

  const handleSubmitRating = async (revieweeId) => {
    if (!rating || rating < 1 || rating > 5) {
      setError("Please select a valid rating (1-5)");
      return;
    }
    try {
      await axios.post(`/rides/ratings`, {
        rideId: id,
        revieweeId,
        rating,
        review
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      alert("Rating submitted successfully!");
      setRating(0);
      setReview("");
    } catch (err) {
      console.error("Error submitting rating:", err.message);
      setError(err.response?.data?.error || "Error submitting rating");
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner-large"></div>
      <p>Loading ride details...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <div className="error-icon-large">⚠️</div>
      <h3>Something went wrong</h3>
      <p className="error-message">{error}</p>
      <button onClick={fetchRide} className="retry-btn-large">
        Try Again
      </button>
    </div>
  );

  if (!ride) return (
    <div className="error-container">
      <div className="error-icon-large">🚗</div>
      <h3>Ride Not Found</h3>
      <p className="error-message">The ride you're looking for doesn't exist or has been removed.</p>
      <button onClick={() => navigate('/ride/find')} className="retry-btn-large">
        Find Another Ride
      </button>
    </div>
  );

  const isDriver = ride.driverId === userId;
  const userBooking = ride.userBooking;
  const canChat = isDriver || !!userBooking;
  const canRate = ride.status === 'completed' && canChat;
  const revieweeId = isDriver ? userBooking?.passenger?._id : ride.driverId;
  const sections = [
    { id: "details", name: "Ride Details", icon: "📋" },
    { id: "bookings", name: "Bookings", icon: "🎫", show: isDriver },
    { id: "chat", name: "Messages", icon: "💬", show: canChat },
    { id: "rating", name: "Rating", icon: "⭐", show: canRate }
  ].filter(section => section.show !== false);

  return (
    <>
      {/* Animated Background */}
      <div className="ride-details-background">
        <div className="floating-details">🚙</div>
        <div className="floating-chat">💭</div>
        <div className="energy-orb orb-1"></div>
        <div className="energy-orb orb-2"></div>
      </div>

      <div className={`ride-details-container ${isLoaded ? 'loaded' : ''}`}>
        <div className="ride-details-glass">
          {/* Header */}
          <div className="ride-header">
            <div className="header-content">
              <h1 className="main-title">Ride <span className="gradient-text">Details</span></h1>
              <div className="route-display">
                <span className="from">{ride.from || "Unknown"}</span>
                <div className="route-line">
                  <div className="route-dots">
                    {ride.stops?.map((stop, index) => (
                      <div key={index} className="route-dot" title={stop}>
                        •
                      </div>
                    ))}
                  </div>
                </div>
                <span className="to">{ride.to || "Unknown"}</span>
              </div>
              <p className="subtitle">
                {ride.date ? new Date(ride.date).toLocaleDateString() : "N/A"} at {ride.time || "N/A"} • ${ride.pricePerSeat ?? 0}/seat • Status: {ride.status || "upcoming"}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              {!isDriver && !userBooking && ride.status === 'upcoming' && (
                <button
                  onClick={() => setShowModal(true)}
                  disabled={ride.seatsAvailable === 0}
                  className={`action-btn primary ${ride.seatsAvailable === 0 ? 'disabled' : ''}`}
                >
                  {ride.seatsAvailable === 0 ? "🚫 Full" : "🎫 Book Ride"}
                </button>
              )}
              {isDriver && ride.status === 'upcoming' && (
                <button
                  onClick={() => setEditing(!editing)}
                  className="action-btn secondary"
                >
                  {editing ? "❌ Cancel Edit" : "✏️ Edit Ride"}
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="details-navigation">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`nav-tab ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="tab-icon">{section.icon}</span>
                {section.name}
              </button>
            ))}
          </div>

          {/* Content Sections */}
          <div className="details-content">
            {/* Ride Details Section */}
            {activeSection === "details" && (
              <div className="content-section active">
                {editing ? (
                  <form onSubmit={handleEditSubmit} className="edit-form-glass">
                    <div className="form-section">
                      <h3 className="section-title">✏️ Edit Ride Information</h3>

                      {/* Vehicle Information */}
                      <div className="form-subsection">
                        <h4>🚗 Vehicle Details</h4>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Make</label>
                            <input
                              name="vehicle.make"
                              value={editForm.vehicle?.make || ""}
                              onChange={handleEditChange}
                              className="glass-input"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Model</label>
                            <input
                              name="vehicle.model"
                              value={editForm.vehicle?.model || ""}
                              onChange={handleEditChange}
                              className="glass-input"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>License Plate</label>
                            <input
                              name="vehicle.licensePlate"
                              value={editForm.vehicle?.licensePlate || ""}
                              onChange={handleEditChange}
                              className="glass-input"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Car Type</label>
                            <select
                              name="vehicle.carType"
                              value={editForm.vehicle?.carType || ""}
                              onChange={handleEditChange}
                              className="glass-input"
                              required
                            >
                              <option value="" disabled>Select car type</option>
                              <option value="Sedan">Sedan</option>
                              <option value="SUV">SUV</option>
                              <option value="Hatchback">Hatchback</option>
                              <option value="Van">Van</option>
                              <option value="Electric">Electric</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Total Seats</label>
                            <input
                              type="number"
                              name="vehicle.totalSeats"
                              value={editForm.vehicle?.totalSeats || ""}
                              onChange={handleEditChange}
                              min="1"
                              className="glass-input"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Fuel Type</label>
                            <select
                              name="vehicle.fuelType"
                              value={editForm.vehicle?.fuelType || ""}
                              onChange={handleEditChange}
                              className="glass-input"
                              required
                            >
                              <option value="" disabled>Select fuel type</option>
                              <option value="Petrol">Petrol</option>
                              <option value="Diesel">Diesel</option>
                              <option value="Electric">Electric</option>
                              <option value="Hybrid">Hybrid</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Trip Details */}
                      <div className="form-subsection">
                        <h4>📍 Trip Information</h4>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>From</label>
                            <input
                              name="from"
                              value={editForm.from || ""}
                              onChange={handleEditChange}
                              className="glass-input"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>To</label>
                            <input
                              name="to"
                              value={editForm.to || ""}
                              onChange={handleEditChange}
                              className="glass-input"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Date</label>
                            <input
                              type="date"
                              name="date"
                              value={editForm.date || ""}
                              onChange={handleEditChange}
                              className="glass-input"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Time</label>
                            <input
                              type="time"
                              name="time"
                              value={editForm.time || ""}
                              onChange={handleEditChange}
                              className="glass-input"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Seats Available</label>
                            <input
                              type="number"
                              name="seatsAvailable"
                              value={editForm.seatsAvailable || ""}
                              onChange={handleEditChange}
                              min="1"
                              className="glass-input"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Price per Seat ($)</label>
                            <input
                              type="number"
                              name="pricePerSeat"
                              value={editForm.pricePerSeat || ""}
                              onChange={handleEditChange}
                              min="0"
                              step="0.01"
                              className="glass-input"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className="form-subsection">
                        <h4>⚙️ Ride Preferences</h4>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Luggage Space</label>
                            <select
                              name="luggageSpace"
                              value={editForm.luggageSpace || "None"}
                              onChange={handleEditChange}
                              className="glass-input"
                            >
                              <option value="None">None</option>
                              <option value="Small">Small (backpack)</option>
                              <option value="Medium">Medium (suitcase)</option>
                              <option value="Large">Large (multiple)</option>
                            </select>
                          </div>
                          <div className="checkbox-group">
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                name="smokingAllowed"
                                checked={editForm.smokingAllowed}
                                onChange={handleEditChange}
                                className="checkbox-input"
                              />
                              <span className="checkbox-custom"></span>
                              Smoking Allowed
                            </label>
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                name="petsAllowed"
                                checked={editForm.petsAllowed}
                                onChange={handleEditChange}
                                className="checkbox-input"
                              />
                              <span className="checkbox-custom"></span>
                              Pets Allowed
                            </label>
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                name="carbonOffset"
                                checked={editForm.carbonOffset}
                                onChange={handleEditChange}
                                className="checkbox-input"
                              />
                              <span className="checkbox-custom"></span>
                              Carbon Offset
                            </label>
                          </div>
                        </div>
                        <div className="form-group full-width">
                          <label>Additional Notes</label>
                          <textarea
                            name="additionalNotes"
                            value={editForm.additionalNotes || ""}
                            onChange={handleEditChange}
                            className="glass-input textarea"
                            rows="4"
                          />
                        </div>
                      </div>

                      {/* Stops Section */}
                      <div className="stops-section">
                        <label className="section-label">
                          <span className="label-icon">🛑</span>
                          Intermediate Stops (Optional)
                        </label>
                        {editForm.stops.map((stop, index) => (
                          <div key={index} className="stop-item">
                            <input
                              value={stop}
                              onChange={(e) => handleStopChange(index, e.target.value)}
                              placeholder={`Stop ${index + 1}`}
                              className="glass-input"
                            />
                            <button
                              type="button"
                              onClick={() => removeStop(index)}
                              className="remove-stop-btn"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addStop}
                          className="add-stop-btn"
                        >
                          + Add Stop
                        </button>
                      </div>

                      {error && <div className="error-message">{error}</div>}
                      <button type="submit" className="submit-btn">
                        💾 Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="details-grid">
                    {/* Vehicle Card */}
                    <div className="detail-card">
                      <div className="card-header">
                        <h3>🚗 Vehicle Information</h3>
                        <div className="card-badge">Driver: {ride.driver?.name || "Unknown"}</div>
                      </div>
                      <div className="card-content">
                        <div className="detail-row">
                          <span className="detail-label">Make & Model</span>
                          <span className="detail-value">{ride.vehicle?.make || "N/A"} {ride.vehicle?.model || ""}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">License Plate</span>
                          <span className="detail-value">{ride.vehicle?.licensePlate || "N/A"}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Car Type</span>
                          <span className="detail-value">{ride.vehicle?.carType || "N/A"}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Total Seats</span>
                          <span className="detail-value">{ride.vehicle?.totalSeats || "N/A"}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Fuel Type</span>
                          <span className="detail-value">{ride.vehicle?.fuelType || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Trip Card */}
                    <div className="detail-card">
                      <div className="card-header">
                        <h3>📍 Trip Details</h3>
                        <div className="card-badge">{ride.seatsAvailable ?? "N/A"} seats left</div>
                      </div>
                      <div className="card-content">
                        <div className="detail-row">
                          <span className="detail-label">Route</span>
                          <span className="detail-value route">{ride.from || "Unknown"} → {ride.to || "Unknown"}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Date & Time</span>
                          <span className="detail-value">{ride.date ? new Date(ride.date).toLocaleDateString() : "N/A"} at {ride.time || "N/A"}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Price</span>
                          <span className="detail-value price">${ride.pricePerSeat ?? 0} per seat</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Distance</span>
                          <span className="detail-value">{ride.distance ? `${ride.distance} km` : "N/A"}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Duration</span>
                          <span className="detail-value">{ride.estimatedDuration || "N/A"}</span>
                        </div>
                        {ride.stops?.length > 0 && (
                          <div className="detail-row">
                            <span className="detail-label">Stops</span>
                            <span className="detail-value stops">{ride.stops.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preferences Card */}
                    <div className="detail-card">
                      <div className="card-header">
                        <h3>⚙️ Ride Preferences</h3>
                        <div className="card-badge eco">🌱 Eco Ride</div>
                      </div>
                      <div className="card-content">
                        <div className="detail-row">
                          <span className="detail-label">Luggage Space</span>
                          <span className="detail-value">{ride.luggageSpace || "None"}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Smoking</span>
                          <span className="detail-value">{ride.smokingAllowed ? "✅ Allowed" : "❌ Not Allowed"}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Pets</span>
                          <span className="detail-value">{ride.petsAllowed ? "✅ Allowed" : "❌ Not Allowed"}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Carbon Offset</span>
                          <span className="detail-value">
                            {ride.carbonOffset ? "✅ Committed" : "❌ Not Committed"}
                            {ride.carbonOffset && (
                              <a href="https://green-trail-27d683.netlify.app/track" target="_blank" rel="noopener noreferrer" className="eco-link">
                                Calculate Emissions
                              </a>
                            )}
                          </span>
                        </div>
                        {ride.additionalNotes && (
                          <div className="detail-row">
                            <span className="detail-label">Notes</span>
                            <span className="detail-value notes">{ride.additionalNotes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Passengers Card */}
                    <div className="detail-card">
                      <div className="card-header">
                        <h3>👥 Confirmed Passengers</h3>
                        <div className="card-badge">{ride.passengers?.length || 0} confirmed</div>
                      </div>
                      <div className="card-content">
                        {ride.passengers?.length > 0 ? (
                          <div className="passengers-list">
                            {ride.passengers.map((passenger, index) => (
                              <div key={index} className="passenger-item">
                                <span className="passenger-avatar">👤</span>
                                <span className="passenger-name">{passenger.name || "Unknown"}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="empty-passengers">
                            <span className="empty-icon">👥</span>
                            <p>No confirmed passengers yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bookings Management Section */}
            {activeSection === "bookings" && isDriver && (
              <div className="content-section active">
                <div className="section-header">
                  <h3>🎫 Booking Requests</h3>
                  <p>Manage passenger requests for your ride</p>
                </div>
                {bookings.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🎫</div>
                    <h4>No Booking Requests</h4>
                    <p>Booking requests will appear here when passengers request to join your ride.</p>
                  </div>
                ) : (
                  <div className="bookings-grid">
                    {bookings.map((booking) => (
                      <div key={booking._id} className="booking-card">
                        <div className="booking-header">
                          <div className="passenger-info">
                            <div className="passenger-avatar">👤</div>
                            <div>
                              <h4>{booking.passenger?.name || "Unknown"}</h4>
                              <p>{booking.passenger?.email || "N/A"}</p>
                            </div>
                          </div>
                          <div className={`status-badge ${booking.status.toLowerCase()}`}>
                            {booking.status}
                          </div>
                        </div>
                        <div className="booking-details">
                          <div className="booking-stat">
                            <span className="stat-label">Seats Requested</span>
                            <span className="stat-value">{booking.seatsBooked}</span>
                          </div>
                          <div className="booking-stat">
                            <span className="stat-label">Total Cost</span>
                            <span className="stat-value">${(booking.seatsBooked * ride.pricePerSeat).toFixed(2)}</span>
                          </div>
                          {booking.cancellationReason && (
                            <div className="booking-stat">
                              <span className="stat-label">Reason</span>
                              <span className="stat-value">{booking.cancellationReason}</span>
                            </div>
                          )}
                        </div>
                        {booking.status === "pending" && (
                          <div className="booking-actions">
                            <button
                              onClick={() => handleBookingAction(booking._id, "confirmed")}
                              className="action-btn confirm"
                            >
                              ✅ Confirm
                            </button>
                            <button
                              onClick={() => handleBookingAction(booking._id, "rejected")}
                              className="action-btn reject"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        )}
                        {booking.status !== "cancelled" && booking.status !== "rejected" && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="action-btn cancel"
                          >
                            🚫 Cancel Booking
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chat Section */}
            {activeSection === "chat" && canChat && (
              <div className="content-section active">
                <div className="section-header">
                  <h3>💬 Ride Chat</h3>
                  <p>Discuss details with {isDriver ? "passengers" : "driver and passengers"}</p>
                </div>
                <Chat rideId={id} initialMessages={messages} />
              </div>
            )}

            {/* Rating Section */}
            {activeSection === "rating" && canRate && (
              <div className="content-section active">
                <div className="section-header">
                  <h3>⭐ Rate This Ride</h3>
                  <p>Share your experience with {isDriver ? "the passenger" : "the driver"}</p>
                </div>
                <div className="rating-container">
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`star-btn ${rating >= star ? 'active' : ''}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <div className="rating-value">
                    {rating > 0 && <span>{rating} out of 5 stars</span>}
                  </div>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share your experience... (optional)"
                    className="review-input"
                    rows="4"
                  />
                  <button
                    onClick={() => handleSubmitRating(revieweeId)}
                    disabled={!rating}
                    className="submit-rating-btn"
                  >
                    📨 Submit Rating
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && !isDriver && (
        <BookingModal
          ride={ride}
          onClose={() => setShowModal(false)}
          onBookingSuccess={() => {
            fetchRide();
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}

export default RideDetails;
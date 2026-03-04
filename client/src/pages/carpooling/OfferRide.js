import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./OfferRide.css";

function OfferRide() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    vehicle: {
      make: "",
      model: "",
      licensePlate: "",
      carType: "",
      totalSeats: "",
      fuelType: ""
    },
    from: "",
    to: "",
    date: "",
    time: "",
    seatsAvailable: "",
    pricePerSeat: "",
    distance: "",
    estimatedDuration: "",
    stops: [],
    luggageSpace: "None",
    smokingAllowed: false,
    petsAllowed: false,
    additionalNotes: "",
    carbonOffset: false
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("vehicle.")) {
      setForm({
        ...form,
        vehicle: { ...form.vehicle, [name.split(".")[1]]: value }
      });
    } else if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleStopChange = (index, value) => {
    const newStops = [...form.stops];
    newStops[index] = value;
    setForm({ ...form, stops: newStops });
  };

  const addStop = () => {
    setForm({ ...form, stops: [...form.stops, ""] });
  };

  const removeStop = (index) => {
    setForm({ ...form, stops: form.stops.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Client-side validation
    if (!form.vehicle.make || !form.vehicle.model || !form.vehicle.licensePlate) {
      setError("All vehicle fields are required");
      setLoading(false);
      return;
    }
    if (!form.vehicle.carType || !form.vehicle.totalSeats || !form.vehicle.fuelType) {
      setError("Car type, total seats, and fuel type are required");
      setLoading(false);
      return;
    }
    if (!form.from || !form.to || !form.date || !form.time) {
      setError("All trip details are required");
      setLoading(false);
      return;
    }
    if (!form.seatsAvailable || form.seatsAvailable < 1) {
      setError("Seats available must be at least 1");
      setLoading(false);
      return;
    }
    if (form.seatsAvailable > form.vehicle.totalSeats) {
      setError("Seats available cannot exceed total seats");
      setLoading(false);
      return;
    }
    if (form.pricePerSeat === "" || form.pricePerSeat < 0) {
      setError("Price per seat must be non-negative");
      setLoading(false);
      return;
    }
    if (form.distance && form.distance < 0) {
      setError("Distance must be non-negative");
      setLoading(false);
      return;
    }

    try {
      await api.post("/rides/offer", form);
      alert("Ride offered successfully!");
      navigate("/my-trips");
    } catch (err) {
      console.error("Error offering ride:", err.message, err.response?.data);
      setError(err.response?.data?.error || "Error offering ride");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const steps = [
    { number: 1, title: "Vehicle", icon: "🚗" },
    { number: 2, title: "Trip", icon: "📍" },
    { number: 3, title: "Preferences", icon: "⚙️" },
    { number: 4, title: "Review", icon: "👁️" }
  ];

  return (
    <>
      
      {/* Animated Background */}
      <div className="offer-ride-background">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className={`offer-ride-container ${isLoaded ? 'loaded' : ''}`}>
        <div className="offer-ride-glass">
          {/* Header */}
          <div className="offer-ride-header">
            <div className="header-content">
              <h1 className="main-title">
                Offer a <span className="gradient-text">Ride</span>
              </h1>
              <p className="subtitle">Share your journey and make travel sustainable</p>
            </div>
            
            {/* Progress Steps */}
            <div className="progress-steps">
              {steps.map((step) => (
                <div key={step.number} className="step-item">
                  <div className={`step-circle ${currentStep >= step.number ? 'active' : ''}`}>
                    <span className="step-icon">{step.icon}</span>
                    <div className="step-check">✓</div>
                  </div>
                  <span className="step-title">{step.title}</span>
                  {step.number < steps.length && (
                    <div className="step-connector"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="offer-ride-form">
            {/* Step 1: Vehicle Information */}
            {currentStep === 1 && (
              <div className="form-step active">
                <div className="step-header">
                  <h2>Vehicle Information</h2>
                  <p>Tell us about your vehicle</p>
                </div>
                
                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label">
                      <span className="label-icon">🏭</span>
                      Make
                    </label>
                    <input
                      name="vehicle.make"
                      placeholder="e.g., Toyota"
                      value={form.vehicle.make}
                      onChange={handleChange}
                      className="glass-input"
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">
                      <span className="label-icon">🚙</span>
                      Model
                    </label>
                    <input
                      name="vehicle.model"
                      placeholder="e.g., Corolla"
                      value={form.vehicle.model}
                      onChange={handleChange}
                      className="glass-input"
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">
                      <span className="label-icon">📄</span>
                      License Plate
                    </label>
                    <input
                      name="vehicle.licensePlate"
                      placeholder="e.g., ABC-1234"
                      value={form.vehicle.licensePlate}
                      onChange={handleChange}
                      className="glass-input"
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">
                      <span className="label-icon">🚘</span>
                      Car Type
                    </label>
                    <select
                      name="vehicle.carType"
                      value={form.vehicle.carType}
                      onChange={handleChange}
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
                  
                  <div className="input-group">
                    <label className="input-label">
                      <span className="label-icon">💺</span>
                      Total Seats
                    </label>
                    <input
                      type="number"
                      name="vehicle.totalSeats"
                      placeholder="e.g., 5"
                      value={form.vehicle.totalSeats}
                      onChange={handleChange}
                      min="1"
                      className="glass-input"
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">
                      <span className="label-icon">⛽</span>
                      Fuel Type
                    </label>
                    <select
                      name="vehicle.fuelType"
                      value={form.vehicle.fuelType}
                      onChange={handleChange}
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
            )}

            {/* Step 2: Trip Details */}
            {currentStep === 2 && (
              <div className="form-step active">
                <div className="step-header">
                  <h2>Trip Details</h2>
                  <p>Where are you going?</p>
                </div>
                
                <div className="form-grid">
                  <div className="input-group">
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
                  
                  <div className="input-group">
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
                  
                  <div className="input-group">
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
                  
                  <div className="input-group">
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
                  
                  <div className="input-group">
                    <label className="input-label">
                      <span className="label-icon">👥</span>
                      Seats Available
                    </label>
                    <input
                      type="number"
                      name="seatsAvailable"
                      placeholder="e.g., 3"
                      value={form.seatsAvailable}
                      onChange={handleChange}
                      min="1"
                      className="glass-input"
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">
                      <span className="label-icon">💰</span>
                      Price per Seat ($)
                    </label>
                    <input
                      type="number"
                      name="pricePerSeat"
                      placeholder="e.g., 10"
                      value={form.pricePerSeat}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="glass-input"
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">
                      <span className="label-icon">📏</span>
                      Estimated Distance (km)
                    </label>
                    <input
                      type="number"
                      name="distance"
                      placeholder="e.g., 100"
                      value={form.distance}
                      onChange={handleChange}
                      min="0"
                      className="glass-input"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">
                      <span className="label-icon">⏱️</span>
                      Estimated Duration
                    </label>
                    <input
                      name="estimatedDuration"
                      placeholder="e.g., 2 hours 30 minutes"
                      value={form.estimatedDuration}
                      onChange={handleChange}
                      className="glass-input"
                    />
                  </div>
                </div>

                {/* Stops Section */}
                <div className="stops-section">
                  <label className="section-label">
                    <span className="label-icon">🛑</span>
                    Intermediate Stops (Optional)
                  </label>
                  {form.stops.map((stop, index) => (
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
              </div>
            )}

            {/* Step 3: Ride Preferences */}
            {currentStep === 3 && (
              <div className="form-step active">
                <div className="step-header">
                  <h2>Ride Preferences</h2>
                  <p>Set your ride rules and preferences</p>
                </div>
                
                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label">
                      <span className="label-icon">🎒</span>
                      Luggage Space
                    </label>
                    <select
                      name="luggageSpace"
                      value={form.luggageSpace}
                      onChange={handleChange}
                      className="glass-input"
                    >
                      <option value="None">None</option>
                      <option value="Small">Small (e.g., backpack)</option>
                      <option value="Medium">Medium (e.g., suitcase)</option>
                      <option value="Large">Large (e.g., multiple suitcases)</option>
                    </select>
                  </div>
                  
                  <div className="checkbox-group">
                    <div className="checkbox-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="smokingAllowed"
                          checked={form.smokingAllowed}
                          onChange={handleChange}
                          className="checkbox-input"
                        />
                        <span className="checkbox-custom"></span>
                        <span className="checkbox-text">🚭 Smoking Allowed</span>
                      </label>
                    </div>
                    
                    <div className="checkbox-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="petsAllowed"
                          checked={form.petsAllowed}
                          onChange={handleChange}
                          className="checkbox-input"
                        />
                        <span className="checkbox-custom"></span>
                        <span className="checkbox-text">🐾 Pets Allowed</span>
                      </label>
                    </div>
                    
                    <div className="checkbox-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="carbonOffset"
                          checked={form.carbonOffset}
                          onChange={handleChange}
                          className="checkbox-input"
                        />
                        <span className="checkbox-custom"></span>
                        <span className="checkbox-text">🌱 Carbon Offset</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="input-group full-width">
                    <label className="input-label">
                      <span className="label-icon">📝</span>
                      Additional Notes
                    </label>
                    <textarea
                      name="additionalNotes"
                      placeholder="e.g., AC preferred, music on, conversation preferences..."
                      value={form.additionalNotes}
                      onChange={handleChange}
                      className="glass-input textarea"
                      rows="4"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="form-step active">
                <div className="step-header">
                  <h2>Review Your Ride</h2>
                  <p>Double-check everything before submitting</p>
                </div>
                
                <div className="review-section">
                  <div className="review-card">
                    <h3>🚗 Vehicle Information</h3>
                    <div className="review-grid">
                      <div className="review-item">
                        <span>Make & Model:</span>
                        <span>{form.vehicle.make} {form.vehicle.model}</span>
                      </div>
                      <div className="review-item">
                        <span>License Plate:</span>
                        <span>{form.vehicle.licensePlate}</span>
                      </div>
                      <div className="review-item">
                        <span>Car Type:</span>
                        <span>{form.vehicle.carType}</span>
                      </div>
                      <div className="review-item">
                        <span>Total Seats:</span>
                        <span>{form.vehicle.totalSeats}</span>
                      </div>
                      <div className="review-item">
                        <span>Fuel Type:</span>
                        <span>{form.vehicle.fuelType}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="review-card">
                    <h3>📍 Trip Details</h3>
                    <div className="review-grid">
                      <div className="review-item">
                        <span>Route:</span>
                        <span>{form.from} → {form.to}</span>
                      </div>
                      <div className="review-item">
                        <span>Date & Time:</span>
                        <span>{form.date} at {form.time}</span>
                      </div>
                      <div className="review-item">
                        <span>Seats Available:</span>
                        <span>{form.seatsAvailable}</span>
                      </div>
                      <div className="review-item">
                        <span>Price per Seat:</span>
                        <span>${form.pricePerSeat}</span>
                      </div>
                      {form.stops.length > 0 && (
                        <div className="review-item">
                          <span>Stops:</span>
                          <span>{form.stops.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="review-card">
                    <h3>⚙️ Preferences</h3>
                    <div className="review-grid">
                      <div className="review-item">
                        <span>Luggage Space:</span>
                        <span>{form.luggageSpace}</span>
                      </div>
                      <div className="review-item">
                        <span>Smoking Allowed:</span>
                        <span>{form.smokingAllowed ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="review-item">
                        <span>Pets Allowed:</span>
                        <span>{form.petsAllowed ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="review-item">
                        <span>Carbon Offset:</span>
                        <span>{form.carbonOffset ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="form-navigation">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="nav-btn secondary"
                >
                  ← Previous
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="nav-btn primary"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={`submit-btn ${loading ? 'loading' : ''}`}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Offering Ride...
                    </>
                  ) : (
                    '🚀 Offer Ride'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default OfferRide;
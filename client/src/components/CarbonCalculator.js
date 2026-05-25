import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from './DatePicker';
import TransportForm from './TransportForm';
import HouseForm from './HouseForm';
import LifestyleForm from './LifestyleForm';
import ResultsPage from './ResultsPage';
import { Container, Form, ButtonGroup, ToggleButton } from 'react-bootstrap';
import { FaCar, FaHome, FaLeaf, FaTrophy, FaCalculator, FaCalendarAlt, FaInfoCircle, FaSearchPlus } from 'react-icons/fa';
import './CarbonCalculator.css';

const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000'

const CarbonCalculator = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [inputMode, setInputMode] = useState('exact'); 

  const [transportData, setTransportData] = useState({ distance: 0, transportType: 'petrol', vehicles: [] });
  const [houseData, setHouseData] = useState({ electricityUsage: 0, lpgUsage: 0, renewableEnergy: 'none' });
  const [lifestyleData, setLifestyleData] = useState({ diet: 'vegetarian', clothingPurchases: 0, screenTime: 0 });
  const [carbonFootprint, setCarbonFootprint] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  const isCorporate = userRole === 'corporate';
  const today = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  })();

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/challenges/`);
        setChallenges(response.data);
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };
    if (!isCorporate) fetchChallenges();
  }, [isCorporate]);

  let daysSelected = 0;
  let prorateFactor = 1;

  if (fromDate && toDate) {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (start <= end && start <= new Date(today) && end <= new Date(today)) {
      const timeDiff = end.getTime() - start.getTime();
      daysSelected = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; 
      if (inputMode === 'monthly') prorateFactor = daysSelected / 30;
    }
  }

  const calculateCarbonFootprint = async () => {
    setIsLoading(true);
    try {
      if (!fromDate || !toDate) {
        alert("Please select a date range.");
        setIsLoading(false); return;
      }
      if (new Date(toDate) > new Date(today) || new Date(fromDate) > new Date(today)) {
        alert("You cannot calculate footprints for future dates.");
        setIsLoading(false); return;
      }
      if (new Date(fromDate) > new Date(toDate)) {
        alert("The 'From' date cannot be after the 'To' date.");
        setIsLoading(false); return;
      }

      if (!transportData.vehicles || transportData.vehicles.length === 0) {
        alert("🚗 Wait! You selected a vehicle from the dropdown, but you forgot to click the 'Add Vehicle' button below it. Please add your travel method before calculating!");
        setIsLoading(false);
        return;
      }

      const effectiveElectricity = houseData.electricityUsage * prorateFactor;
      const effectiveLpg = houseData.lpgUsage * prorateFactor;
      const effectiveClothing = lifestyleData.clothingPurchases * prorateFactor;
      const effectiveScreenTime = lifestyleData.screenTime * prorateFactor; 

      const transportCarbon = (transportData.vehicles || []).reduce(
        (sum, entry) => sum + (entry.distanceMid * entry.emissionFactor), 0
      );
      
      // FIX: Explicitly parse each distanceMid as a float
      const calculatedTransportKm = (transportData.vehicles || []).reduce(
        (sum, v) => sum + parseFloat(v.distanceMid || 0), 0
      );

      const electricityCarbon = effectiveElectricity * 0.85;
      const lpgCarbon = effectiveLpg * 2.98;

      const renewableReduction = { solar: 0.5, wind: 0.7, hydro: 0.6 };
      const renewableFactor = renewableReduction[houseData.renewableEnergy] || 1;
      const houseCarbon = (electricityCarbon + lpgCarbon) * renewableFactor;

      const dietFactors = { vegetarian: 1.0, non_vegetarian: 2.5, vegan: 0.8, pescatarian: 1.5 };
      const foodCarbon = (dietFactors[lifestyleData.diet] || 1.0) * daysSelected;

      const clothingCarbon = effectiveClothing * 5;
      const techCarbon = effectiveScreenTime * 0.1;
      const lifestyleCarbon = foodCarbon + clothingCarbon + techCarbon;

      const totalFootprint = Number((transportCarbon + houseCarbon + lifestyleCarbon).toFixed(2));
      setCarbonFootprint(totalFootprint);

      // DEBUG: See exactly what's being sent
      console.log('=== SENDING TO BACKEND ===');
      console.log('vehicles:', transportData.vehicles);
      console.log('calculatedTransportKm:', calculatedTransportKm);
      console.log('typeof calculatedTransportKm:', typeof calculatedTransportKm);

      const activityData = {
        fromDate,
        toDate,
        transportData,
        houseData,
        lifestyleData,
        carbonFootprint: totalFootprint,
        userId,
        totalTransportKm: parseFloat(calculatedTransportKm.toFixed(2)), // force number
      };

      console.log('activityData.totalTransportKm:', activityData.totalTransportKm);

      const saveResponse = await axios.post(
        `${apiBaseUrl}/api/activities/save`, 
        activityData
      );
      console.log('Save response:', saveResponse.data);

      if (selectedChallenge && !isCorporate) {
        await axios.post(`${apiBaseUrl}/api/challenges/update-progress`, {
          userId,
          challengeId: selectedChallenge,
          progress: totalFootprint,
        });
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error saving data');
    } finally {
      setIsLoading(false);
    }
  };

  const MathRow = ({ label, rawValue, unit }) => {
    if (!rawValue || rawValue <= 0) return null;
    const perDay = (rawValue / 30).toFixed(2);
    const finalValue = (rawValue * prorateFactor).toFixed(2);
    return (
      <div className="gt-math-row">
        <span className="gt-math-label">{label}</span>
        <div className="gt-math-steps-container">
          <span className="gt-math-step">{rawValue} <small>{unit}/mo</small></span>
          <span className="gt-math-arrow">→</span>
          <span className="gt-math-step text-info">{perDay} <small>{unit}/day</small></span>
          <span className="gt-math-arrow">→</span>
          <span className="gt-math-final text-success">{finalValue} <small>{unit} (for {daysSelected} days)</small></span>
        </div>
      </div>
    );
  };

  return (
    <div className="gt-calc-page-wrapper">
      <div className="gt-calc-environmental-overlay"></div>
      
      <Container className="gt-calc-container">
        <div className="gt-calc-header">
          <h1 className="gt-calc-title">
            <FaCalculator className="gt-calc-title-icon" />
            Carbon Footprint Calculator
          </h1>
          <p className="gt-calc-subtitle">Measure your environmental impact based on real usage data.</p>
        </div>

        <div className="gt-calc-grid">
          
          <div className="gt-calc-card" style={{ gridColumn: '1 / -1', borderLeft: '4px solid #3498db' }}>
            <div className="gt-calc-card-header">
              <FaInfoCircle className="gt-calc-card-icon" style={{ color: '#3498db' }} />
              <h3>Data Entry Format</h3>
            </div>
            <div className="gt-calc-card-body">
              <div className="gt-mode-selector">
                <div className={`gt-mode-card ${inputMode === 'exact' ? 'active' : ''}`} onClick={() => setInputMode('exact')}>
                  <div className="gt-mode-icon">🎯</div>
                  <div className="gt-mode-text">
                    <h4>Exact Usage</h4>
                    <p>I know the exact distance and energy I used during this specific period.</p>
                  </div>
                </div>

                <div className={`gt-mode-card ${inputMode === 'monthly' ? 'active' : ''}`} onClick={() => setInputMode('monthly')}>
                  <div className="gt-mode-icon">📅</div>
                  <div className="gt-mode-text">
                    <h4>Monthly Average</h4>
                    <p>I only know my 30-day monthly bills. Calculate the math for me.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="gt-calc-card gt-border-accent-date">
            <div className="gt-calc-card-header">
              <FaCalendarAlt className="gt-calc-card-icon" />
              <h3>Date Range</h3>
            </div>
            <div className="gt-calc-card-body">
              <DatePicker 
                fromDate={fromDate} 
                toDate={toDate} 
                onFromDateChange={setFromDate} 
                onToDateChange={setToDate}
                maxDate={today} 
              />
            </div>
          </div>

          <div className="gt-calc-card gt-border-accent-transport">
            <div className="gt-calc-card-header">
              <FaCar className="gt-calc-card-icon" />
              <h3>Transportation</h3>
            </div>
            <div className="gt-calc-card-body">
              <TransportForm transportData={transportData} setTransportData={setTransportData} />
            </div>
          </div>

          <div className="gt-calc-card gt-border-accent-house">
            <div className="gt-calc-card-header">
              <FaHome className="gt-calc-card-icon" />
              <h3>Household</h3>
            </div>
            <div className="gt-calc-card-body">
              <HouseForm houseData={houseData} setHouseData={setHouseData} />
            </div>
          </div>

          <div className="gt-calc-card gt-border-accent-lifestyle">
            <div className="gt-calc-card-header">
              <FaLeaf className="gt-calc-card-icon" />
              <h3>Lifestyle</h3>
            </div>
            <div className="gt-calc-card-body">
              <LifestyleForm lifestyleData={lifestyleData} setLifestyleData={setLifestyleData} />
            </div>
          </div>

          {!isCorporate && (
            <div className="gt-calc-card gt-border-accent-challenge">
              <div className="gt-calc-card-header">
                <FaTrophy className="gt-calc-card-icon" />
                <h3>Challenges</h3>
              </div>
              <div className="gt-calc-card-body">
                <Form.Select 
                  value={selectedChallenge} 
                  onChange={(e) => setSelectedChallenge(e.target.value)}
                  className="gt-calc-challenge-select"
                >
                  <option value="">Select a Challenge (Optional)</option>
                  {challenges.map((challenge) => (
                    <option key={challenge._id} value={challenge._id}>
                      {challenge.title} (Goal: {challenge.goal} kg CO₂)
                    </option>
                  ))}
                </Form.Select>
              </div>
            </div>
          )}

          {inputMode === 'monthly' && daysSelected > 0 && (
            <div className="gt-calc-card gt-math-breakdown-card" style={{ gridColumn: '1 / -1', borderLeft: '4px solid #f39c12' }}>
              <div className="gt-calc-card-header">
                <FaSearchPlus className="gt-calc-card-icon" style={{ color: '#f39c12' }} />
                <h3>Live Algorithm Conversion</h3>
              </div>
              <div className="gt-calc-card-body">
                <p className="text-muted mb-4">
                  You selected a <strong>{daysSelected}-day</strong> period. Here is exactly how our engine is scaling your monthly inputs for maximum accuracy:
                </p>
                <div className="gt-math-table">
                  {transportData.vehicles && transportData.vehicles.length > 0 && (
                    <div className="gt-math-row">
                      <span className="gt-math-label">Transportation</span>
                      <div className="gt-math-steps-container">
                        <span className="gt-math-step text-info">{transportData.vehicles.length} vehicle(s) logged</span>
                        <span className="gt-math-arrow">→</span>
                        <span className="gt-math-final text-success">
                          {transportData.vehicles.reduce((s, e) => s + (e.distanceMid || 0), 0).toFixed(2)} <small>km</small>
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <MathRow label="Electricity" rawValue={houseData.electricityUsage} unit="kWh" />
                  <MathRow label="LPG Gas" rawValue={houseData.lpgUsage} unit="kg" />
                  <MathRow label="Screen Time" rawValue={lifestyleData.screenTime} unit="hrs" />
                  <MathRow label="Clothing" rawValue={lifestyleData.clothingPurchases} unit="items" />
                </div>
              </div>
            </div>
          )}

          <div className="gt-calc-button-container" style={{ gridColumn: '1 / -1' }}>
            <button 
              className="gt-calc-submit-btn w-100"
              onClick={calculateCarbonFootprint}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="gt-calc-spinner">
                  <div className="gt-calc-leaf">🌱</div>
                </div>
              ) : (
                'Calculate My Footprint'
              )}
            </button>
          </div>

          {carbonFootprint !== null && (
            <div className="gt-calc-card gt-calc-results-card gt-border-accent-results" style={{ gridColumn: '1 / -1' }}>
              <div className="gt-calc-card-header">
                <h3>Your Results</h3>
              </div>
              <div className="gt-calc-card-body">
                <ResultsPage carbonFootprint={carbonFootprint} />
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default CarbonCalculator;
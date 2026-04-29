import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from './DatePicker';
import TransportForm from './TransportForm';
import HouseForm from './HouseForm';
import LifestyleForm from './LifestyleForm';
import ResultsPage from './ResultsPage';
import { Button, Container, Form } from 'react-bootstrap';
import { FaCar, FaHome, FaLeaf, FaTrophy, FaCalculator, FaCalendarAlt } from 'react-icons/fa';
import './CarbonCalculator.css';

const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000'

const CarbonCalculator = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transportData, setTransportData] = useState({ distance: 0, transportType: 'petrol' });
  const [houseData, setHouseData] = useState({ electricityUsage: 0, lpgUsage: 0, renewableEnergy: 'none' });
  const [lifestyleData, setLifestyleData] = useState({ diet: 'vegetarian', clothingPurchases: 0, screenTime: 0 });
  const [carbonFootprint, setCarbonFootprint] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/challenges/`);
        setChallenges(response.data);
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };
    fetchChallenges();
  }, []);

  const calculateCarbonFootprint = async () => {
    setIsLoading(true);
    
    try {
      if (transportData.distance < 0 || houseData.electricityUsage < 0 || houseData.lpgUsage < 0) {
        alert("Values cannot be negative. Please enter valid inputs.");
        setIsLoading(false);
        return;
      }

      // Added two_wheeler factor here
      const emissionFactors = {
        petrol: 0.21, diesel: 0.24, cng: 0.07,
        two_wheeler: 0.09, 
        bus: 0.03, train: 0.01, flight_short: 0.15, 
        flight_long: 0.20, bicycle: 0, walking: 0
      };

      const transportCarbon = transportData.distance > 0 ? 
        transportData.distance * (emissionFactors[transportData.transportType] || 0) : 0;

      const electricityCarbon = houseData.electricityUsage * 0.85;
      const lpgCarbon = houseData.lpgUsage * 2.98;

      const renewableReduction = { solar: 0.5, wind: 0.7, hydro: 0.6 };
      const renewableFactor = renewableReduction[houseData.renewableEnergy] || 1;
      const houseCarbon = (electricityCarbon + lpgCarbon) * renewableFactor;

      const dietFactors = { vegetarian: 1.0, non_vegetarian: 2.5, vegan: 0.8, pescatarian: 1.5 };
      const foodCarbon = dietFactors[lifestyleData.diet] || 1.0;

      const clothingCarbon = lifestyleData.clothingPurchases * 5;
      const techCarbon = lifestyleData.screenTime * 0.1;
      const lifestyleCarbon = foodCarbon + clothingCarbon + techCarbon;

      const totalFootprint = transportCarbon + houseCarbon + lifestyleCarbon;
      setCarbonFootprint(totalFootprint);

      const activityData = {
        fromDate: fromDate || new Date().toISOString(),
        toDate: toDate || new Date().toISOString(),
        transportData: { 
          distance: transportData.distance || 0, 
          transportType: transportData.transportType || "petrol" 
        },
        houseData: { 
          electricityUsage: houseData.electricityUsage || 0, 
          lpgUsage: houseData.lpgUsage || 0, 
          renewableEnergy: houseData.renewableEnergy || "none" 
        },
        lifestyleData: { 
          diet: lifestyleData.diet || "vegetarian", 
          clothingPurchases: lifestyleData.clothingPurchases || 0, 
          screenTime: lifestyleData.screenTime || 0 
        },
        carbonFootprint: totalFootprint || 0,
        userId
      };

      await axios.post(`${apiBaseUrl}/api/activities/save`, activityData);

      if (selectedChallenge) {
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

  return (
    <div className="gt-calc-page-wrapper">
      <div className="gt-calc-environmental-overlay"></div>
      
      <Container className="gt-calc-container">
        <div className="gt-calc-header">
          <h1 className="gt-calc-title">
            <FaCalculator className="gt-calc-title-icon" />
            Carbon Footprint Calculator
          </h1>
          <p className="gt-calc-subtitle">Measure your environmental impact and discover ways to reduce it.</p>
        </div>

        <div className="gt-calc-grid">
          {/* Date Selection */}
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
              />
            </div>
          </div>

          {/* Transportation */}
          <div className="gt-calc-card gt-border-accent-transport">
            <div className="gt-calc-card-header">
              <FaCar className="gt-calc-card-icon" />
              <h3>Transportation</h3>
            </div>
            <div className="gt-calc-card-body">
              <TransportForm transportData={transportData} setTransportData={setTransportData} />
            </div>
          </div>

          {/* Household */}
          <div className="gt-calc-card gt-border-accent-house">
            <div className="gt-calc-card-header">
              <FaHome className="gt-calc-card-icon" />
              <h3>Household</h3>
            </div>
            <div className="gt-calc-card-body">
              <HouseForm houseData={houseData} setHouseData={setHouseData} />
            </div>
          </div>

          {/* Lifestyle */}
          <div className="gt-calc-card gt-border-accent-lifestyle">
            <div className="gt-calc-card-header">
              <FaLeaf className="gt-calc-card-icon" />
              <h3>Lifestyle</h3>
            </div>
            <div className="gt-calc-card-body">
              <LifestyleForm lifestyleData={lifestyleData} setLifestyleData={setLifestyleData} />
            </div>
          </div>

          {/* Challenges */}
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

          {/* Calculate Button */}
          <div className="gt-calc-button-container">
            <button 
              className="gt-calc-submit-btn"
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

          {/* Results */}
          {carbonFootprint !== null && (
            <div className="gt-calc-card gt-calc-results-card gt-border-accent-results">
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
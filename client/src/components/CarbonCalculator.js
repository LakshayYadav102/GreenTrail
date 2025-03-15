import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from './DatePicker';
import TransportForm from './TransportForm';
import HouseForm from './HouseForm';
import LifestyleForm from './LifestyleForm';
import ResultsPage from './ResultsPage';
import { Button, Container, Card, Form } from 'react-bootstrap';

const CarbonCalculator = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transportData, setTransportData] = useState({ distance: 0, transportType: 'petrol' });
  const [houseData, setHouseData] = useState({ electricityUsage: 0, lpgUsage: 0, renewableEnergy: 'none' });
  const [lifestyleData, setLifestyleData] = useState({ diet: 'vegetarian', clothingPurchases: 0, screenTime: 0 });
  const [carbonFootprint, setCarbonFootprint] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState('');

  const userId = localStorage.getItem('userId');

  // Fetch active challenges
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/challenges/");
        setChallenges(response.data);
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };
    fetchChallenges();
  }, []);

  // Function to calculate Carbon Footprint
  const calculateCarbonFootprint = async () => {
    if (transportData.distance < 0 || houseData.electricityUsage < 0 || houseData.lpgUsage < 0) {
      alert("Values cannot be negative. Please enter valid inputs.");
      return;
    }

    // 🚗 Emission Factors (kg CO₂ per km or per unit)
    const emissionFactors = {
      petrol: 0.21, diesel: 0.24, cng: 0.07,
      bus: 0.03, train: 0.01, flight_short: 0.15, 
      flight_long: 0.20, bicycle: 0, walking: 0
    };

    // 🛣️ Transport Carbon Calculation
    const transportCarbon = transportData.distance > 0 ? transportData.distance * (emissionFactors[transportData.transportType] || 0) : 0;

    // 🏠 Household Energy Calculation
    const electricityCarbon = houseData.electricityUsage * 0.85; // 0.85 kg CO₂ per kWh (India avg.)
    const lpgCarbon = houseData.lpgUsage * 2.98; // 2.98 kg CO₂ per kg of LPG

    // ☀️ Renewable Energy Reduction
    const renewableReduction = { solar: 0.5, wind: 0.7, hydro: 0.6 };
    const renewableFactor = renewableReduction[houseData.renewableEnergy] || 1;
    const houseCarbon = (electricityCarbon + lpgCarbon) * renewableFactor;

    // 🍽️ Food Consumption Impact
    const dietFactors = { vegetarian: 1.0, non_vegetarian: 2.5, vegan: 0.8, pescatarian: 1.5 };
    const foodCarbon = dietFactors[lifestyleData.diet] || 1.0;

    // 🛍️ Clothing & Shopping Impact
    const clothingCarbon = lifestyleData.clothingPurchases * 5; // Each clothing item ~5kg CO₂

    // 📱 Technology Usage Impact
    const techCarbon = lifestyleData.screenTime * 0.1; // 0.1kg CO₂ per hour of screen time

    // ✅ Final Lifestyle Carbon Calculation
    const lifestyleCarbon = foodCarbon + clothingCarbon + techCarbon;

    // 🌍 Total Carbon Footprint
    const totalFootprint = transportCarbon + houseCarbon + lifestyleCarbon;
    setCarbonFootprint(totalFootprint);

    // Prepare Data for Submission
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

    console.log("Submitting activity data:", JSON.stringify(activityData, null, 2));

    try {
      // Save footprint activity
      await axios.post('http://localhost:5000/api/activities/save', activityData);

      // ✅ If a challenge is selected, update its progress
      if (selectedChallenge) {
        await axios.post("http://localhost:5000/api/challenges/update-progress", {
          userId,
          challengeId: selectedChallenge,
          progress: totalFootprint,
        });
      }

      alert('Data saved successfully');
    } catch (err) {
      console.error('Error saving activity:', err);
      alert('Error saving data');
    }
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4" style={{ color: '#FFD700' }}>Carbon Footprint Calculator</h1>

      {/* 📅 Date Selection */}
      <Card className="p-4 mb-4" style={{ backgroundColor: '#333', color: 'white' }}>
        <h3 style={{ color: '#FFD700' }}>Select Date</h3>
        <DatePicker fromDate={fromDate} toDate={toDate} onFromDateChange={setFromDate} onToDateChange={setToDate} />
      </Card>

      {/* 🚗 Transportation */}
      <Card className="p-4 mb-4" style={{ backgroundColor: '#333', color: 'white' }}>
        <h3 style={{ color: '#FFD700' }}>Transportation</h3>
        <TransportForm transportData={transportData} setTransportData={setTransportData} />
      </Card>

      {/* 🏠 Household */}
      <Card className="p-4 mb-4" style={{ backgroundColor: '#333', color: 'white' }}>
        <h3 style={{ color: '#FFD700' }}>Household</h3>
        <HouseForm houseData={houseData} setHouseData={setHouseData} />
      </Card>

      {/* 🌱 Lifestyle */}
      <Card className="p-4 mb-4" style={{ backgroundColor: '#333', color: 'white' }}>
        <h3 style={{ color: '#FFD700' }}>Lifestyle</h3>
        <LifestyleForm lifestyleData={lifestyleData} setLifestyleData={setLifestyleData} />
      </Card>

      {/* 🏆 Challenge Selection */}
      <Card className="p-4 mb-4" style={{ backgroundColor: '#333', color: 'white' }}>
        <h3 style={{ color: '#FFD700' }}>Join a Challenge?</h3>
        <Form.Select value={selectedChallenge} onChange={(e) => setSelectedChallenge(e.target.value)}>
          <option value="">None</option>
          {challenges.map((challenge) => (
            <option key={challenge._id} value={challenge._id}>
              {challenge.title} (Goal: {challenge.goal} kg CO₂)
            </option>
          ))}
        </Form.Select>
      </Card>

      {/* 🔘 Calculate & Save Button */}
      <Button variant="primary" size="lg" className="w-100" onClick={calculateCarbonFootprint}>
        Calculate & Save
      </Button>

      {/* 🌍 Results Display */}
      {carbonFootprint !== null && (
        <Card className="p-4 mt-4" style={{ backgroundColor: '#333', color: 'white' }}>
          <ResultsPage carbonFootprint={carbonFootprint} />
        </Card>
      )}
    </Container>
  );
};

export default CarbonCalculator;

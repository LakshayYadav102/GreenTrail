import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CarbonPrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDetailed, setIsDetailed] = useState(false);

  const fetchPrediction = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    try {
      const activityRes = await axios.get(`http://localhost:5000/api/activities/user/${userId}`);
      const activities = activityRes.data.activities;

      if (!activities || activities.length === 0) {
        setError('No activities found');
        setLoading(false);
        return;
      }

      const latest = activities[activities.length - 1];

      const transportKm = latest.transportation || 0;
      const energyKwh = latest.energy || 0;
      const dietType = latest.diet === 'non-vegetarian' ? 1 : 0;

      const predictionRes = await axios.post('http://localhost:5000/api/predict', {
        transportation: transportKm,
        energy: energyKwh,
        dietType,
      });

      // Multiply by 7 to estimate weekly emissions
      setPrediction({
        totalEmission: (predictionRes.data.predicted_total_emission * 7).toFixed(2),
        transportEmission: (transportKm * 0.123 * 7).toFixed(2),
        energyEmission: (energyKwh * 0.233 * 7).toFixed(2),
        dietEmission: ((dietType === 0 ? 0.5 : 1.2) * 7).toFixed(2),
      });
    } catch (err) {
      console.error('Prediction error:', err);
      setError('Failed to fetch prediction');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, []);

  const toggleDetailedView = () => {
    setIsDetailed(!isDetailed);
  };

  return (
    <div className="carbon-prediction">
      <h2>AI-Based Emission Forecast</h2>
      {loading ? (
        <p>🔄 Generating your prediction...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>⚠️ {error}</p>
      ) : (
        <>
          <h3>📉 Predicted Carbon Emission for Next Week: {prediction.totalEmission} kg CO₂</h3>

          <button onClick={toggleDetailedView} className="btn btn-eco-info">
            {isDetailed ? 'Show Less' : 'Show More'}
          </button>

          {isDetailed && (
            <div className="detailed-view">
              <h4>Emissions Breakdown (Weekly):</h4>
              <ul>
                <li>
                  <strong>🚗 Transportation Emission:</strong> {prediction.transportEmission} kg CO₂
                  <p>Transportation, such as driving a car or using public transport, contributes to your carbon footprint. The longer the distance traveled, the more carbon dioxide is emitted.</p>
                </li>
                <li>
                  <strong>💡 Energy Usage Emission:</strong> {prediction.energyEmission} kg CO₂
                  <p>Your energy consumption, like electricity usage in your home, adds to your carbon footprint. The more electricity you consume, especially from non-renewable sources, the higher your emissions.</p>
                </li>
                <li>
                  <strong>🍽 Diet Emission:</strong> {prediction.dietEmission} kg CO₂
                  <p>Your dietary choices, particularly eating non-vegetarian foods, have a significant environmental impact. Meat production generates higher emissions compared to plant-based foods.</p>
                </li>
              </ul>

              <h4>Suggestions for Reducing Carbon Footprint:</h4>
              <ul>
                {prediction.transportEmission > 35 && <li>🚲 Consider using public transport, carpooling, or biking to reduce your carbon footprint from transportation.</li>}
                {prediction.energyEmission > 35 && <li>🌞 Switch to renewable energy sources like solar or wind to decrease your home’s energy-related emissions.</li>}
                {prediction.dietEmission > 7 && <li>🥗 Consider adopting a vegetarian or plant-based diet to reduce the environmental impact of your food choices.</li>}
              </ul>
            </div>
          )}

          {!isDetailed && (
            <div>
              <h4>In Brief:</h4>
              <p>Your total carbon emission prediction for the next week is based on your transportation, energy usage, and dietary habits. It reflects how much CO₂ your activities are expected to produce.</p>
              <p><strong>To reduce your carbon footprint:</strong> Consider switching to more eco-friendly transportation, adopting energy-saving habits, and switching to a more sustainable diet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CarbonPrediction;
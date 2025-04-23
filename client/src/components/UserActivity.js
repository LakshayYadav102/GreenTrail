import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, ListGroup, Button, Row, Col, Spinner } from 'react-bootstrap';
import GraphComponent from './GraphComponent';
import './UserActivity.css';

const UserActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPrediction, setShowPrediction] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    const fetchUserActivities = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/activities/user/${userId}`);
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

  const fetchPrediction = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User not logged in');
      return;
    }

    if (activities.length === 0) {
      setError('No activities found to base prediction on');
      return;
    }

    const latest = activities[activities.length - 1];

    const transportKm = latest.transportation || 0;
    const energyKwh = latest.energy || 0;
    const dietType = latest.diet === 'non-vegetarian' ? 1 : 0;

    try {
      setPredictionLoading(true);
      const { data } = await axios.post('http://localhost:5000/api/predict', {
        transportation: transportKm,
        energy: energyKwh,
        dietType,
        predictionRange: 7, // Fixed to 7 days
      });
      console.log('Predicted for 7 days:', data);

      const totalEmission = (data.predicted_total_emission * 7).toFixed(2);

      // Coefficients used for explanation purposes, multiplied by 7 for weekly estimate
      setPrediction({
        totalEmission,
        transportEmission: (transportKm * 0.123 * 7).toFixed(2),
        energyEmission: (energyKwh * 0.233 * 7).toFixed(2),
        dietEmission: (dietType === 0 ? 0.5 * 7 : 1.2 * 7).toFixed(2),
      });
    } catch (err) {
      console.error('Prediction error:', err);
      setError('Failed to fetch prediction');
    } finally {
      setPredictionLoading(false);
    }
  };

  const togglePredictionPanel = () => {
    setShowPrediction(!showPrediction);
    if (!showPrediction && !prediction) {
      fetchPrediction();
    }
  };

  if (loading) return <div className="text-center">Loading your activities...</div>;
  if (error) return <div className="text-center text-danger">{error}</div>;

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Your Activity History</h2>

      <GraphComponent userId={localStorage.getItem('userId')} />

      {activities.length > 0 ? (
        activities.map((activity) => (
          <Card key={activity._id} className="mb-4 user-activity-card">
            <Card.Body>
              <Card.Title className="text-center">Activity Details</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item><strong>From Date:</strong> {new Date(activity.fromDate).toLocaleDateString()}</ListGroup.Item>
                <ListGroup.Item><strong>To Date:</strong> {new Date(activity.toDate).toLocaleDateString()}</ListGroup.Item>
                <ListGroup.Item><strong>Transportation:</strong> {activity.transportation} km</ListGroup.Item>
                <ListGroup.Item><strong>Diet:</strong> {activity.diet}</ListGroup.Item>
                <ListGroup.Item><strong>Energy Usage:</strong> {activity.energy} kWh</ListGroup.Item>
                <ListGroup.Item><strong>Total Emission:</strong> {activity.totalEmission} kg CO₂</ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        ))
      ) : (
        <div className="text-center"><p>No activities found.</p></div>
      )}

      <Row className="justify-content-center mt-4">
        <Col md={4} className="text-center">
          <Button variant="primary" href="/dashboard" className="btn">
            Back to Dashboard
          </Button>
        </Col>
      </Row>

      {/* Toggle Prediction Panel Button */}
      <div className="chatbot-toggle-btn" onClick={togglePredictionPanel}>
        <div className="chatbot-icon">💬</div>
        <div className="chatbot-text">{showPrediction ? 'Close Prediction' : 'View Prediction'}</div>
      </div>

      {/* Prediction Panel */}
      {showPrediction && (
        <div className="prediction-panel">
          {predictionLoading ? (
            <div className="text-center"><Spinner animation="border" variant="primary" /></div>
          ) : prediction ? (
            <>
              <h5>📉 Predicted Carbon Emission for Next 7 Days: <strong>{prediction.totalEmission} kg CO₂</strong></h5>
              <p>
                This is a forecast based on your recent activity patterns. Using machine learning, 
                we analyze your past behavior—such as your transportation habits, energy consumption, 
                and diet—to estimate your expected emissions for the next week.
              </p>
              <ul>
                <li><strong>🚗 Transport:</strong> {prediction.transportEmission} kg CO₂ — based on {activities[activities.length - 1].transportation} km of travel.</li>
                <li><strong>💡 Energy:</strong> {prediction.energyEmission} kg CO₂ — from using {activities[activities.length - 1].energy} kWh.</li>
                <li><strong>🍽 Diet:</strong> {prediction.dietEmission} kg CO₂ — based on a {activities[activities.length - 1].diet} diet.</li>
              </ul>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                This is not a real-time calculation but an estimate of what you might emit if your lifestyle continues as is.
                To reduce this footprint, try using cleaner transport, saving energy, or switching to a plant-based diet.
              </p>
              <Button variant="danger" onClick={togglePredictionPanel}>Close</Button>
            </>
          ) : (
            <p className="text-danger">Prediction data not available.</p>
          )}
        </div>
      )}
    </Container>
  );
};

export default UserActivity;
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import GraphComponent from '../components/GraphComponent';
import Chatbot from '../components/Chatbot';
import './DashboardPage.css';
import ObjectDetection from "../components/ObjectDetection";

const API_KEY = "bc37a8c779f09599ac7f5d53566fdae4"; 
const CITY = "Gurgaon";
const LAT = "28.4986";
const LON = "77.0469";

const DashboardPage = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null); // ✅ AQI State
  const [showGraph, setShowGraph] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      setError('User not logged in');
    }
    setLoading(false);
  }, []);

  const fetchWeatherAndAQI = async () => {
    try {
      // 🌤 Fetch Weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`
      );
      if (!weatherResponse.ok) throw new Error('Failed to fetch weather');
      const weatherData = await weatherResponse.json();
      setWeather(weatherData);
      localStorage.setItem('weatherData', JSON.stringify(weatherData));

      // 🏭 Fetch AQI
      const aqiResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${LAT}&lon=${LON}&appid=${API_KEY}`
      );
      if (!aqiResponse.ok) throw new Error('Failed to fetch AQI');
      const aqiData = await aqiResponse.json();

      // ✅ Convert OpenWeatherMap AQI (1-5) → Real AQI (0-500)
      const apiAqi = aqiData.list[0]?.main?.aqi || 1;
      const mappedAqi = mapAqi(apiAqi);
      setAqi(mappedAqi);
      localStorage.setItem('aqiData', JSON.stringify(mappedAqi));

    } catch (error) {
      setError('Error fetching weather or AQI data');
    }
  };

  useEffect(() => {
    fetchWeatherAndAQI();
  }, []);

  // 🔹 Convert API AQI (1-5) → Real AQI (0-500)
  const mapAqi = (apiAqi) => {
    const aqiRanges = {
      1: { value: "0-50", text: "Good", color: "green" },
      2: { value: "51-100", text: "Moderate", color: "yellow" },
      3: { value: "101-150", text: "Unhealthy for Sensitive Groups", color: "orange" },
      4: { value: "151-200", text: "Unhealthy", color: "red" },
      5: { value: "201-300+", text: "Very Unhealthy", color: "purple" }
    };
    return aqiRanges[apiAqi] || aqiRanges[1]; // Default to "Good"
  };

  if (loading) {
    return (
      <Container className="loading-container">
        <div className="text-center">
          <Spinner animation="border" variant="success" style={{ width: '3rem', height: '3rem' }} />
          <h4 className="mt-3 text-muted">Loading Your Eco Dashboard...</h4>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="error-container">
        <Alert variant="danger" className="text-center">
          <h4>⚠️ Error Encountered</h4>
          <p className="mb-0">{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="dashboard-container">
      <h1 className="dashboard-title">
        Welcome to GreenTrail
        <div className="title-underline"></div>
      </h1>

      <Row className="g-4">
        {/* Track Footprint Card */}
        <Col xs={12} md={6} lg={4}>
          <Card className="eco-card track-card">
            <Card.Body>
              <div className="card-icon">🌱</div>
              <Card.Title>Track Your Footprint</Card.Title>
              <Card.Text>
                Monitor and analyze your carbon emissions with detailed insights.
              </Card.Text>
              <Link to="/track" className="btn btn-eco-primary">
                Start Tracking →
              </Link>
            </Card.Body>
          </Card>
        </Col>

        {/* Weather & AQI Card */}
        <Col xs={12} md={6} lg={4}>
          <Card className="eco-card weather-card">
            <Card.Body>
              <div className="card-icon">⛅</div>
              <Card.Title>Environment Status</Card.Title>
              
              {weather ? (
                <div className="weather-info">
                  <div className="weather-item">
                    <span>🌡 Temperature</span>
                    <strong>{weather.main.temp}°C</strong>
                  </div>
                  <div className="weather-item">
                    <span>💧 Humidity</span>
                    <strong>{weather.main.humidity}%</strong>
                  </div>
                  <div className="weather-item">
                    <span>☁ Condition</span>
                    <strong>{weather.weather[0].description}</strong>
                  </div>
                  {aqi && (
                    <div className={`aqi-badge bg-${aqi.color}`}>
                      <span>🏭 AQI</span>
                      <strong>{aqi.value} ({aqi.text})</strong>
                    </div>
                  )}
                </div>
              ) : (
                <Spinner animation="border" variant="info" />
              )}
              <Button onClick={fetchWeatherAndAQI} className="btn btn-eco-secondary">
                Refresh Data ⟳
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Activities Card */}
        <Col xs={12} md={6} lg={4}>
          <Card className="eco-card activities-card">
            <Card.Body>
              <div className="card-icon">📊</div>
              <Card.Title>Your Activities</Card.Title>
              <Card.Text>
                Review your historical data and sustainability progress.
              </Card.Text>
              <Link to="/user-activity" className="btn btn-eco-success">
                View History →
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 🔹 Emission Analytics - Now Centered Below Environment Status */}
      <Row className="justify-content-center mt-4">
        <Col xs={12} md={8} lg={6}>
          <Card className="eco-card graph-card">
            <Card.Body>
              <div className="card-icon">📈</div>
              <Card.Title>Emission Analytics</Card.Title>
              <Card.Text>
                Visualize your carbon footprint trends over different time periods.
              </Card.Text>
              <Button 
                onClick={() => setShowGraph(!showGraph)} 
                className="btn btn-eco-info"
              >
                {showGraph ? 'Hide Analytics' : 'Show Analytics'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {showGraph && <GraphComponent userId={userId} />}

      <ObjectDetection />
      <Chatbot />
    </Container>
  );
};

export default DashboardPage;
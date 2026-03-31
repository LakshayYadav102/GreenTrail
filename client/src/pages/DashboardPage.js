import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom';
import GraphComponent from '../components/GraphComponent';
import ObjectDetection from '../components/ObjectDetection';
import './DashboardPage.css';

const API_KEY = "bc37a8c779f09599ac7f5d53566fdae4";
const CITY = "Gurgaon";
const LAT = "28.4986";
const LON = "77.0469";

const quotes = [
  "Step Lightly, Thrive Greenly",
  "Green Today, Thriving Tomorrow",
  "Sustain the Planet, Sustain Our Future",
  "Eco Living, Made Simple",
  "Plant the Seed for a Greener World"
];

const DashboardPage = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [showGraph, setShowGraph] = useState(false);
  
  const [displayedText, setDisplayedText] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      try {
        const storedUserId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!token) {
          setError('User not logged in');
          setLoading(false);
          return;
        }
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          setError('User ID not found');
          setLoading(false);
          return;
        }
        await fetchWeatherAndAQI();
      } catch (error) {
        setError('Error initializing dashboard');
      } finally {
        setLoading(false);
      }
    };
    initializeDashboard();
  }, []);

  useEffect(() => {
    let typingTimer;

    const handleTyping = () => {
      const fullQuote = quotes[quoteIndex];

      if (!isDeleting) {
        setDisplayedText(fullQuote.substring(0, displayedText.length + 1));

        if (displayedText === fullQuote) {
          typingTimer = setTimeout(() => setIsDeleting(true), 2000);
        } else {
          typingTimer = setTimeout(handleTyping, 80);
        }
      } else {
        setDisplayedText(fullQuote.substring(0, displayedText.length - 1));

        if (displayedText === '') {
          setIsDeleting(false);
          setQuoteIndex((prev) => (prev + 1) % quotes.length);
        } else {
          typingTimer = setTimeout(handleTyping, 40);
        }
      }
    };

    typingTimer = setTimeout(handleTyping, isDeleting ? 40 : 80);
    
    return () => clearTimeout(typingTimer);
  }, [displayedText, isDeleting, quoteIndex]);

  const fetchWeatherAndAQI = async () => {
    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`
      );
      if (!weatherResponse.ok) throw new Error('Failed to fetch weather');
      const weatherData = await weatherResponse.json();
      setWeather(weatherData);
      localStorage.setItem('weatherData', JSON.stringify(weatherData));

      const aqiResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${LAT}&lon=${LON}&appid=${API_KEY}`
      );
      if (!aqiResponse.ok) throw new Error('Failed to fetch AQI');
      const aqiData = await aqiResponse.json();
      const apiAqi = aqiData.list[0]?.main?.aqi || 1;
      const mappedAqi = mapAqi(apiAqi);
      setAqi(mappedAqi);
      localStorage.setItem('aqiData', JSON.stringify(mappedAqi));
    } catch (error) {
      setError('Error fetching weather or AQI data');
    }
  };

  const mapAqi = (apiAqi) => {
    const aqiRanges = {
      1: { value: "0-50", text: "Good", color: "green" },
      2: { value: "51-100", text: "Moderate", color: "yellow" },
      3: { value: "101-150", text: "Unhealthy for Sensitive Groups", color: "orange" },
      4: { value: "151-200", text: "Unhealthy", color: "red" },
      5: { value: "201-300+", text: "Very Unhealthy", color: "purple" }
    };
    return aqiRanges[apiAqi] || aqiRanges[1];
  };

  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <Container className="gt-loading-container">
        <div className="text-center">
          <Spinner animation="border" variant="success" style={{ width: '3rem', height: '3rem' }} />
          <h4 className="mt-3 text-muted">Loading Your Eco Dashboard...</h4>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="gt-error-container">
        <Alert variant="danger" className="text-center">
          <h4>⚠️ Error Encountered</h4>
          <p className="mb-0">{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="gt-dashboard-page">
      <Container fluid className="gt-dashboard-container">
        <h1 className="gt-dashboard-title">
          {displayedText}
          <div className="gt-title-underline"></div>
        </h1>

        <Row className="g-4 mb-4">
          <Col xs={12} sm={6} lg={3}>
            <Card className="gt-eco-card gt-track-card h-100">
              <Card.Body className="d-flex flex-column">
                <div className="gt-card-icon">🌱</div>
                <Card.Title>Track Your Footprint</Card.Title>
                <Card.Text className="flex-grow-1">
                  Monitor and analyze your carbon emissions with detailed insights.
                </Card.Text>
                <Link to="/track" className="btn gt-btn-eco gt-btn-eco-primary mt-auto">
                  Start Tracking →
                </Link>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="gt-eco-card gt-weather-card h-100">
              <Card.Body className="d-flex flex-column">
                <div className="gt-card-icon">⛅</div>
                <Card.Title>Environment Status</Card.Title>
                {weather ? (
                  <div className="gt-weather-info flex-grow-1">
                    <div className="gt-weather-item">
                      <span>🌡 Temperature</span>
                      <strong>{weather.main.temp}°C</strong>
                    </div>
                    <div className="gt-weather-item">
                      <span>💧 Humidity</span>
                      <strong>{weather.main.humidity}%</strong>
                    </div>
                    <div className="gt-weather-item">
                      <span>☁ Condition</span>
                      <strong style={{ textTransform: 'capitalize' }}>{weather.weather[0].description}</strong>
                    </div>
                    {aqi ? (
                      <div className={`gt-aqi-badge bg-${aqi.color}`}>
                        <span>🏭 AQI</span>
                        <strong>{aqi.value} ({aqi.text})</strong>
                      </div>
                    ) : (
                      <div className="gt-weather-item">
                        <span>🏭 AQI</span>
                        <strong>Loading...</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="gt-weather-info flex-grow-1">
                    <Spinner animation="border" variant="light" size="sm" />
                    <p style={{ color: 'white', marginTop: '10px' }}>Loading weather data...</p>
                  </div>
                )}
                <Button onClick={fetchWeatherAndAQI} className="btn gt-btn-eco gt-btn-eco-secondary mt-auto">
                  Refresh Data ⟳
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="gt-eco-card gt-donation-card h-100">
              <Card.Body className="d-flex flex-column">
                <div className="gt-card-icon">🌳</div>
                <Card.Title>Tree Offset</Card.Title>
                <Card.Text className="flex-grow-1">
                  See how many trees can offset your carbon footprint or donate to plant more.
                </Card.Text>
                <Link to="/donation" className="btn gt-btn-eco gt-btn-eco-success mt-auto">
                  Plant Tree
                </Link>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="gt-eco-card gt-activities-card h-100">
              <Card.Body className="d-flex flex-column">
                <div className="gt-card-icon">📊</div>
                <Card.Title>Your Activities</Card.Title>
                <Card.Text className="flex-grow-1">
                  Review your historical data and sustainability progress.
                </Card.Text>
                <Link to="/user-activity" className="btn gt-btn-eco gt-btn-eco-success mt-auto">
                  View History →
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="justify-content-center g-4">
          <Col xs={12} md={10} lg={8}>
            <Card className="gt-eco-card gt-graph-card h-100">
              <Card.Body className="d-flex flex-column">
                <div className="gt-card-icon">📈</div>
                <Card.Title>Emission Analytics</Card.Title>
                <Card.Text className="flex-grow-1">
                  Visualize your carbon footprint trends over different time periods.
                </Card.Text>
                <Button
                  onClick={() => setShowGraph(!showGraph)}
                  className="btn gt-btn-eco gt-btn-eco-info mt-auto"
                >
                  {showGraph ? 'Hide Analytics' : 'Show Analytics'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {showGraph && (
          <div className="gt-graph-wrapper">
             <GraphComponent userId={userId} />
          </div>
        )}

        <ObjectDetection />
        {/* Chatbot was removed from here to prevent double rendering */}
      </Container>
    </div>
  );
};

export default DashboardPage;

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import GraphComponent from '../components/GraphComponent';
import Chatbot from '../components/Chatbot';
import ObjectDetection from '../components/ObjectDetection';
import './DashboardPage.css';

const API_KEY = "bc37a8c779f09599ac7f5d53566fdae4";
const CITY = "Gurgaon";
const LAT = "28.4986";
const LON = "77.0469";

const DashboardPage = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [showGraph, setShowGraph] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');

  const quotes = [
    "Step Lightly, Thrive Greenly",
    "Green Today, Thriving Tomorrow",
    "Sustain the Planet, Sustain Our Future",
    "Eco Living, Made Simple",
    "Plant the Seed for a Greener World"
  ];

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      setError('User not logged in');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const typeQuote = async () => {
      const currentQuote = quotes[currentQuoteIndex];
      
      // Type out the new quote
      for (let i = 0; i <= currentQuote.length; i++) {
        setDisplayedText(currentQuote.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 100)); // Typing speed
      }

      // Wait before starting to erase
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Erase the quote from right to left
      for (let i = currentQuote.length; i >= 0; i--) {
        setDisplayedText(currentQuote.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 50)); // Erasing speed
      }

      // Move to the next quote
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    };

    typeQuote();
  }, [currentQuoteIndex, quotes.length]);

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

  useEffect(() => {
    fetchWeatherAndAQI();
  }, []);

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
    <Container fluid className="dashboard-container">
      <h1 className="dashboard-title">
        {displayedText}
        <div className="title-underline"></div>
      </h1>

      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="eco-card track-card h-100">
            <Card.Body className="d-flex flex-column">
              <div className="card-icon">🌱</div>
              <Card.Title>Track Your Footprint</Card.Title>
              <Card.Text className="flex-grow-1">
                Monitor and analyze your carbon emissions with detailed insights.
              </Card.Text>
              <Link to="/track" className="btn btn-eco-primary mt-auto">
                Start Tracking →
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="eco-card weather-card h-100">
            <Card.Body className="d-flex flex-column">
              <div className="card-icon">⛅</div>
              <Card.Title>Environment Status</Card.Title>
              {weather ? (
                <div className="weather-info flex-grow-1">
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
              <Button onClick={fetchWeatherAndAQI} className="btn btn-eco-secondary mt-auto">
                Refresh Data ⟳
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="eco-card donation-card h-100">
            <Card.Body className="d-flex flex-column">
              <div className="card-icon">🌳</div>
              <Card.Title>Tree Offset</Card.Title>
              <Card.Text className="flex-grow-1">
                See how many trees can offset your carbon footprint or donate to plant more.
              </Card.Text>
              <Link to="/donation" className="btn btn-eco-success mt-auto">
                Plant Tree
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="eco-card activities-card h-100">
            <Card.Body className="d-flex flex-column">
              <div className="card-icon">📊</div>
              <Card.Title>Your Activities</Card.Title>
              <Card.Text className="flex-grow-1">
                Review your historical data and sustainability progress.
              </Card.Text>
              <Link to="/user-activity" className="btn btn-eco-success mt-auto">
                View History →
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="justify-content-center g-4">
        <Col xs={12} md={10} lg={8}>
          <Card className="eco-card graph-card h-100">
            <Card.Body className="d-flex flex-column">
              <div className="card-icon">📈</div>
              <Card.Title>Emission Analytics</Card.Title>
              <Card.Text className="flex-grow-1">
                Visualize your carbon footprint trends over different time periods.
              </Card.Text>
              <Button
                onClick={() => setShowGraph(!showGraph)}
                className="btn btn-eco-info mt-auto"
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
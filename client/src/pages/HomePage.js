import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; 
import Chatbot from '../components/Chatbot';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className="home-page">
      {/* Header Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="eco-title">GreenTrail</h1>
          <p className="hero-text">
            Join the movement! Track and reduce your carbon footprint with cutting-edge tools.
          </p>
          <div className="cta-buttons">
            <Button variant="primary" className="btn-lg mb-3" onClick={handleLoginClick}>
              Login
            </Button>
            <Button variant="outline-light" className="btn-lg mb-3" onClick={handleRegisterClick}>
              Register
            </Button>
          </div>
        </div>
      </header>

      {/* About Us Section */}
      <section className="about-us">
        <div className="container">
          <h2 className="section-title">About Us</h2>
          <p className="section-text">
            GreenTrail empowers individuals and businesses to reduce their environmental impact. 
            Track your activities, set goals, and monitor your carbon footprint with our powerful tools.
          </p>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="contact-us">
        <div className="container">
          <h2 className="section-title">Contact Us</h2>
          <p className="section-text">
            Got questions? Reach out to us anytime at <strong>support@ecotrack.com</strong>!
          </p>
          <Button variant="primary" href="mailto:support@ecotrack.com" className="btn-lg">
            Email Us
          </Button>
        </div>
      </section>

      <Chatbot />

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">© 2025 EcoTrack. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
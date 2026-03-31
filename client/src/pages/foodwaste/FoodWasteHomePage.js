import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FoodWasteNavbar from "../../components/foodwaste/FoodWasteNavbar";
import "./FoodWasteHomePage.css";

const quotes = [
  "Share surplus food, nourish your community.",
  "Turn potential waste into immediate relief.",
  "Connecting abundance with necessity.",
  "Every meal saved is a step toward zero-waste.",
  "Your leftovers could be someone's lifeline."
];

function FoodWasteHomePage() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");

  // Typing Effect States
  const [quoteText, setQuoteText] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // GLITCH-FREE TYPING ANIMATION LOGIC
  useEffect(() => {
    let typingTimer;
    
    const handleTyping = () => {
      const fullQuote = quotes[quoteIndex];

      if (!isDeleting) {
        setQuoteText(fullQuote.substring(0, quoteText.length + 1));
        
        if (quoteText === fullQuote) {
          typingTimer = setTimeout(() => setIsDeleting(true), 2000);
        } else {
          typingTimer = setTimeout(handleTyping, 80);
        }
      } else {
        setQuoteText(fullQuote.substring(0, quoteText.length - 1));
        
        if (quoteText === '') {
          setIsDeleting(false);
          setQuoteIndex((prev) => (prev + 1) % quotes.length);
        } else {
          typingTimer = setTimeout(handleTyping, 40);
        }
      }
    };

    typingTimer = setTimeout(handleTyping, isDeleting ? 40 : 80);
    return () => clearTimeout(typingTimer);
  }, [quoteText, isDeleting, quoteIndex]);

  return (
    <div className="fw-page-wrapper">
      <FoodWasteNavbar />

      {/* Beautiful eco-focused background image */}
      <div className="fw-home-background"></div>

      <div className={`fw-home-container ${isLoaded ? 'loaded' : ''}`}>
        
        <div className="fw-hero">
          <div className="fw-hero-badge">Community Rescue Network</div>
          <h1>Food Waste <span className="fw-gradient-text">Rescue</span></h1>
          
          <div className="fw-animated-quote-container">
            <p className="fw-animated-quote">
              {quoteText}
              <span className="fw-typing-cursor">|</span>
            </p>
          </div>
        </div>

        <div className="fw-cards-grid">
          {/* Donate Card */}
          <div 
            className="fw-action-card donate-card"
            onClick={() => navigate(isLoggedIn ? "/food-waste/donate" : "/login")}
          >
            <div className="fw-card-glow"></div>
            <div className="fw-card-content">
              <div className="fw-card-icon-wrapper">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fw-svg-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m5.25-3l4.5 4.5 4.5-4.5m-4.5 4.5V3" />
                </svg>
              </div>
              <h2>Donate Surplus Food</h2>
              <p>Share extra, high-quality unconsumed food from your home, restaurant, or corporate events. Notify local NGOs instantly.</p>
              <div className="fw-btn-text">Start Donating →</div>
            </div>
          </div>

          {/* Receive/NGO Card */}
          <div 
            className="fw-action-card receive-card"
            onClick={() => navigate(isLoggedIn ? "/food-waste/require" : "/login")}
          >
            <div className="fw-card-glow"></div>
            <div className="fw-card-content">
              <div className="fw-card-icon-wrapper">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fw-svg-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <h2>NGO / Community Shelter</h2>
              <p>Find and claim available food donations posted nearby in real-time. Coordinate pickups directly with donors.</p>
              <div className="fw-btn-text">Access Directory →</div>
            </div>
          </div>
        </div>

        <div className="fw-eco-footer">
          <div className="fw-footer-icon">🌱</div>
          <div className="fw-footer-text">
            <h4>100% Zero-Waste Cycle</h4>
            <p>Any unclaimed food is responsibly redirected to local composting facilities or animal feed networks.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default FoodWasteHomePage;
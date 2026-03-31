import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FoodWasteNavbar from "../../components/foodwaste/FoodWasteNavbar"; 
import "./DonateFoodDashboard.css";

const quotes = [
  "Share your surplus, multiply your impact.",
  "From leftovers to lifelines.",
  "Small donations, massive community impact.",
  "Don't throw it out, pass it on.",
  "Feed people, not landfills."
];

function DonateFoodDashboard() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  const [quoteText, setQuoteText] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
    <div className="fw-donate-page-wrapper">
      <FoodWasteNavbar />
      
      <div className="fw-donate-background"></div>

      <div className={`fw-donate-container ${isLoaded ? 'loaded' : ''}`}>
        <div className="fw-donate-header">
          <div className="fw-hero-badge">Food Contribution Portal</div>
          <h1>Donate <span className="fw-gradient-text">Surplus Food</span></h1>
          
          <div className="fw-animated-quote-container">
            <p className="fw-animated-quote">
              {quoteText}
              <span className="fw-typing-cursor">|</span>
            </p>
          </div>
        </div>

        <div className="fw-donate-grid">
          
          {/* Household Donation Card */}
          <div className="fw-donate-card fw-card-household">
            <div className="fw-card-glow fw-glow-household"></div>
            <div className="fw-card-content">
              <div className="fw-card-icon-wrapper">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fw-svg-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <h2>Household Donation</h2>
              <p>Donate leftover or excess food from your home kitchen before it spoils.</p>
              <ul className="fw-donate-list">
                <li><span className="list-bullet">✓</span> Cooked or raw ingredients</li>
                <li><span className="list-bullet">✓</span> Packaged grocery items</li>
                <li><span className="list-bullet">✓</span> Daily surplus management</li>
              </ul>
              <button 
                className="fw-btn fw-btn-household"
                onClick={() => navigate("/food-waste/donate/household")}
              >
                Donate from Home →
              </button>
            </div>
          </div>

          {/* Event Donation Card */}
          <div className="fw-donate-card fw-card-event">
            <div className="fw-card-glow fw-glow-event"></div>
            <div className="fw-card-content">
              <div className="fw-card-icon-wrapper">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fw-svg-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                </svg>
              </div>
              <h2>Event / Bulk Donation</h2>
              <p>Donate bulk surplus from large functions, weddings, and corporate parties.</p>
              <ul className="fw-donate-list">
                <li><span className="list-bullet">✓</span> Large catering quantities</li>
                <li><span className="list-bullet">✓</span> Time-sensitive pickup</li>
                <li><span className="list-bullet">✓</span> High community impact</li>
              </ul>
              <button 
                className="fw-btn fw-btn-event"
                onClick={() => navigate("/food-waste/donate/event")}
              >
                Donate Event Food →
              </button>
            </div>
          </div>

          {/* Status Card */}
          <div className="fw-donate-card fw-card-status">
            <div className="fw-card-glow fw-glow-status"></div>
            <div className="fw-card-content">
              <div className="fw-card-icon-wrapper">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fw-svg-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C7.387 11.812 11.543 9.262 14.46 5.751C14.46 5.751 14.46 5.751 14.46 5.751C14.46 11.512 18.062 16.524 21 19.393M14.46 5.751C11.543 9.262 14.46 16.524 14.46 16.524M14.46 5.751C14.46 5.751 14.46 5.751 14.46 5.751ZM3 19.5h18" />
                </svg>
              </div>
              <h2>Donation Analytics</h2>
              <p>Track your past donations and measure your direct environmental impact.</p>
              <ul className="fw-donate-list">
                <li><span className="list-bullet">✓</span> View accepted/expired history</li>
                <li><span className="list-bullet">✓</span> See total carbon offset</li>
                <li><span className="list-bullet">✓</span> Monitor your green score</li>
              </ul>
              <button
                className="fw-btn fw-btn-status"
                onClick={() => navigate("/food-waste/my-donations")}
              >
                View Analytics →
              </button>
            </div>
          </div>

          {/* NGO Locator Card */}
          <div className="fw-donate-card fw-card-ngo">
            <div className="fw-card-glow fw-glow-ngo"></div>
            <div className="fw-card-content">
              <div className="fw-card-icon-wrapper">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fw-svg-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <h2>Locate Local NGOs</h2>
              <p>Find nearby verified NGOs and community kitchens to donate food directly.</p>
              <ul className="fw-donate-list">
                <li><span className="list-bullet">✓</span> Interactive map routing</li>
                <li><span className="list-bullet">✓</span> Verified community centers</li>
                <li><span className="list-bullet">✓</span> Direct contact details</li>
              </ul>
              <button
                className="fw-btn fw-btn-ngo"
                onClick={() => navigate("/food-waste/ngos")}
              >
                Find NGOs Near Me →
              </button>
            </div>
          </div>

        </div>

        <div className="fw-eco-footer">
          <div className="fw-footer-icon">🌱</div>
          <div className="fw-footer-text">
            <h4>Zero-Waste Commitment</h4>
            <p>Food not accepted before expiry will be redirected responsibly for composting or animal feed to ensure zero waste.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DonateFoodDashboard;
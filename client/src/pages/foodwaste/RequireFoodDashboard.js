import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FoodWasteNavbar from "../../components/foodwaste/FoodWasteNavbar"; 
import "./RequireFoodDashboard.css";

const quotes = [
  "Connecting surplus with necessity.",
  "Good food belongs to people, not landfills.",
  "Claim a meal, save the planet.",
  "Every rescued meal reduces your carbon footprint.",
  "Community support, one plate at a time."
];

function RequireFoodDashboard() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

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
    <div className="fw-req-page-wrapper">
      <FoodWasteNavbar />
      
      {/* Background matches the Food Rescue Homepage */}
      <div className="fw-req-background"></div>

      <div className={`fw-req-container ${isLoaded ? 'loaded' : ''}`}>
        <div className="fw-req-header">
          <div className="fw-hero-badge">Food Retrieval Portal</div>
          <h1>Receive <span className="fw-gradient-text-blue">Surplus Food</span></h1>
          
          <div className="fw-animated-quote-container">
            <p className="fw-animated-quote">
              {quoteText}
              <span className="fw-typing-cursor-blue">|</span>
            </p>
          </div>
        </div>

        <div className="fw-req-grid">
          
          {/* Available Food Card */}
          <div className="fw-req-card available">
            <div className="fw-card-glow available-glow"></div>
            <div className="fw-card-content">
              <div className="fw-card-icon-wrapper">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fw-svg-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                </svg>
              </div>
              <h2>Available Food</h2>
              <p>Browse current food donations ready for immediate pickup or delivery in your local area.</p>
              <ul className="fw-req-list">
                <li><span className="list-bullet">✓</span> Household & event surplus</li>
                <li><span className="list-bullet">✓</span> Time-sensitive availability</li>
                <li><span className="list-bullet">✓</span> Verified local listings</li>
              </ul>
              <button 
                className="fw-btn available-btn"
                onClick={() => navigate("/food-waste/available")}
              >
                View Available Food →
              </button>
            </div>
          </div>

          {/* NGO Card */}
          <div className="fw-req-card ngo">
            <div className="fw-card-glow ngo-glow"></div>
            <div className="fw-card-content">
              <div className="fw-card-icon-wrapper">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fw-svg-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <h2>Nearby NGOs</h2>
              <p>Find trusted organizations and community kitchens that provide regular food support.</p>
              <ul className="fw-req-list">
                <li><span className="list-bullet">✓</span> Community kitchens</li>
                <li><span className="list-bullet">✓</span> Charity food centers</li>
                <li><span className="list-bullet">✓</span> Local shelters</li>
              </ul>
              <button
                className="fw-btn ngo-btn"
                onClick={() => navigate("/food-waste/ngos")}
              >
                Locate NGOs →
              </button>
            </div>
          </div>

          {/* History Card */}
          <div className="fw-req-card history">
            <div className="fw-card-glow history-glow"></div>
            <div className="fw-card-content">
              <div className="fw-card-icon-wrapper">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fw-svg-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <h2>My Received Food</h2>
              <p>Track the food you’ve successfully claimed and view your positive environmental impact.</p>
              <ul className="fw-req-list">
                <li><span className="list-bullet">✓</span> Past accepted donations</li>
                <li><span className="list-bullet">✓</span> Carbon impact tracking</li>
                <li><span className="list-bullet">✓</span> Quick re-requests</li>
              </ul>
              <button
                className="fw-btn history-btn"
                onClick={() => navigate("/food-waste/received")}
              >
                View History →
              </button>
            </div>
          </div>

        </div>

        <div className="fw-eco-footer">
          <div className="fw-footer-icon">🤝</div>
          <div className="fw-footer-text">
            <h4>Safety & Transparency</h4>
            <p>All food coordination is handled through verified partners to ensure safety and transparency within the community.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default RequireFoodDashboard;
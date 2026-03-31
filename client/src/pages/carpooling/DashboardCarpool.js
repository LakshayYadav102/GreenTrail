import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardCarpool.css";

// Eco-Transit specific quotes
const quotes = [
  "Share the ride, split the emissions.",
  "Fewer cars today, a greener tomorrow.",
  "Your journey towards sustainable travel.",
  "Connect, commute, and conserve.",
  "Driving change, one shared seat at a time."
];

function DashboardCarpool() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeHover, setActiveHover] = useState(null);

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
        // Typing forward
        setQuoteText(fullQuote.substring(0, quoteText.length + 1));
        
        // If word is finished, wait 2 seconds, then start deleting
        if (quoteText === fullQuote) {
          typingTimer = setTimeout(() => setIsDeleting(true), 2000);
        } else {
          // Normal typing speed
          typingTimer = setTimeout(handleTyping, 80);
        }
      } else {
        // Deleting backward
        setQuoteText(fullQuote.substring(0, quoteText.length - 1));
        
        // If completely deleted, move to next quote and start typing
        if (quoteText === '') {
          setIsDeleting(false);
          setQuoteIndex((prev) => (prev + 1) % quotes.length);
        } else {
          // Deleting speed
          typingTimer = setTimeout(handleTyping, 40);
        }
      }
    };

    typingTimer = setTimeout(handleTyping, isDeleting ? 40 : 80);
    return () => clearTimeout(typingTimer);
  }, [quoteText, isDeleting, quoteIndex]);

  const buttons = [
    {
      id: "offer",
      label: "Offer a Ride",
      path: "/ride/offer",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
      description: "Share your journey and save costs"
    },
    {
      id: "find",
      label: "Find a Ride",
      path: "/ride/find",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.773 4.773zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: "Join others going your way"
    },
    {
      id: "ev",
      label: "EV Charging Stations",
      path: "/ev-stations",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      description: "Locate charging points nearby"
    },
    {
      id: "mytrips",
      label: "My Trips",
      path: "/my-trips",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      description: "View your offered and booked rides"
    },
    {
      id: "request",
      label: "Request a Ride",
      path: "/ride/request",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      description: "Post a request for drivers to find you"
    }
  ];

  return (
    <>
      <div className="animated-background">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>

      <div className={`carpool-dashboard-container ${isLoaded ? 'loaded' : ''}`}>
        <div className="dashboard-glass">
          <div className="dashboard-header">
            <div className="title-wrapper">
              <h1 className="main-title">
                <span className="title-gradient">Carpooling Hub</span>
                <div className="title-underline"></div>
              </h1>
              
              {/* REPLACED STATIC TEXT WITH TYPING ANIMATION */}
              <div className="subtitle-container" style={{ minHeight: '30px' }}>
                <p className="subtitle">
                  {quoteText}
                  <span className="typing-cursor" style={{ color: '#2ecc71', fontWeight: 'bold' }}>|</span>
                </p>
              </div>
              
            </div>
          </div>

          <div className="carpool-actions-grid">
            {buttons.map((button, index) => (
              <div
                key={button.id}
                className={`action-card ${activeHover === button.id ? 'active' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setActiveHover(button.id)}
                onMouseLeave={() => setActiveHover(null)}
                onClick={() => navigate(button.path)}
              >
                <div className="card-background"></div>
                
                <div className="card-content">
                  <div className="card-icon">{button.icon}</div>
                  <h3 className="card-title">{button.label}</h3>
                  <p className="card-description">{button.description}</p>
                  
                  <button className="card-button">
                    <span className="button-text">Get Started</span>
                    <div className="button-arrow">→</div>
                  </button>
                </div>

                <div className="card-glow"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardCarpool;
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import GreenverseNavbar from "../components/GreenverseNavbar";
import "./GreenverseHomePage.css";

function GreenverseHomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");         // 🆕
  const companyName = localStorage.getItem("companyName");   // 🆕

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [quoteText, setQuoteText] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [hoveredModule, setHoveredModule] = useState(null);
  const featuresSectionRef = useRef(null);

  // 🆕 Redirect User C away from homepage immediately
  useEffect(() => {
    if (token && userRole === 'auditor') {
      navigate('/corporate-dashboard', { replace: true });
    }
  }, [token, userRole, navigate]);

  const quotes = [
    "Where every step shapes the future",
    "Innovating for a sustainable tomorrow",
    "Together we can make a difference",
    "Empowering eco-friendly choices",
    "Building a greener world together"
  ];
  
  const features = [
    { 
      name: "GreenTrail", 
      description: "Track & analyze your daily carbon footprint. Visualize your emissions and take on challenges to reduce your impact.", 
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C7.387 11.812 11.543 9.262 14.46 5.751C14.46 5.751 14.46 5.751 14.46 5.751C14.46 11.512 18.062 16.524 21 19.393M14.46 5.751C11.543 9.262 14.46 16.524 14.46 16.524M14.46 5.751C14.46 5.751 14.46 5.751 14.46 5.751ZM3 19.5h18" />
        </svg>
      ), 
      link: "/dashboard",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      color: "#4caf50"
    },
    { 
      name: "Carpooling & EV", 
      description: "Share sustainable rides, find local EV charging stations, and significantly reduce your transportation emissions.", 
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ), 
      link: "/carpool",
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      color: "#4fc3f7"
    },
    { 
      name: "Food Rescue", 
      description: "Combat food waste directly. Donate excess food to local NGOs or request food pickups to ensure nothing goes to waste.", 
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a50.297 50.297 0 00-8.625-2.191m4.125 4.691V21M3.75 21v-2.25" />
        </svg>
      ), 
      link: "/foodwaste",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      color: "#ab47bc"
    },
    { 
      name: "GreenScan",
      description: "Step into immersive environmental experiences. See the true impact of climate change and interact with digital solutions.", 
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
        </svg>
      ), 
      link: "arvr",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      color: "#ff5252"
    },
    { 
      name: "GreenStream",
      description: "Your visual knowledge hub. Watch curated educational videos on sustainability, climate action, and eco-friendly living.", 
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      ), 
      link: "/ecolearn/feed",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      color: "#ffd54f"
    },
  ];

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
  }, [quoteText, isDeleting, quoteIndex, quotes]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  const handleCardClick = (link) => {
    if (link === "arvr") {
      window.location.href = 'https://greenversear.netlify.app/';
      return;
    }
    if (!token) {
      navigate("/login");
    } else {
      navigate(link);
    }
  };

  const scrollToFeatures = () => {
    featuresSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <GreenverseNavbar />

      {/* 🆕 Corporate Sync Banner — only for User B */}
      {token && userRole === 'corporate' && (
        <div style={{
          background: 'linear-gradient(90deg, #1b5e20, #2e7d32, #1b5e20)',
          color: '#fff',
          textAlign: 'center',
          padding: '8px 16px',
          fontSize: '0.82rem',
          fontWeight: '600',
          letterSpacing: '0.3px',
          position: 'relative',
          zIndex: 100
        }}>
          🏢 Corporate Sync Active — You are logged in as a <strong>{companyName ? companyName.toUpperCase() : 'CORPORATE'}</strong> employee. Your activities contribute to your company's BRSR compliance report.
        </div>
      )}
      
      <div className="gv-home-earth-background">
        <div className="gv-home-bg-overlay"></div>
        <div className="gv-home-floating-leaf gv-home-leaf-1">🍃</div>
        <div className="gv-home-floating-leaf gv-home-leaf-2">🌿</div>
        <div className="gv-home-floating-leaf gv-home-leaf-3">🌱</div>
        <div className="gv-home-floating-leaf gv-home-leaf-4">🍀</div>
      </div>

      <div className={`gv-home-main ${isLoaded ? 'loaded' : ''}`}>
        
        <section className="gv-home-hero-section">
          <div className="gv-home-hero-container">
            <div className="gv-home-hero-left">
              <div className="gv-home-carousel-container">
                <div 
                  className="gv-home-carousel-track" 
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {features.map((feature) => (
                    <div 
                      key={feature.name} 
                      className="gv-home-carousel-slide"
                      style={{ backgroundImage: `url(${feature.image})` }}
                      onClick={() => handleCardClick(feature.link)}
                    >
                      <div className="gv-home-slide-overlay"></div>
                      <div className="gv-home-slide-content">
                        <div className="gv-home-slide-icon" style={{ color: feature.color }}>{feature.icon}</div>
                        <h2 className="gv-home-slide-title">{feature.name}</h2>
                        <p className="gv-home-slide-description">{feature.description}</p>
                        <button className="gv-home-slide-btn" style={{ background: feature.color }}>
                          {token ? "Explore Now" : "Login to Access"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="gv-home-carousel-nav">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      className={`gv-home-nav-dot ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(index)}
                    />
                  ))}
                </div>
                
                <button className="gv-home-carousel-arrow prev" onClick={() => setCurrentSlide(prev => (prev - 1 + features.length) % features.length)}>‹</button>
                <button className="gv-home-carousel-arrow next" onClick={() => setCurrentSlide(prev => (prev + 1) % features.length)}>›</button>
              </div>
            </div>

            <div className="gv-home-hero-right">
              <div className="gv-home-quotes-container">
                <div className="gv-home-fixed-title">
                  <span className="gv-home-greenverse-text">Greenverse</span>
                </div>
                <div className="gv-home-animated-quotes">
                  <div className="gv-home-quote-text">
                    {quoteText}
                    <span className="gv-home-quote-cursor">|</span>
                  </div>
                </div>
                <button className="gv-home-explore-modules-btn" onClick={scrollToFeatures}>
                  Explore Our Universe
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="gv-home-features-section" ref={featuresSectionRef}>
          <div className="gv-home-section-header">
            <h2 className="gv-home-section-title">The GreenVerse Ecosystem</h2>
            <p className="gv-home-section-subtitle">Hover over a module to learn more, and click to launch.</p>
          </div>
          
          <div className="gv-home-wheel-wrapper">
            <div className="gv-home-module-wheel">
              
              <div 
                className="gv-home-center-orb"
                style={{ 
                  boxShadow: hoveredModule !== null 
                    ? `0 0 40px ${features[hoveredModule].color}80, inset 0 0 20px ${features[hoveredModule].color}40` 
                    : '0 0 30px rgba(76, 175, 80, 0.3)'
                }}
              >
                {hoveredModule !== null ? (
                  <div className="gv-home-center-content active">
                    <div className="gv-home-center-icon" style={{ color: features[hoveredModule].color }}>
                      {features[hoveredModule].icon}
                    </div>
                    <h3 style={{ color: features[hoveredModule].color }}>{features[hoveredModule].name}</h3>
                    <p>{features[hoveredModule].description}</p>
                    <button 
                      className="gv-home-center-btn"
                      style={{ background: features[hoveredModule].color }}
                      onClick={() => handleCardClick(features[hoveredModule].link)}
                    >
                      {token ? "Launch Module" : "Login"}
                    </button>
                  </div>
                ) : (
                  <div className="gv-home-center-content idle">
                    <div className="gv-home-center-icon" style={{ color: "#2ecc71" }}>
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>
                    </div>
                    <h3>Discover</h3>
                    <p>Point at any orb to reveal its purpose.</p>
                  </div>
                )}
              </div>

              {features.map((feature, index) => {
                const angle = (index * 72) - 90; 
                return (
                  <div 
                    key={feature.name}
                    className="gv-home-sat-position-wrapper"
                    style={{ transform: `rotate(${angle}deg) translate(var(--wheel-radius)) rotate(${-angle}deg)` }}
                  >
                    <div
                      className={`gv-home-satellite ${hoveredModule === index ? 'active' : ''}`}
                      style={{
                        borderColor: feature.color,
                        boxShadow: hoveredModule === index ? `0 0 30px ${feature.color}` : `0 0 10px ${feature.color}40`,
                        background: hoveredModule === index 
                          ? `radial-gradient(circle, ${feature.color}55 0%, rgba(0,0,0,0.6) 100%)` 
                          : `radial-gradient(circle, ${feature.color}15 0%, rgba(255,255,255,0.05) 100%)`
                      }}
                      onMouseEnter={() => setHoveredModule(index)}
                      onMouseLeave={() => setHoveredModule(null)}
                      onClick={() => handleCardClick(feature.link)}
                    >
                      <div className="gv-home-sat-icon" style={{ color: feature.color }}>
                        {feature.icon}
                      </div>
                      <span className="gv-home-sat-label">{feature.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="gv-home-mobile-modules">
              {features.map((feature, index) => (
                <div 
                  key={feature.name} 
                  className={`gv-home-mobile-card ${hoveredModule === index ? 'active' : ''}`}
                  onClick={() => setHoveredModule(hoveredModule === index ? null : index)}
                  style={{ borderLeftColor: feature.color }}
                >
                  <div className="gv-home-mobile-header">
                    <span className="gv-home-mobile-icon" style={{ color: feature.color }}>{feature.icon}</span>
                    <h3>{feature.name}</h3>
                  </div>
                  <div className="gv-home-mobile-body">
                    <p>{feature.description}</p>
                    <button 
                      className="gv-home-mobile-btn"
                      style={{ backgroundColor: feature.color }}
                      onClick={(e) => { e.stopPropagation(); handleCardClick(feature.link); }}
                    >
                      Launch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="gv-home-cta-section">
          <div className="gv-home-cta-content">
            <h2 className="gv-home-cta-title">Ready to Make a Difference?</h2>
            <p className="gv-home-cta-description">
              Join thousands of eco-warriors who are already transforming their lifestyle and making our planet greener
            </p>
            <div className="gv-home-cta-buttons">
              {!token ? (
                <>
                  <button className="gv-home-cta-btn primary" onClick={() => navigate("/register")}>
                    Start Your Journey
                  </button>
                  <button className="gv-home-cta-btn secondary" onClick={() => navigate("/login")}>
                    Sign In
                  </button>
                </>
              ) : (
                <button className="gv-home-cta-btn primary" onClick={() => navigate("/profile")}>
                  Go to My Hub
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default GreenverseHomePage;
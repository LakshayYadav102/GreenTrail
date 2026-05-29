import api from "../services/api";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./GreenverseNavbar.css";

const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function GreenverseNavbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const companyName = localStorage.getItem("companyName");

  const [scrolled, setScrolled] = useState(false);
  const [coins, setCoins] = useState(0);
  const [verifiedICT, setVerifiedICT] = useState(0); // ← NEW: credibility-multiplied ICT
  const [profilePic, setProfilePic] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const dropdownModules = [
    { 
      name: "GreenTrail", 
      path: "/dashboard", 
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C7.387 11.812 11.543 9.262 14.46 5.751C14.46 5.751 14.46 5.751 14.46 5.751C14.46 11.512 18.062 16.524 21 19.393M14.46 5.751C11.543 9.262 14.46 16.524 14.46 16.524M14.46 5.751C14.46 5.751 14.46 5.751 14.46 5.751ZM3 19.5h18" />
        </svg>
      )
    },
    { 
      name: "Carpooling & EV", 
      path: "/carpool", 
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      )
    },
    { 
      name: "Food Rescue", 
      path: "/foodwaste", 
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a50.297 50.297 0 00-8.625-2.191m4.125 4.691V21M3.75 21v-2.25" />
        </svg>
      )
    },
    { 
      name: "GreenScan",
      path: "https://greenversear.netlify.app/", 
      isExternal: true,
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
        </svg>
      )
    },
    { 
      name: "GreenStream",
      path: "/ecolearn/feed", 
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      )
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

useEffect(() => {
  if (token && userRole !== 'auditor') {
    if (userRole === 'corporate') {
      // Use api service (auto-attaches token) instead of raw axios
      api.get("/profile/wallet-details")
        .then(res => {
          setVerifiedICT(res.data.verifiedICT || 0);
          setCoins(res.data.totalCoins || 0);
        })
        .catch(err => {
          console.error("Failed to fetch wallet-details:", err);
          // Fallback
          api.get("/profile/wallet")
            .then(res => setCoins(res.data.greenCoins || 0))
            .catch(e => console.error("Fallback wallet fetch failed:", e));
        });
    } else {
      api.get("/profile/wallet")
        .then(res => setCoins(res.data.greenCoins || 0))
        .catch(err => console.error("Failed to fetch wallet:", err));
    }

    // Profile pic — also switch to api service
    api.get("/profile")
      .then(res => {
        if (res.data.profilePic) {
          const picUrl = res.data.profilePic;
          setProfilePic(picUrl.startsWith('http') ? picUrl : `${apiBaseUrl}${picUrl}`);
        } else {
          const name = res.data.username || "Eco";
          setProfilePic(`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2ecc71&color=fff&bold=true&rounded=true`);
        }
      })
      .catch(err => console.error("Failed to fetch profile pic:", err))
      .finally(() => setLoadingProfile(false));
  } else {
    setLoadingProfile(false);
  }
}, [token, userRole]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("companyName");
    window.location.href = "/login";
  };

  // 🔴 Auditor navbar
  if (userRole === 'auditor') {
    return (
      <nav className={`gv-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="gv-navbar-left">
          <div className="gv-logo-wrapper">
            <Link to="/corporate-dashboard" className="gv-logo">
              <span className="gv-logo-icon">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </span>
              <span className="gv-logo-text">GreenVerse</span>
            </Link>
          </div>
        </div>

        <div className="gv-navbar-center">
          <span style={{
            background: 'linear-gradient(135deg, #1a237e, #283593)',
            color: '#fff',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '700',
            letterSpacing: '0.5px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            🏛️ ESG Command Center — {companyName ? companyName.toUpperCase() : 'AUDITOR'}
          </span>
        </div>

        <div className="gv-navbar-right">
          <div className="gv-profile-circle-container" onClick={() => navigate("/profile", { state: { from: 'greenverse' } })}>
            {loadingProfile ? (
              <div className="gv-profile-spinner"></div>
            ) : (
              <img src={profilePic || "/default-avatar.png"} alt="Profile" className="gv-profile-image" />
            )}
          </div>
          <button className="gv-logout-btn" onClick={handleLogout}>
            <span className="gv-btn-icon">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </span>
            Logout
          </button>
        </div>
      </nav>
    );
  }

  // 🟡 Corporate + 🟢 Citizen navbar
  return (
    <nav className={`gv-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="gv-navbar-left">
        <div className="gv-logo-wrapper">
          <Link to="/" className="gv-logo">
            <span className="gv-logo-icon">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </span>
            <span className="gv-logo-text">GreenVerse</span>
          </Link>
          
          <div className="gv-modules-dropdown">
            {dropdownModules.map((mod, i) => (
              mod.isExternal ? (
                <a key={i} href={mod.path} className="gv-dropdown-item">
                  <span className="gv-dropdown-icon">{mod.icon}</span> {mod.name}
                </a>
              ) : (
                <Link key={i} to={token ? mod.path : "/login"} className="gv-dropdown-item">
                  <span className="gv-dropdown-icon">{mod.icon}</span> {mod.name}
                </Link>
              )
            ))}
          </div>
        </div>
      </div>

      <div className="gv-navbar-center">
        {userRole === 'corporate' && (
          <span style={{
            background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
            color: '#fff',
            padding: '5px 14px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '700',
            letterSpacing: '0.5px',
            marginRight: '8px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            🏢 Corporate Sync — {companyName ? companyName.toUpperCase() : 'ACTIVE'}
          </span>
        )}

        <Link to={token ? "/wallet" : "/login"} className="gv-nav-link gv-wallet-link">
          <span className="gv-nav-icon">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          {/* ── CHANGED: corporate now shows verifiedICT, not raw coins ── */}
          {token
            ? userRole === 'corporate'
              ? `${verifiedICT} ICT`
              : `${coins} Coins`
            : "Wallet"}
        </Link>

        <Link to="/store" className="gv-nav-link">
          <span className="gv-nav-icon">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </span>
          EcoStore
        </Link>

        <Link to="/blogs" className="gv-nav-link">
          <span className="gv-nav-icon">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </span>
          Blogs
        </Link>
      </div>

      <div className="gv-navbar-right">
        {token ? (
          <>
            <div className="gv-profile-circle-container" onClick={() => navigate("/profile", { state: { from: 'greenverse' } })}>
              {loadingProfile ? (
                <div className="gv-profile-spinner"></div>
              ) : (
                <img src={profilePic || "/default-avatar.png"} alt="Profile" className="gv-profile-image" />
              )}
            </div>
            <button className="gv-logout-btn" onClick={handleLogout}>
              <span className="gv-btn-icon">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </span>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="gv-nav-link">
              <span className="gv-nav-icon">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </span>
              Login
            </Link>
            <Link to="/register" className="gv-register-btn">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default GreenverseNavbar;
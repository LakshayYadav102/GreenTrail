import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./GreenverseNavbar.css";

const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function GreenverseNavbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [scrolled, setScrolled] = useState(false);
  const [coins, setCoins] = useState(0);
  const [profilePic, setProfilePic] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (token) {
      axios.get(`${apiBaseUrl}/api/profile/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setCoins(res.data.greenCoins))
      .catch(err => console.error("Failed to fetch wallet:", err));

      axios.get(`${apiBaseUrl}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.data.profilePic) {
          // 🟢 FIX: Check if it's already a full Cloudinary URL
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
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  return (
    <nav className={`gv-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="gv-navbar-left">
        <Link to="/" className="gv-logo">
          <span className="logo-icon">🌍</span>
          <span className="logo-text">GreenVerse</span>
        </Link>
      </div>

      <div className="gv-navbar-center">
        <Link to={token ? "/wallet" : "/login"} className="gv-nav-link" style={{ fontWeight: "bold", color: "#2ecc71" }}>
          <span className="nav-icon">🪙</span>{token ? `${coins} Coins` : "Wallet"}
        </Link>
        <Link to="/store" className="gv-nav-link"><span className="nav-icon">🛒</span>EcoStore</Link>
        <Link to="/blogs" className="gv-nav-link"><span className="nav-icon">📝</span>Blogs</Link>
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
              <span className="btn-icon">🚪</span>Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="gv-nav-link"><span className="nav-icon">🔑</span>Login</Link>
            <Link to="/register" className="gv-register-btn"><span className="btn-icon">🌱</span>Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );  
}

export default GreenverseNavbar;
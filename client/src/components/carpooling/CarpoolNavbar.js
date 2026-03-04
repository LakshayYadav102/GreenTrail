import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./CarpoolNavbar.css";

const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function CarpoolNavbar() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
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
      axios.get(`${apiBaseUrl}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.data.profilePic) {
          setProfilePic(`${apiBaseUrl}${res.data.profilePic}`);
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

  return (
    <nav className={`cp-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="cp-navbar-left">
        <Link to="/carpool" className="cp-logo">
          <span className="logo-icon">🚗</span>
          <span className="logo-text">EcoRide</span>
        </Link>
      </div>

      <div className="cp-navbar-center">
        <Link to="/ride/find" className="cp-nav-link"><span className="nav-icon">🔍</span>Find Ride</Link>
        <Link to="/ride/offer" className="cp-nav-link"><span className="nav-icon">📣</span>Offer Ride</Link>
        <Link to="/my-trips" className="cp-nav-link"><span className="nav-icon">🗺️</span>My Trips</Link>
        <Link to="/ev-stations" className="cp-nav-link"><span className="nav-icon">⚡</span>EV Stations</Link>
      </div>

      <div className="cp-navbar-right">
        {token ? (
          <>
            <div className="cp-profile-circle-container" onClick={() => navigate("/profile", { state: { from: 'carpool' } })}>
              {loadingProfile ? (
                <div className="cp-profile-spinner"></div>
              ) : (
                <img src={profilePic || "/default-avatar.png"} alt="Profile" className="cp-profile-image" />
              )}
            </div>

            <button className="cp-home-btn" onClick={() => navigate("/")}>
              <span className="btn-icon">🏠</span>Home
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="cp-nav-link"><span className="nav-icon">🔑</span>Login</Link>
            <Link to="/register" className="cp-register-btn"><span className="btn-icon">🌱</span>Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default CarpoolNavbar;
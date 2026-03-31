import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
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
      api.get(`/profile`)
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
  }, [token]);

  return (
    <nav className={`cp-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="cp-navbar-left">
        <Link to="/carpool" className="cp-logo">
          {/* STATIC SVG LOGO - Matches GreenTrail Style */}
          <span className="cp-logo-icon">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </span>
          <span className="cp-logo-text">EcoRide</span>
        </Link>
      </div>

      <div className="cp-navbar-center">
        <Link to="/ride/find" className="cp-nav-link">
          <span className="cp-nav-icon">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          </span>
          Find Ride
        </Link>
        <Link to="/ride/offer" className="cp-nav-link">
          <span className="cp-nav-icon">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </span>
          Offer Ride
        </Link>
        <Link to="/my-trips" className="cp-nav-link">
          <span className="cp-nav-icon">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
          </span>
          My Trips
        </Link>
        <Link to="/ev-stations" className="cp-nav-link">
          <span className="cp-nav-icon">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
          </span>
          EV Stations
        </Link>
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
              <span className="cp-btn-icon">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
              </span>
              Home
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="cp-nav-link">Login</Link>
            <Link to="/register" className="cp-register-btn">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default CarpoolNavbar;
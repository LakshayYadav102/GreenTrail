import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import "./FoodWasteNavbar.css";

const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function FoodWasteNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  
  const [scrolled, setScrolled] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const isActive = (path) => {
    // Exact match for home, startsWith for others to keep active state on subpages
    if (path === "/food-waste") {
      return location.pathname === "/food-waste" || location.pathname === "/food-waste/" ? "active" : "";
    }
    return location.pathname.startsWith(path) ? "active" : "";
  };

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
    <nav className={`fw-navbar ${scrolled ? 'scrolled' : ''}`}>
      
      {/* LEFT: Logo linking to Food Waste Home */}
      <div className="fw-navbar-left">
        <div className="fw-logo" onClick={() => navigate("/food-waste")}>
          <span className="fw-logo-icon">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a50.297 50.297 0 00-8.625-2.191m4.125 4.691V21M3.75 21v-2.25" />
            </svg>
          </span>
          <span className="fw-logo-text">FoodRescue</span>
        </div>
      </div>

      {/* CENTER: Navigation Links */}
      <div className="fw-navbar-center">
        <div className={`fw-nav-item ${isActive("/food-waste/donate")}`} onClick={() => navigate("/food-waste/donate")}>
          Donate Food
        </div>
        <div className={`fw-nav-item ${isActive("/food-waste/require")}`} onClick={() => navigate("/food-waste/require")}>
          Need Food
        </div>
        <div className={`fw-nav-item ${isActive("/food-waste/my-donations")}`} onClick={() => navigate("/food-waste/my-donations")}>
          My Donations
        </div>
        {/* Profile link moved to the circle icon on the right, keeping center clean */}
      </div>

      {/* RIGHT: Profile & Home */}
      <div className="fw-navbar-right">
        {token ? (
          <>
            <div className="fw-profile-circle" onClick={() => navigate("/food-waste/profile")}>
              {loadingProfile ? (
                <div className="fw-profile-spinner"></div>
              ) : (
                <img src={profilePic || "/default-avatar.png"} alt="Profile" className="fw-profile-image" />
              )}
            </div>

            <button className="fw-home-btn" onClick={() => navigate("/")}>
              <span className="fw-btn-icon">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </span>
              Home
            </button>
          </>
        ) : (
          <button className="fw-login-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default FoodWasteNavbar;
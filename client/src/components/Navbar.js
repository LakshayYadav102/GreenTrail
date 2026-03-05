import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

// 🟢 FIX: Added dynamic API base URL so it doesn't break in production
const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Navbar = () => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState("/default-avatar.png");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${apiBaseUrl}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.profilePic) {
          // 🟢 FIX: Check if it's already a full Cloudinary URL
          const picUrl = response.data.profilePic;
          setProfilePic(picUrl.startsWith('http') ? picUrl : `${apiBaseUrl}${picUrl}`);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfilePic();
  }, []);

  return (
    <nav className="navbar-container">
      <button className="nav-brand" onClick={() => navigate("/dashboard")}>
        GreenTrail
      </button>
      
      <div className="nav-buttons">
        <button className="nav-button" onClick={() => navigate("/challenges")}>
          <span className="nav-icon">🌍</span>
          <span className="nav-text">Challenges</span>
        </button>
        
        <button className="nav-button" onClick={() => navigate("/game-loading")}>
          <span className="nav-icon">🎮</span>
          <span className="nav-text">Games</span>
        </button>

        <div className="profile-circle" onClick={() => navigate("/profile", { state: { from: 'greentrail' } })}>
          {loading ? (
            <div className="profile-spinner">
              <div className="spinner-border text-light" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <img src={profilePic} alt="Profile" className="profile-image" />
          )}
        </div>

        <button className="nav-button" onClick={() => navigate("/")}>
          <span className="nav-icon">🏠</span>
          <span className="nav-text">Home</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
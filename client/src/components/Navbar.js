import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState("/default-avatar.png");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.profilePic) {
          setProfilePic(`http://localhost:5000${response.data.profilePic}`);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfilePic();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <nav className="navbar-container">
      <button className="nav-brand" onClick={() => navigate("/")}>
        GreenTrail
      </button>
      
      <div className="nav-buttons">
        <button 
          className="nav-button"
          onClick={() => navigate("/challenges")}
        >
          <span className="nav-icon">🌍</span>
          <span className="nav-text">Challenges</span>
        </button>
        
        <button 
          className="nav-button"
          onClick={() => navigate("/game-loading")}
        >
          <span className="nav-icon">🎮</span>
          <span className="nav-text">Games</span>
        </button>

        <div className="profile-circle" onClick={() => navigate("/profile")}>
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

        <button 
          className="nav-button logout-btn"
          onClick={handleLogout}
        >
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CorporateNavbar.css";

function CorporateNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/corporate-dashboard",
      icon: "📊"
    },
    {
      label: "Verification Hub",
      path: "/corporate-verification",
      icon: "🛡️"
    },
    {
      label: "Facility Calculator",
      path: "/corporate-facility",
      icon: "🏢"
    }
  ];

  return (
    <div className="corp-navbar">

      <div className="corp-logo">
        🌍 GreenVerse ESG
      </div>

      <div className="corp-nav-links">

        {navItems.map((item) => (
          <button
            key={item.path}
            className={`corp-nav-btn ${
              location.pathname === item.path
                ? "active"
                : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}

      </div>

      <button
        className="corp-logout-btn"
        onClick={handleLogout}
      >
        🚪 Logout
      </button>

    </div>
  );
}

export default CorporateNavbar;
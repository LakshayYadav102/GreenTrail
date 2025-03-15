import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CarbonCalculator from "./components/CarbonCalculator";
import UserActivity from "./components/UserActivity";
import Navbar from "./components/Navbar";
import LoadingScreen from "./components/LoadingScreen";
import GameLoadingScreen from "./games/GameLoadingScreen";
import FunGamesPage from "./games/FunGamesPage"; // Ensure this is correct
import RecycleRush from "./games/RecycleRush";
import EcoQuiz from "./games/EcoQuiz";
import EcoRunner from "./games/EcoRunner";
import Challenges from "./components/Challenges"; // ✅ Import Challenges Page
import ProfilePage from "./pages/ProfilePage";

const AppContent = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    }
  }, [location]);

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleAuthChange);
    return () => window.removeEventListener("storage", handleAuthChange);
  }, []);

  // 🔹 Hide Navbar on Home, Login, and Register pages
  const hideNavbarPages = ["/", "/login", "/register"];
  const shouldShowNavbar = isLoggedIn && !hideNavbarPages.includes(location.pathname);

  return (
    <>
      {loading ? (
        <LoadingScreen />
      ) : (
        <>
          {shouldShowNavbar && <Navbar />}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            {isLoggedIn && (
              <>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/track" element={<CarbonCalculator />} />
                <Route path="/user-activity" element={<UserActivity />} />
                <Route path="/games" element={<FunGamesPage />} /> {/* ✅ Fixed route */}
                <Route path="/games/recycle-rush" element={<RecycleRush />} />
                <Route path="/games/eco-quiz" element={<EcoQuiz />} />
                <Route path="/game-loading" element={<GameLoadingScreen />} /> 
                <Route path="/games/eco-runner" element={<EcoRunner />} />
                <Route path="/challenges" element={<Challenges />} /> {/* ✅ Added Challenges Route */}
                <Route path="/profile" element={<ProfilePage />} />

              </>
            )}
          </Routes>
        </>
      )}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;

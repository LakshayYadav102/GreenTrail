import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import api from "./services/api"; 

// Navbars
import GreenverseNavbar from "./components/GreenverseNavbar";
import CarpoolNavbar from "./components/carpooling/CarpoolNavbar";
import Navbar from "./components/Navbar";

// Pages
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CarbonCalculator from "./components/CarbonCalculator";
import UserActivity from "./components/UserActivity";
import GameLoadingScreen from "./games/GameLoadingScreen";
import FunGamesPage from "./games/FunGamesPage";
import RecycleRush from "./games/RecycleRush";
import EcoQuiz from "./games/EcoQuiz";
import EcoRunner from "./games/EcoRunner";
import Challenges from "./components/Challenges";
import ProfilePage from "./pages/ProfilePage";
import BlogList from "./components/blogs/BlogList";
import BlogDetails from "./components/blogs/BlogDetails";
import BlogEditor from "./components/blogs/BlogEditor";
import DonationPage from "./pages/DonationPage";
import GreenverseHomePage from "./pages/GreenverseHomePage";
import DashboardCarpool from "./pages/carpooling/DashboardCarpool";
import OfferRide from "./pages/carpooling/OfferRide";
import FindRide from "./pages/carpooling/FindRide";
import RideDetails from "./pages/carpooling/RideDetails";
import MyTrips from "./pages/carpooling/MyTrips";
import EVStations from "./components/carpooling/EVStations";
import RideRequest from "./pages/carpooling/RideRequest";
import EcoStoreHomePage from "./pages/store/EcoStoreHomePage"; 
import FoodWasteHomePage from "./pages/foodwaste/FoodWasteHomePage"; 
import EcoLearnHomePage from "./pages/ecolearn/EcoLearnHomePage"; 
import EcoLearnRoutes from "./pages/ecolearn/EcoLearnRoutes";
import FoodWasteRoutes from "./pages/foodwaste/FoodWasteRoutes";
import WalletPage from "./pages/WalletPage";
import EcoStoreOrders from "./pages/store/EcoStoreOrders";

// Global Components
import Chatbot from "./components/Chatbot"; // <-- IMPORTED CHATBOT HERE

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (location.pathname === '/login' || location.pathname === '/register') {
        setIsInitialLoad(false);
        return;
      }

      if (token) {
        try {
          await api.get('/profile'); 
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setIsLoggedIn(false);
          navigate('/');
        }
      } else {
        setIsLoggedIn(false);
        if (isInitialLoad) {
          navigate('/');
        }
      }
      setIsInitialLoad(false);
    };

    validateToken();

    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [navigate, location.pathname, isInitialLoad]);

  const hideNavbarPages = ['/login', '/register'];
  const carpoolPaths = ['/carpool', '/ride', '/my-trips', '/ev-stations'];
  const greenTrailPaths = [
    '/dashboard', '/track', '/user-activity', '/games', '/game-loading',
    '/games/recycle-rush', '/games/eco-quiz', '/games/eco-runner',
    '/challenges', '/donation'
  ];
  
  const isEcoLearnPath = location.pathname.startsWith('/ecolearn'); 
  const isFoodWastePath = location.pathname.startsWith('/foodwaste') || location.pathname.startsWith('/food-waste');

  let NavbarComponent = null;

  if (!hideNavbarPages.includes(location.pathname) && !isEcoLearnPath && !isFoodWastePath) {
    if (location.pathname === '/profile') {
      const source = location.state?.from || sessionStorage.getItem('lastContext');
      if (source === 'carpool') {
        NavbarComponent = CarpoolNavbar;
      } else if (source === 'greentrail') {
        NavbarComponent = Navbar;
      } else {
        NavbarComponent = GreenverseNavbar;
      }
    } else {
      if (carpoolPaths.some(path => location.pathname.startsWith(path))) {
        NavbarComponent = CarpoolNavbar;
        sessionStorage.setItem('lastContext', 'carpool');
      } else if (greenTrailPaths.some(path => location.pathname.startsWith(path)) && isLoggedIn) {
        NavbarComponent = Navbar;
        sessionStorage.setItem('lastContext', 'greentrail');
      } else {
        NavbarComponent = GreenverseNavbar;
        sessionStorage.setItem('lastContext', 'greenverse');
      }
    }
  }

  useEffect(() => {
    if (NavbarComponent) {
      document.body.style.paddingTop = 'var(--navbar-height)';
    } else {
      document.body.style.paddingTop = '0';
    }
  }, [NavbarComponent]);

  return (
    <>
      {NavbarComponent && <NavbarComponent />}
      <Routes>
        <Route path="/" element={<GreenverseHomePage />} />
        <Route path="/old-home" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/store" element={<EcoStoreHomePage />} />
        <Route path="/foodwaste" element={<FoodWasteHomePage />} />
        <Route path="/ecolearn" element={<EcoLearnHomePage />} />
        {isLoggedIn && (
          <>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/track" element={<CarbonCalculator />} />
            <Route path="/user-activity" element={<UserActivity />} />
            <Route path="/games" element={<FunGamesPage />} />
            <Route path="/games/recycle-rush" element={<RecycleRush />} />
            <Route path="/games/eco-quiz" element={<EcoQuiz />} />
            <Route path="/game-loading" element={<GameLoadingScreen />} />
            <Route path="/games/eco-runner" element={<EcoRunner />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/donation" element={<DonationPage />} />
            <Route path="/blogs" element={<BlogList />} />
            <Route path="/blogs/:id" element={<BlogDetails />} />
            <Route path="/blogs/create" element={<BlogEditor />} />
            <Route path="/carpool" element={<DashboardCarpool />} />
            <Route path="/ride/offer" element={<OfferRide />} />
            <Route path="/ride/find" element={<FindRide />} />
            <Route path="/ride/:id" element={<RideDetails />} />
            <Route path="/my-trips" element={<MyTrips />} />
            <Route path="/ev-stations" element={<EVStations />} />
            <Route path="/ride/request" element={<RideRequest />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/food-waste/*" element={<FoodWasteRoutes />} />
            <Route path="/ecolearn/*" element={<EcoLearnRoutes />} />
            <Route path="/store/orders" element={<EcoStoreOrders />} />
          </>
        )}
      </Routes>
      
      {/* GLOBAL CHATBOT - Rendered on every page */}
      <Chatbot />
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
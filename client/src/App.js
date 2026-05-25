import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom";
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
import CorporateDashboard from './pages/CorporateDashboard';

// Global Components
import Chatbot from "./components/Chatbot";

// 🟡 Route guard: blocks User C from consumer routes, redirects to their dashboard
const ProtectedConsumerRoute = ({ children }) => {
  const userRole = localStorage.getItem('userRole');
  if (userRole === 'auditor') {
    return <Navigate to="/corporate-dashboard" replace />;
  }
  return children;
};

// 🟡 Route guard: blocks non-auditors from the corporate dashboard
const ProtectedAuditorRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (userRole !== 'auditor') {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');

      // Skip validation on auth pages
      if (location.pathname === '/login' || location.pathname === '/register') {
        setIsInitialLoad(false);
        return;
      }

      if (token) {
        try {
          await api.get('/profile');
          setIsLoggedIn(true);
        } catch (error) {
          const status = error.response?.status;

          if (!error.response) {
            // Server offline / Render sleeping — keep session, don't wipe token
            console.warn('Server unreachable during token validation – keeping session.');
            setIsLoggedIn(true);
          } else if (status === 401 || status === 403) {
            // Token genuinely expired or invalid — force logout
            console.warn('Token rejected by server – logging out.');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userRole');
            localStorage.removeItem('companyName');
            setIsLoggedIn(false);
            navigate('/');
          } else {
            // Unexpected server error — keep session
            console.warn(`Unexpected status ${status} during validation – keeping session.`);
            setIsLoggedIn(true);
          }
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

    // Keep auth state in sync across tabs and after login/logout
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
  const isFoodWastePath =
    location.pathname.startsWith('/foodwaste') ||
    location.pathname.startsWith('/food-waste');

  // 🟡 User C gets NO external navbar — their dashboard has its own GreenverseNavbar
  const isCorporateDashboard = location.pathname === '/corporate-dashboard';

  let NavbarComponent = null;

  if (
    !hideNavbarPages.includes(location.pathname) &&
    !isEcoLearnPath &&
    !isFoodWastePath &&
    !isCorporateDashboard  // 🟡 suppress global navbar for User C
  ) {
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
    document.body.style.paddingTop = NavbarComponent ? 'var(--navbar-height)' : '0';
  }, [NavbarComponent]);

  return (
    <>
      {NavbarComponent && <NavbarComponent />}
      <Routes>
        {/* ── PUBLIC ROUTES ── */}
        <Route path="/" element={<GreenverseHomePage />} />
        <Route path="/old-home" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/store" element={<EcoStoreHomePage />} />
        <Route path="/foodwaste" element={<FoodWasteHomePage />} />
        <Route path="/ecolearn" element={<EcoLearnHomePage />} />

        {/* ── USER C EXCLUSIVE ROUTE (auditor only) ── */}
        <Route
          path="/corporate-dashboard"
          element={
            <ProtectedAuditorRoute>
              <CorporateDashboard />
            </ProtectedAuditorRoute>
          }
        />

        {/* ── USER A + B PROTECTED ROUTES (logged in, non-auditor) ── */}
        {isLoggedIn && (
          <>
            <Route path="/dashboard" element={<ProtectedConsumerRoute><DashboardPage /></ProtectedConsumerRoute>} />
            <Route path="/track" element={<ProtectedConsumerRoute><CarbonCalculator /></ProtectedConsumerRoute>} />
            <Route path="/user-activity" element={<ProtectedConsumerRoute><UserActivity /></ProtectedConsumerRoute>} />
            <Route path="/games" element={<ProtectedConsumerRoute><FunGamesPage /></ProtectedConsumerRoute>} />
            <Route path="/games/recycle-rush" element={<ProtectedConsumerRoute><RecycleRush /></ProtectedConsumerRoute>} />
            <Route path="/games/eco-quiz" element={<ProtectedConsumerRoute><EcoQuiz /></ProtectedConsumerRoute>} />
            <Route path="/game-loading" element={<ProtectedConsumerRoute><GameLoadingScreen /></ProtectedConsumerRoute>} />
            <Route path="/games/eco-runner" element={<ProtectedConsumerRoute><EcoRunner /></ProtectedConsumerRoute>} />
            <Route path="/challenges" element={<ProtectedConsumerRoute><Challenges /></ProtectedConsumerRoute>} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/donation" element={<ProtectedConsumerRoute><DonationPage /></ProtectedConsumerRoute>} />
            <Route path="/blogs" element={<ProtectedConsumerRoute><BlogList /></ProtectedConsumerRoute>} />
            <Route path="/blogs/:id" element={<ProtectedConsumerRoute><BlogDetails /></ProtectedConsumerRoute>} />
            <Route path="/blogs/create" element={<ProtectedConsumerRoute><BlogEditor /></ProtectedConsumerRoute>} />
            <Route path="/carpool" element={<ProtectedConsumerRoute><DashboardCarpool /></ProtectedConsumerRoute>} />
            <Route path="/ride/offer" element={<ProtectedConsumerRoute><OfferRide /></ProtectedConsumerRoute>} />
            <Route path="/ride/find" element={<ProtectedConsumerRoute><FindRide /></ProtectedConsumerRoute>} />
            <Route path="/ride/:id" element={<ProtectedConsumerRoute><RideDetails /></ProtectedConsumerRoute>} />
            <Route path="/my-trips" element={<ProtectedConsumerRoute><MyTrips /></ProtectedConsumerRoute>} />
            <Route path="/ev-stations" element={<ProtectedConsumerRoute><EVStations /></ProtectedConsumerRoute>} />
            <Route path="/ride/request" element={<ProtectedConsumerRoute><RideRequest /></ProtectedConsumerRoute>} />
            <Route path="/wallet" element={<ProtectedConsumerRoute><WalletPage /></ProtectedConsumerRoute>} />
            <Route path="/food-waste/*" element={<ProtectedConsumerRoute><FoodWasteRoutes /></ProtectedConsumerRoute>} />
            <Route path="/ecolearn/*" element={<ProtectedConsumerRoute><EcoLearnRoutes /></ProtectedConsumerRoute>} />
            <Route path="/store/orders" element={<ProtectedConsumerRoute><EcoStoreOrders /></ProtectedConsumerRoute>} />
          </>
        )}
      </Routes>

      {/* GLOBAL CHATBOT - hide on corporate dashboard for clean auditor UI */}
      {!isCorporateDashboard && <Chatbot />}
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
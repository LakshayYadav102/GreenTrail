import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import FoodWasteHomePage from "./FoodWasteHomePage";
import DonateFoodDashboard from "./DonateFoodDashboard";
import RequireFoodDashboard from "./RequireFoodDashboard";
import HouseholdDonationForm from "./HouseholdDonationForm";
import EventDonationForm from "./EventDonationForm";
import AvailableFood from "./AvailableFood";
import FoodWasteNGOMap from "./FoodWasteNGOMap";
import MyDonationsPage from "./MyDonationsPage";
import MyReceivedFoodPage from "./MyReceivedFoodPage";
import FoodChatPage from "./FoodChatPage";
import FoodWasteProfilePage from "./FoodWasteProfilePage";

// Simple auth guard
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function FoodWasteRoutes() {
  return (
    <Routes>
      {/* Entry */}
      <Route path="/" element={<FoodWasteHomePage />} />

      {/* Donate */}
      <Route
        path="/donate"
        element={
          <PrivateRoute>
            <DonateFoodDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/donate/household"
        element={
          <PrivateRoute>
            <HouseholdDonationForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/donate/event"
        element={
          <PrivateRoute>
            <EventDonationForm />
          </PrivateRoute>
        }
      />

      {/* My Donations */}
      <Route
        path="/my-donations"
        element={
          <PrivateRoute>
            <MyDonationsPage />
          </PrivateRoute>
        }
      />

      {/* Require / Available / Received / Chat */}
      <Route
        path="/require"
        element={
          <PrivateRoute>
            <RequireFoodDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/available"
        element={
          <PrivateRoute>
            <AvailableFood />
          </PrivateRoute>
        }
      />
      <Route
        path="/received"
        element={
          <PrivateRoute>
            <MyReceivedFoodPage />
          </PrivateRoute>
        }
      />
      <Route
  path="/profile"
  element={
    <PrivateRoute>
      <FoodWasteProfilePage />
    </PrivateRoute>
  }
/>
      <Route
        path="/chat/:donationId"
        element={
          <PrivateRoute>
            <FoodChatPage />
          </PrivateRoute>
        }
      />

      {/* NGO Map */}
      <Route
        path="/ngos"
        element={
          <PrivateRoute>
            <FoodWasteNGOMap />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default FoodWasteRoutes;
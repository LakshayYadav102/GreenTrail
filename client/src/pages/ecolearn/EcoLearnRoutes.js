import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import EcoLearnFeed from "./EcoLearnFeed";
import EcoLearnUpload from "./EcoLearnUpload";
import EcoLearnExplore from "./EcoLearnExplore";
import CreatorProfile from "./CreatorProfile";
import EcoLearnBottomNav from "./EcoLearnBottomNav"; // <-- Import our new Nav

function EcoLearnRoutes() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100dvh", overflow: "hidden" }}>
      <Routes>
        <Route path="/" element={<Navigate to="/ecolearn/feed" replace />} />
        <Route path="/feed" element={<EcoLearnFeed />} />
        <Route path="/upload" element={<EcoLearnUpload />} />
        <Route path="/explore" element={<EcoLearnExplore />} />
        <Route path="/creator/:userId" element={<CreatorProfile />} />
      </Routes>

      {/* The Bottom Nav is now global for all EcoLearn routes! */}
      <EcoLearnBottomNav />
    </div>
  );
}

export default EcoLearnRoutes;